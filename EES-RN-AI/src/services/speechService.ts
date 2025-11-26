import {
  SpeechService,
  SpeechRecognitionResult,
  SpeechRecognitionState,
  TextToSpeechState,
} from "../types";
import { SPEECH_CONFIG } from "../config/env";
import { Platform, PermissionsAndroid } from "react-native";
import * as ExpoSpeech from "expo-speech";
import { isAndroid, isIOS, delay } from "../utils";
import {
  checkMicrophonePermission,
  requestMicrophonePermission,
  showPermissionAlert,
  isVoiceFeatureSupported,
  comprehensivePermissionCheck,
} from "../utils/permissions";

// 注意：react-native-voice 可能需要额外的原生模块配置
// 这个实现是基础版本，实际使用可能需要配置原生模块
class SpeechServiceImpl implements SpeechService {
  private recognitionState: SpeechRecognitionState = "idle";
  private ttsState: TextToSpeechState = "idle";
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private async initializeSpeechRecognition() {
    try {
      console.log("Initializing Speech Service...");

      // 首先检查设备是否支持语音功能
      if (!isVoiceFeatureSupported()) {
        this.recognitionState = "unavailable";
        this.onErrorCallback?.("当前设备或平台不支持语音功能");
        return;
      }

      // 综合权限检查
      const permissionCheck = await comprehensivePermissionCheck();

      if (permissionCheck.canUseVoiceFeatures) {
        this.isInitialized = true;
        this.recognitionState = "idle";
        console.log("Speech Service initialized successfully");
      } else {
        console.warn(
          "Speech Service initialization failed:",
          permissionCheck.issues
        );
        this.recognitionState = "unavailable";

        // 如果需要，提示用户权限问题
        const permission = permissionCheck.permissions;
        if (permission.showAlert) {
          this.onErrorCallback?.(permission.reason || "权限问题");
        }
      }
    } catch (error) {
      console.error("Failed to initialize speech recognition:", error);
      this.recognitionState = "error";
      this.onErrorCallback?.("语音服务初始化失败");
    }
  }

  // 语音识别相关方法
  async startListening(): Promise<void> {
    try {
      // 检查服务是否已初始化
      if (!this.isInitialized) {
        throw new Error("语音服务未初始化");
      }

      // 检查当前权限状态
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        const permissionResult = await requestMicrophonePermission();
        if (!permissionResult.granted) {
          if (permissionResult.showAlert) {
            showPermissionAlert(
              "权限不足",
              permissionResult.reason || "无法访问麦克风"
            );
          }
          this.recognitionState = "unavailable";
          this.onErrorCallback?.(
            permissionResult.reason || "无法获取麦克风权限"
          );
          return;
        }
      }

      // 检查是否已经在监听
      if (this.isListening()) {
        console.warn("Already listening, stopping first...");
        await this.stopListening();
        await delay(100); // 短暂延迟确保停止完成
      }

      this.recognitionState = "listening";
      console.log("Starting speech recognition...");

      // TODO: 实际实现需要调用 react-native-voice 或相应的原生 API
      // 目前作为占位符实现，模拟启动过程

      // 模拟一些处理延迟
      await delay(500);
      console.log("Speech recognition started successfully");
    } catch (error) {
      console.error("Failed to start listening:", error);
      this.recognitionState = "error";
      const errorMessage =
        error instanceof Error ? error.message : "启动语音识别失败";
      this.onErrorCallback?.(errorMessage);

      // 显示用户友好的错误提示
      if (errorMessage.includes("权限")) {
        showPermissionAlert("权限问题", "请确保应用已获取麦克风权限");
      }
    }
  }

  async stopListening(): Promise<void> {
    try {
      if (!this.isListening()) {
        console.warn("Not currently listening");
        return;
      }

      this.recognitionState = "idle";
      console.log("Stopping speech recognition...");

      // TODO: 实际实现需要停止语音识别
      // 目前作为占位符实现
    } catch (error) {
      console.error("Failed to stop listening:", error);
      this.recognitionState = "error";
      this.onErrorCallback?.("停止语音识别时发生错误");
    }
  }

  isListening(): boolean {
    return this.recognitionState === "listening";
  }

  getRecognitionState(): SpeechRecognitionState {
    return this.recognitionState;
  }

  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  // 清除所有回调
  clearCallbacks(): void {
    this.onResultCallback = undefined;
    this.onErrorCallback = undefined;
  }

  // 语音识别结果验证
  private validateRecognitionResult(result: SpeechRecognitionResult): boolean {
    if (!result.transcript || result.transcript.trim().length === 0) {
      console.warn("Empty transcript received");
      return false;
    }

    if (result.confidence < 0 || result.confidence > 1) {
      console.warn("Invalid confidence value:", result.confidence);
      return false;
    }

    return true;
  }

  // 触发结果回调（带验证）
  private triggerResultCallback(result: SpeechRecognitionResult): void {
    if (this.validateRecognitionResult(result)) {
      console.log(
        "Recognition result:",
        result.transcript,
        "Confidence:",
        result.confidence
      );
      this.onResultCallback?.(result);
    } else {
      console.warn("Invalid recognition result, not triggering callback");
      this.onErrorCallback?.("语音识别结果无效");
    }
  }

  // 文本转语音相关方法
  async speak(text: string): Promise<void> {
    try {
      // 验证输入文本
      if (!text || text.trim().length === 0) {
        throw new Error("文本内容不能为空");
      }

      // 检查TTS状态
      if (this.ttsState === "speaking") {
        console.warn("TTS is already speaking, stopping current speech");
        await this.stop();
      }

      this.ttsState = "speaking";

      const options = {
        language: SPEECH_CONFIG.textToSpeech.lang,
        rate: SPEECH_CONFIG.textToSpeech.rate,
        pitch: SPEECH_CONFIG.textToSpeech.pitch,
        volume: SPEECH_CONFIG.textToSpeech.volume,
      };

      await ExpoSpeech.speak(text.trim(), options);
      console.log("Speaking:", text);
    } catch (error) {
      console.error("Failed to speak:", error);
      this.ttsState = "error";
      const errorMessage =
        error instanceof Error ? error.message : "文本转语音失败";
      this.onErrorCallback?.(errorMessage);
    }
  }

  async stop(): Promise<void> {
    try {
      await ExpoSpeech.stop();
      this.ttsState = "idle";
      console.log("Stopped speaking");
    } catch (error) {
      console.error("Failed to stop speaking:", error);
      this.ttsState = "error";
    }
  }

  async pause(): Promise<void> {
    try {
      await ExpoSpeech.pause();
      this.ttsState = "paused";
      console.log("Paused speaking");
    } catch (error) {
      console.error("Failed to pause speaking:", error);
      this.ttsState = "error";
    }
  }

  async resume(): Promise<void> {
    try {
      await ExpoSpeech.resume();
      this.ttsState = "speaking";
      console.log("Resumed speaking");
    } catch (error) {
      console.error("Failed to resume speaking:", error);
      this.ttsState = "error";
    }
  }

  getTTSState(): TextToSpeechState {
    return this.ttsState;
  }

  // 模拟语音识别结果（开发测试用）
  simulateRecognitionResult(transcript: string): void {
    try {
      // 验证输入
      if (!transcript || transcript.trim().length === 0) {
        console.error("Cannot simulate empty transcript");
        this.onErrorCallback?.("无法模拟空结果");
        return;
      }

      const result: SpeechRecognitionResult = {
        transcript: transcript.trim(),
        confidence: 0.95,
        isFinal: true,
      };

      // 使用验证逻辑触发回调
      this.triggerResultCallback(result);
      this.recognitionState = "idle";

      console.log("Simulated recognition result:", transcript);
    } catch (error) {
      console.error("Failed to simulate recognition result:", error);
      this.recognitionState = "error";
      this.onErrorCallback?.("模拟语音识别结果失败");
    }
  }

  // 检查语音服务是否可用
  isServiceAvailable(): boolean {
    // 基础检查，实际实现需要更详细的检测
    return Platform.OS === "ios" || Platform.OS === "android";
  }
}

// 单例实现
export const speechService = new SpeechServiceImpl();
export default speechService;
