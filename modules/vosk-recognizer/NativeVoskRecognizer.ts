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

const VoskRecognizer = TurboModuleRegistry.getEnforcing<Spec>('VoskRecognizer');
export default VoskRecognizer;