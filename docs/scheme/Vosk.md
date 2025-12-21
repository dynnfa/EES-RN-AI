# Vosk 离线语音识别技术方案

> **集成方式说明**: 本方案采用**直接集成**策略,所有代码直接实现在 `EES-RN-AI` 项目中,无需创建独立的 npm 包或额外封装层。Native 模块代码位于 `ios/EESRNAI/Vosk/` 和 `android/app/src/main/java/com/eesrnai/vosk/`,业务层代码位于 `hooks/`、`components/voice/` 和 `services/` 目录。

## 1. Critical Performance Audit (架构决策)

### 1.1 为什么必须在 Native 层处理

- **Bridge 序列化成本**: 音频流数据如果通过 JS Bridge 传输,会造成每秒数百次的序列化/反序列化,导致:
  - 主线程阻塞 (尤其是低端 Android 设备)
  - 延迟累积 (16ms 帧预算被侵蚀)
  - 内存峰值 (音频 Buffer 的重复拷贝)
- **实时性要求**: 语音识别需要 <100ms 的响应时间,JS 线程的 Event Loop 延迟无法保证
- **电量优化**: Native 层可以直接访问硬件 Audio Session,避免不必要的唤醒和上下文切换

### 1.2 TurboModules vs Old Bridge

| 特性     | Old Bridge  | TurboModules          |
| -------- | ----------- | --------------------- |
| 同步调用 | ❌          | ✅ (JSI)              |
| 类型安全 | ❌ (运行时) | ✅ (Codegen 静态检查) |
| 启动时间 | 延迟加载    | 按需加载              |
| 内存占用 | 全局注册    | 惰性初始化            |

**结论**: TurboModules 是唯一选择,避免异步回调地狱并保证类型契约。

---

## 2. Engineering Solution (架构设计)

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                   JS Business Layer                  │
│  ┌────────────────────────────────────────────────┐ │
│  │   useVoskRecognition() Hook                    │ │
│  │   - start/stop/pause 状态管理                   │ │
│  │   - onResult callback 封装                      │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                          ↕ (JSI - 同步调用)
┌─────────────────────────────────────────────────────┐
│              VoskTurboModule (TypeScript Spec)       │
│  ┌────────────────────────────────────────────────┐ │
│  │ interface Spec extends TurboModule {           │ │
│  │   initialize(modelPath: string): Promise<bool> │ │
│  │   startRecognition(): void                     │ │
│  │   stopRecognition(): Promise<string>           │ │
│  │   addListener(eventName: string): void         │ │
│  │ }                                               │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                          ↕ (Codegen)
┌─────────────────────────────────────────────────────┐
│              Native Implementation                   │
│  iOS (Swift)              Android (Kotlin)          │
│  ┌──────────────────┐   ┌──────────────────┐       │
│  │ VoskRecognizer   │   │ VoskRecognizer   │       │
│  │ - AVAudioEngine  │   │ - AudioRecord    │       │
│  │ - Model loader   │   │ - Model loader   │       │
│  │ - Thread pool    │   │ - Coroutine ctx  │       │
│  └──────────────────┘   └──────────────────┘       │
└─────────────────────────────────────────────────────┘
                          ↕
                   [Vosk C++ Core]
                   - Model inference
                   - Acoustic processing
```

### 2.2 数据流设计

```
Audio Input → Native Buffer → Vosk Engine → Partial Results
                   ↓                              ↓
            (No Bridge Cross)              Event Emitter
                   ↓                              ↓
           Native Processing           JS Layer (Final String)
```

**关键约束**:

1. **音频数据永不跨桥**: Buffer 在 Native 层循环复用
2. **只传输文本结果**: 仅在识别完成后发送最终字符串 (减少 95% 的桥接流量)
3. **背压控制**: 如果 JS 层消费慢,Native 层暂停音频采集

---

## 3. Implementation Details (代码实现)

### 3.1 TurboModule Spec Definition

**文件**: `modules/vosk-recognizer/NativeVoskRecognizer.ts` (项目内置模块)

```typescript
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface VoskRecognitionResult {
  text: string;
  confidence: number; // 0-1
  isFinal: boolean;
}

export interface VoskConfig {
  modelPath: string;
  sampleRate?: number; // 默认 16000
  maxAlternatives?: number; // 默认 1
  enablePartialResults?: boolean; // 是否返回中间结果
}

export interface Spec extends TurboModule {
  /**
   * 初始化 Vosk 模型 (异步,模型加载耗时)
   * @throws Error 如果模型路径无效或加载失败
   */
  initialize(config: VoskConfig): Promise<boolean>;

  /**
   * 开始录音识别 (同步返回,后台启动音频线程)
   */
  startRecognition(): void;

  /**
   * 停止录音并返回最终结果
   */
  stopRecognition(): Promise<string>;

  /**
   * 暂停/恢复识别
   */
  pauseRecognition(): void;
  resumeRecognition(): void;

  /**
   * 清理资源 (释放模型和音频会话)
   */
  destroy(): void;

  /**
   * 添加事件监听器 (TurboModule 事件系统)
   * 事件名: 'onPartialResult' | 'onFinalResult' | 'onError'
   */
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('VoskRecognizer');
```

### 3.2 iOS Native Implementation (Swift)

**文件**: `ios/EESRNAI/Vosk/VoskRecognizerModule.swift` (直接集成到项目原生代码)

```swift
import AVFoundation
import Vosk

@objc(VoskRecognizerModule)
class VoskRecognizerModule: RCTEventEmitter {

    // MARK: - Properties

    private var recognizer: VoskRecognizer?
    private var model: VoskModel?
    private var audioEngine: AVAudioEngine?
    private var recognitionQueue: DispatchQueue

    private var isRecognizing = false
    private var partialResultBuffer = ""

    // MARK: - Initialization

    override init() {
        // 专用队列避免阻塞主线程
        self.recognitionQueue = DispatchQueue(
            label: "com.eesrnai.vosk.recognition",
            qos: .userInitiated // 高优先级但不抢占主线程
        )
        super.init()
    }

    // MARK: - TurboModule Methods

    @objc
    func initialize(
        _ config: [String: Any],
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        recognitionQueue.async { [weak self] in
            guard let self = self else { return }

            guard let modelPath = config["modelPath"] as? String else {
                reject("INVALID_CONFIG", "modelPath is required", nil)
                return
            }

            do {
                // 验证模型路径
                guard FileManager.default.fileExists(atPath: modelPath) else {
                    throw NSError(
                        domain: "VoskRecognizer",
                        code: -1,
                        userInfo: [NSLocalizedDescriptionKey: "Model not found"]
                    )
                }

                // 加载模型 (CPU 密集型操作)
                self.model = try VoskModel(path: modelPath)

                let sampleRate = config["sampleRate"] as? Float ?? 16000.0
                self.recognizer = try VoskRecognizer(
                    model: self.model!,
                    sampleRate: sampleRate
                )

                // 配置可选参数
                if let maxAlternatives = config["maxAlternatives"] as? Int {
                    self.recognizer?.setMaxAlternatives(maxAlternatives)
                }

                if let enablePartial = config["enablePartialResults"] as? Bool, enablePartial {
                    self.recognizer?.setPartialWords(true)
                }

                resolve(true)

            } catch {
                reject("INIT_FAILED", error.localizedDescription, error)
            }
        }
    }

    @objc
    func startRecognition() {
        guard recognizer != nil else {
            sendEvent(
                withName: "onError",
                body: ["message": "Recognizer not initialized"]
            )
            return
        }

        recognitionQueue.async { [weak self] in
            self?.setupAudioEngine()
        }
    }

    @objc
    func stopRecognition(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        recognitionQueue.async { [weak self] in
            guard let self = self else { return }

            self.isRecognizing = false
            self.audioEngine?.stop()
            self.audioEngine?.inputNode.removeTap(onBus: 0)

            // 获取最终结果
            guard let finalResult = self.recognizer?.final() else {
                reject("NO_RESULT", "Failed to get final result", nil)
                return
            }

            // 解析 JSON 结果
            if let data = finalResult.data(using: .utf8),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let text = json["text"] as? String {
                resolve(text)
            } else {
                resolve("")
            }
        }
    }

    // MARK: - Audio Engine Setup

    private func setupAudioEngine() {
        audioEngine = AVAudioEngine()

        guard let audioEngine = audioEngine else { return }

        let inputNode = audioEngine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)

        // 配置音频会话
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.record, mode: .measurement, options: .duckOthers)
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            sendEvent(withName: "onError", body: ["message": error.localizedDescription])
            return
        }

        // 安装音频 Tap (关键性能点)
        inputNode.installTap(
            onBus: 0,
            bufferSize: 4096, // 避免过小导致频繁回调
            format: inputFormat
        ) { [weak self] buffer, _ in
            guard let self = self, self.isRecognizing else { return }

            // 转换为 Vosk 所需的 PCM 格式
            guard let channelData = buffer.int16ChannelData else { return }
            let channelDataPointer = channelData[0]
            let frameLength = Int(buffer.frameLength)

            // 直接传入 C++ 层,无需序列化
            let data = Data(
                bytes: channelDataPointer,
                count: frameLength * MemoryLayout<Int16>.size
            )

            // 异步识别避免阻塞音频线程
            self.recognitionQueue.async {
                self.processAudioData(data)
            }
        }

        audioEngine.prepare()

        do {
            try audioEngine.start()
            isRecognizing = true
        } catch {
            sendEvent(withName: "onError", body: ["message": error.localizedDescription])
        }
    }

    private func processAudioData(_ data: Data) {
        guard let recognizer = recognizer else { return }

        data.withUnsafeBytes { rawBufferPointer in
            let bufferPointer = rawBufferPointer.bindMemory(to: Int16.self)
            let accept = recognizer.acceptWaveform(data: bufferPointer.baseAddress!, length: data.count / 2)

            if accept {
                // 最终结果
                if let result = recognizer.result(),
                   let data = result.data(using: .utf8),
                   let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let text = json["text"] as? String, !text.isEmpty {

                    DispatchQueue.main.async {
                        self.sendEvent(
                            withName: "onFinalResult",
                            body: ["text": text, "confidence": json["confidence"] ?? 1.0]
                        )
                    }
                }
            } else {
                // 中间结果 (可选)
                if let partial = recognizer.partialResult(),
                   let data = partial.data(using: .utf8),
                   let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let text = json["partial"] as? String, text != partialResultBuffer {

                    partialResultBuffer = text

                    DispatchQueue.main.async {
                        self.sendEvent(
                            withName: "onPartialResult",
                            body: ["text": text]
                        )
                    }
                }
            }
        }
    }

    // MARK: - Event Emitter

    override func supportedEvents() -> [String]! {
        return ["onPartialResult", "onFinalResult", "onError"]
    }

    override class func requiresMainQueueSetup() -> Bool {
        return false // 避免阻塞启动
    }

    deinit {
        audioEngine?.stop()
        recognizer = nil
        model = nil
    }
}
```

### 3.3 Android Native Implementation (Kotlin)

**文件**: `android/app/src/main/java/com/eesrnai/vosk/VoskRecognizerModule.kt` (直接集成到项目原生代码)

```kotlin
package com.eesrnai.vosk

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import org.vosk.Model
import org.vosk.Recognizer
import org.vosk.android.RecognitionListener
import java.io.File

class VoskRecognizerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "VoskRecognizer"
        private const val SAMPLE_RATE = 16000
        private const val BUFFER_SIZE = 8192
    }

    private var model: Model? = null
    private var recognizer: Recognizer? = null
    private var audioRecord: AudioRecord? = null

    // 协程上下文 (避免阻塞主线程)
    private val recognitionScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var recognitionJob: Job? = null

    private var isRecognizing = false

    override fun getName(): String = NAME

    // MARK: - TurboModule Methods

    @ReactMethod
    fun initialize(config: ReadableMap, promise: Promise) {
        recognitionScope.launch {
            try {
                val modelPath = config.getString("modelPath")
                    ?: throw IllegalArgumentException("modelPath is required")

                // 验证模型
                val modelFile = File(modelPath)
                if (!modelFile.exists()) {
                    throw IllegalArgumentException("Model not found: $modelPath")
                }

                // 加载模型 (IO 密集型)
                model = Model(modelPath)

                val sampleRate = config.getInt("sampleRate").takeIf { it > 0 } ?: SAMPLE_RATE
                recognizer = Recognizer(model, sampleRate.toFloat())

                // 可选配置
                if (config.hasKey("maxAlternatives")) {
                    recognizer?.setMaxAlternatives(config.getInt("maxAlternatives"))
                }

                if (config.hasKey("enablePartialResults") && config.getBoolean("enablePartialResults")) {
                    recognizer?.setPartialWords(true)
                }

                promise.resolve(true)

            } catch (e: Exception) {
                promise.reject("INIT_FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun startRecognition() {
        if (recognizer == null) {
            sendEvent("onError", Arguments.createMap().apply {
                putString("message", "Recognizer not initialized")
            })
            return
        }

        recognitionJob = recognitionScope.launch {
            try {
                setupAudioRecord()
            } catch (e: Exception) {
                sendEvent("onError", Arguments.createMap().apply {
                    putString("message", e.message)
                })
            }
        }
    }

    @ReactMethod
    fun stopRecognition(promise: Promise) {
        recognitionScope.launch {
            try {
                isRecognizing = false
                recognitionJob?.cancel()
                audioRecord?.stop()
                audioRecord?.release()
                audioRecord = null

                // 获取最终结果
                val finalResult = recognizer?.finalResult() ?: ""
                val text = parseFinalResult(finalResult)

                promise.resolve(text)

            } catch (e: Exception) {
                promise.reject("STOP_FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun destroy() {
        recognitionScope.cancel()
        audioRecord?.release()
        recognizer?.close()
        model?.close()
    }

    // MARK: - Audio Recording

    private suspend fun setupAudioRecord() = withContext(Dispatchers.IO) {
        val bufferSize = AudioRecord.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        ) * 2 // 2x 缓冲区避免溢出

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.VOICE_RECOGNITION,
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            throw IllegalStateException("Failed to initialize AudioRecord")
        }

        audioRecord?.startRecording()
        isRecognizing = true

        // 音频处理循环
        val buffer = ShortArray(BUFFER_SIZE)
        while (isRecognizing && isActive) {
            val readCount = audioRecord?.read(buffer, 0, buffer.size) ?: 0

            if (readCount > 0) {
                processAudioData(buffer, readCount)
            }
        }
    }

    private fun processAudioData(buffer: ShortArray, length: Int) {
        recognizer?.let { rec ->
            val isFinal = rec.acceptWaveform(buffer, length)

            if (isFinal) {
                // 最终结果
                val result = rec.result()
                val text = parseResult(result, "text")

                if (text.isNotEmpty()) {
                    sendEvent("onFinalResult", Arguments.createMap().apply {
                        putString("text", text)
                        putDouble("confidence", 1.0)
                    })
                }
            } else {
                // 中间结果
                val partial = rec.partialResult()
                val text = parseResult(partial, "partial")

                if (text.isNotEmpty()) {
                    sendEvent("onPartialResult", Arguments.createMap().apply {
                        putString("text", text)
                    })
                }
            }
        }
    }

    // MARK: - Helpers

    private fun parseResult(json: String, key: String): String {
        return try {
            val jsonObject = org.json.JSONObject(json)
            jsonObject.optString(key, "")
        } catch (e: Exception) {
            ""
        }
    }

    private fun parseFinalResult(json: String): String {
        return parseResult(json, "text")
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // TurboModule 事件系统需要
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // TurboModule 事件系统需要
    }
}
```

### 3.4 Business Layer Hook (JS)

**文件**: `hooks/use-vosk-recognition.ts`

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import VoskRecognizer, { type VoskConfig } from '@/modules/vosk-recognizer';

interface UseVoskRecognitionOptions {
  modelPath: string;
  onFinalResult?: (text: string) => void;
  onPartialResult?: (text: string) => void;
  onError?: (error: Error) => void;
  enablePartialResults?: boolean;
}

interface RecognitionState {
  isInitialized: boolean;
  isRecognizing: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useVoskRecognition(options: UseVoskRecognitionOptions) {
  const [state, setState] = useState<RecognitionState>({
    isInitialized: false,
    isRecognizing: false,
    isLoading: false,
    error: null,
  });

  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);
  const listenersRef = useRef<any[]>([]);

  // 初始化
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const config: VoskConfig = {
          modelPath: options.modelPath,
          sampleRate: 16000,
          maxAlternatives: 1,
          enablePartialResults: options.enablePartialResults ?? false,
        };

        const success = await VoskRecognizer.initialize(config);

        if (mounted && success) {
          // 设置事件监听
          const emitter = new NativeEventEmitter(NativeModules.VoskRecognizer);
          eventEmitterRef.current = emitter;

          const finalListener = emitter.addListener('onFinalResult', result => {
            options.onFinalResult?.(result.text);
          });

          const partialListener = emitter.addListener('onPartialResult', result => {
            options.onPartialResult?.(result.text);
          });

          const errorListener = emitter.addListener('onError', error => {
            options.onError?.(new Error(error.message));
            setState(prev => ({ ...prev, isRecognizing: false }));
          });

          listenersRef.current = [finalListener, partialListener, errorListener];

          setState({
            isInitialized: true,
            isRecognizing: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          const err = error instanceof Error ? error : new Error('Unknown error');
          setState({
            isInitialized: false,
            isRecognizing: false,
            isLoading: false,
            error: err,
          });
          options.onError?.(err);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      listenersRef.current.forEach(listener => listener.remove());
      VoskRecognizer.destroy();
    };
  }, [options.modelPath]); // 仅依赖模型路径

  // 开始识别
  const start = useCallback(() => {
    if (!state.isInitialized || state.isRecognizing) {
      return;
    }

    try {
      VoskRecognizer.startRecognition();
      setState(prev => ({ ...prev, isRecognizing: true }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start');
      setState(prev => ({ ...prev, error: err }));
      options.onError?.(err);
    }
  }, [state.isInitialized, state.isRecognizing]);

  // 停止识别
  const stop = useCallback(async (): Promise<string> => {
    if (!state.isRecognizing) {
      return '';
    }

    try {
      const finalText = await VoskRecognizer.stopRecognition();
      setState(prev => ({ ...prev, isRecognizing: false }));
      return finalText;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to stop');
      setState(prev => ({ ...prev, isRecognizing: false, error: err }));
      options.onError?.(err);
      return '';
    }
  }, [state.isRecognizing]);

  return {
    ...state,
    start,
    stop,
  };
}
```

---

## 4. Production Readiness (工程化保障)

### 4.1 Crash Prevention

#### Error Boundaries

```typescript
// components/voice/recognition-error-boundary.tsx
import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RecognitionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 上报到监控系统
    console.error('Recognition Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <View>
          <Text>语音识别服务暂时不可用</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
```

#### Native Module Fallback

```typescript
// modules/vosk-recognizer/index.ts (项目内置模块入口)
import { Platform } from 'react-native';

let VoskRecognizer: any;

try {
  VoskRecognizer = require('./src/NativeVoskRecognizer').default;
} catch (error) {
  // Graceful degradation
  console.warn('Vosk module not available:', error);

  VoskRecognizer = {
    initialize: () => Promise.resolve(false),
    startRecognition: () => {},
    stopRecognition: () => Promise.resolve(''),
    destroy: () => {},
    addListener: () => {},
    removeListeners: () => {},
  };
}

export default VoskRecognizer;
```

### 4.2 Performance Monitoring

#### Flipper Plugin 集成

```typescript
// debug/flipper-vosk-plugin.ts
import { addPlugin } from 'react-native-flipper';

if (__DEV__) {
  addPlugin({
    getId() {
      return 'vosk-recognition';
    },
    onConnect(connection) {
      // 监听识别事件
      connection.send('recognitionStarted', {
        timestamp: Date.now(),
      });
    },
    onDisconnect() {},
    runInBackground() {
      return true;
    },
  });
}
```

#### 关键指标

1. **Model Load Time**: 应 <500ms (记录到 Analytics)
2. **Recognition Latency**: 从音频结束到 `onFinalResult` 应 <100ms
3. **Memory Footprint**: iOS 应 <50MB, Android 应 <80MB (低端机)
4. **Battery Impact**: 连续 1 小时录音应 <5% 电量消耗

#### Xcode Instruments 检查点

- **Time Profiler**: 检查 `processAudioData` 是否阻塞主线程
- **Allocations**: 验证 Buffer 是否正确释放
- **Energy Log**: 确认音频会话的唤醒次数

#### Android Profiler 检查点

```bash
# 记录 CPU 和内存
adb shell am start-profiler com.eesrnai.EESRNAI

# 检查线程调度
adb shell ps -T -p $(adb shell pidof com.eesrnai.EESRNAI)
```

### 4.3 Model Management

#### 模型下载与缓存

```typescript
// services/vosk-model-manager.ts
import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive';

export class VoskModelManager {
  private static readonly MODEL_DIR = `${FileSystem.documentDirectory}vosk-models/`;

  /**
   * 下载并解压模型
   * @param modelUrl 模型 URL (建议使用 CDN)
   * @param language 语言代码 (e.g., 'zh-CN', 'en-US')
   */
  static async downloadModel(modelUrl: string, language: string): Promise<string> {
    const modelZipPath = `${this.MODEL_DIR}${language}.zip`;
    const modelPath = `${this.MODEL_DIR}${language}/`;

    // 检查是否已存在
    const exists = await FileSystem.getInfoAsync(modelPath);
    if (exists.exists) {
      return modelPath;
    }

    // 下载
    const downloadResult = await FileSystem.createDownloadResumable(
      modelUrl,
      modelZipPath,
      {},
      progress => {
        const percent = (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100;
        console.log(`Model download: ${percent.toFixed(0)}%`);
      }
    ).downloadAsync();

    if (!downloadResult) {
      throw new Error('Model download failed');
    }

    // 解压
    await unzip(modelZipPath, modelPath);

    // 清理 zip
    await FileSystem.deleteAsync(modelZipPath);

    return modelPath;
  }
}
```

---

## 5. 集成步骤

### 5.1 依赖安装

#### iOS

```bash
# 在 ios/ 目录下
cd ios

# 添加 Vosk 到 Podfile
echo "pod 'vosk-ios', '~> 0.3.45'" >> Podfile

# 安装
pod install
```

#### Android

```gradle
// android/app/build.gradle
dependencies {
    implementation 'com.alphacephei:vosk-android:0.3.45'
}
```

### 5.2 权限配置

#### iOS (`ios/EESRNAI/Info.plist`)

```xml
<key>NSMicrophoneUsageDescription</key>
<string>需要访问麦克风以实现语音识别功能</string>
```

#### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### 5.3 Codegen 配置

**文件**: `package.json` (项目根目录配置)

在项目根目录的 `package.json` 中添加 `codegenConfig` 配置:

```json
{
  // ... 其他配置
  "codegenConfig": {
    "name": "VoskRecognizerSpec",
    "type": "modules",
    "jsSrcsDir": "modules/vosk-recognizer",
    "android": {
      "javaPackageName": "com.eesrnai.vosk"
    },
    "ios": {}
  }
}
```

**配置说明**:

- `name`: Codegen 生成的 Spec 类名
- `type`: 模块类型 (`modules` 表示 TurboModule)
- `jsSrcsDir`: TypeScript Spec 文件所在目录 (相对于项目根目录)
- `android.javaPackageName`: Android 生成代码的包名
- `ios`: iOS 配置 (使用默认值)

运行 Codegen:

```bash
# 在项目根目录
cd android && ./gradlew generateCodegenArtifactsFromSchema
cd ../ios && RCT_NEW_ARCH_ENABLED=1 pod install
```

### 5.4 业务层示例

```typescript
// app/(tabs)/voice-recognition.tsx (直接集成示例)
import { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { useVoskRecognition } from '@/hooks/use-vosk-recognition';
import { RecognitionErrorBoundary } from '@/components/voice/recognition-error-boundary';

function VoiceRecognitionScreen() {
  const [transcript, setTranscript] = useState('');
  const [partialText, setPartialText] = useState('');

  const { isInitialized, isRecognizing, start, stop } = useVoskRecognition({
    modelPath: '/path/to/vosk-model-small-cn', // 从 ModelManager 获取
    onFinalResult: (text) => {
      setTranscript((prev) => prev + text + ' ');
      setPartialText('');
    },
    onPartialResult: (text) => {
      setPartialText(text);
    },
    onError: (error) => {
      console.error('Recognition error:', error);
    },
    enablePartialResults: true,
  });

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>最终结果: {transcript}</Text>
      <Text style={{ color: 'gray' }}>识别中: {partialText}</Text>

      <Button
        title={isRecognizing ? '停止' : '开始识别'}
        onPress={isRecognizing ? stop : start}
        disabled={!isInitialized}
      />
    </View>
  );
}

export default function VoiceRecognitionWrapper() {
  return (
    <RecognitionErrorBoundary>
      <VoiceRecognitionScreen />
    </RecognitionErrorBoundary>
  );
}
```

---

## 6. 技术约束与优化建议

### 6.1 模型选择

| 模型                        | 大小  | 准确率 | 实时性 | 推荐场景         |
| --------------------------- | ----- | ------ | ------ | ---------------- |
| vosk-model-small-cn-0.22    | 42MB  | 中等   | 优秀   | 移动端通用       |
| vosk-model-cn-0.22          | 1.3GB | 高     | 一般   | 仅 Tablet/服务器 |
| vosk-model-small-en-us-0.15 | 40MB  | 中等   | 优秀   | 英语场景         |

**建议**: 移动端使用 small 模型,在设备内置存储中预装,避免首次下载。

### 6.2 内存优化

```swift
// iOS: 设置音频会话内存限制
try AVAudioSession.sharedInstance().setPreferredIOBufferDuration(0.005) // 5ms

// Android: 使用更小的缓冲区
val bufferSize = AudioRecord.getMinBufferSize(...) // 不要 * 2
```

### 6.3 低端设备降级策略

```typescript
// 检测设备性能
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

async function shouldEnablePartialResults(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return true; // iOS 设备性能普遍较好
  }

  // Android 低端机禁用中间结果
  const totalMemory = await DeviceInfo.getTotalMemory();
  return totalMemory > 2 * 1024 * 1024 * 1024; // >2GB RAM
}
```

---

## 7. Testing Strategy

### 7.1 单元测试

```typescript
// __tests__/use-vosk-recognition.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useVoskRecognition } from '@/hooks/use-vosk-recognition';

jest.mock('@/modules/vosk-recognizer', () => ({
  initialize: jest.fn(() => Promise.resolve(true)),
  startRecognition: jest.fn(),
  stopRecognition: jest.fn(() => Promise.resolve('test result')),
}));

describe('useVoskRecognition', () => {
  it('should initialize successfully', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useVoskRecognition({ modelPath: '/test/path' })
    );

    await waitForNextUpdate();

    expect(result.current.isInitialized).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
```

### 7.2 集成测试

```bash
# Detox E2E 测试
yarn detox test --configuration ios.sim.debug

# 测试场景:
# 1. 权限请求
# 2. 模型加载
# 3. 录音识别
# 4. 错误恢复
```

---

## 8. Migration Checklist (项目直接集成)

- [ ] 在项目 CocoaPods 中添加 Vosk 依赖 (`ios/Podfile`)
- [ ] 在项目 Gradle 中添加 Vosk 依赖 (`android/app/build.gradle`)
- [ ] 配置麦克风权限 (`Info.plist` / `AndroidManifest.xml`)
- [ ] 在 `modules/vosk-recognizer/` 创建 TurboModule Spec
- [ ] 在 `ios/EESRNAI/Vosk/` 实现 Swift Native Module
- [ ] 在 `android/app/src/main/java/com/eesrnai/vosk/` 实现 Kotlin Native Module
- [ ] 运行 Codegen 生成桥接代码 (项目级别)
- [ ] 在 `hooks/` 创建 `useVoskRecognition` Hook
- [ ] 在 `components/voice/` 集成 Error Boundary
- [ ] 在 `services/` 实现模型管理器
- [ ] 添加性能监控 (Flipper 集成)
- [ ] 编写单元测试 (`__tests__/hooks/use-vosk-recognition.test.ts`)
- [ ] 在真机上测试 (低端 Android 设备)
- [ ] 记录内存和电量消耗 (Xcode Instruments / Android Profiler)
- [ ] 更新项目主文档 (`README.md` / `.github/instructions/`)

---

## 9. References

- [Vosk Official Documentation](https://alphacephei.com/vosk/)
- [React Native TurboModules](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)
- [iOS AVAudioEngine](https://developer.apple.com/documentation/avfaudio/avaudioengine)
- [Android AudioRecord](https://developer.android.com/reference/android/media/AudioRecord)
- [Performance Best Practices](https://reactnative.dev/docs/performance)
