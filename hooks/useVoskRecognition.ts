import { useCallback, useEffect, useRef, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import VoskRecognizer, {
  type VoskConfig,
  type VoskRecognitionResult,
} from '../modules/vosk-recognizer/NativeVoskRecognizer';

export interface UseVoskRecognitionOptions {
  onPartialResult?: (text: string) => void;
  onFinalResult?: (result: VoskRecognitionResult) => void;
  onError?: (error: string) => void;
  enablePartialResults?: boolean;
}

export interface UseVoskRecognitionReturn {
  isListening: boolean;
  isInitialized: boolean;
  partialResult: string;
  finalResult: VoskRecognitionResult | null;
  error: string | null;

  // 控制方法
  initialize: (config: VoskConfig) => Promise<boolean>;
  startListening: () => void;
  stopListening: () => Promise<string>;
  pauseListening: () => void;
  resumeListening: () => void;
  destroy: () => void;
}

/**
 * Vosk 离线语音识别 Hook
 *
 * 使用示例:
 * ```typescript
 * const {
 *   isListening,
 *   isInitialized,
 *   partialResult,
 *   finalResult,
 *   error,
 *   initialize,
 *   startListening,
 *   stopListening
 * } = useVoskRecognition({
 *   onPartialResult: (text) => console.log('Partial:', text),
 *   onFinalResult: (result) => console.log('Final:', result.text),
 *   onError: (error) => console.error('Error:', error)
 * });
 *
 * // 初始化模型
 * useEffect(() => {
 *   initialize({
 *     modelPath: 'path/to/model',
 *     sampleRate: 16000,
 *     enablePartialResults: true
 *   });
 * }, []);
 * ```
 */
export function useVoskRecognition(
  options: UseVoskRecognitionOptions = {}
): UseVoskRecognitionReturn {
  const { onPartialResult, onFinalResult, onError, enablePartialResults = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [partialResult, setPartialResult] = useState('');
  const [finalResult, setFinalResult] = useState<VoskRecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);

  // 初始化事件监听器
  useEffect(() => {
    eventEmitterRef.current = new NativeEventEmitter(VoskRecognizer);

    const subscriptions = [
      eventEmitterRef.current.addListener('onPartialResult', event => {
        const { text } = event;
        setPartialResult(text);
        onPartialResult?.(text);
      }),

      eventEmitterRef.current.addListener('onFinalResult', event => {
        const { text, confidence } = event;
        const result: VoskRecognitionResult = {
          text,
          confidence,
          isFinal: true,
        };
        setFinalResult(result);
        setPartialResult(''); // 清空中间结果
        onFinalResult?.(result);
      }),

      eventEmitterRef.current.addListener('onError', event => {
        const { message } = event;
        setError(message);
        onError?.(message);
      }),
    ];

    return () => {
      subscriptions.forEach(sub => sub.remove());
      eventEmitterRef.current = null;
    };
  }, [onPartialResult, onFinalResult, onError]);

  // 清理函数
  const destroy = useCallback(() => {
    try {
      VoskRecognizer.destroy();
      setIsListening(false);
      setIsInitialized(false);
      setPartialResult('');
      setFinalResult(null);
      setError(null);
    } catch (err) {
      console.error('Failed to destroy Vosk recognizer:', err);
    }
  }, []);

  // 初始化模型
  const initialize = useCallback(
    async (config: VoskConfig): Promise<boolean> => {
      try {
        setError(null);
        const configWithDefaults: VoskConfig = {
          sampleRate: 16000,
          enablePartialResults,
          ...config,
        };

        const result = await VoskRecognizer.initialize(configWithDefaults);
        setIsInitialized(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Vosk';
        setError(errorMessage);
        throw err;
      }
    },
    [enablePartialResults]
  );

  // 开始识别
  const startListening = useCallback(() => {
    if (!isInitialized) {
      const errorMsg = 'Vosk recognizer not initialized';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      VoskRecognizer.startRecognition();
      setIsListening(true);
      setPartialResult('');
      setFinalResult(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recognition';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isInitialized, onError]);

  // 停止识别
  const stopListening = useCallback(async (): Promise<string> => {
    if (!isListening) {
      return '';
    }

    try {
      const result = await VoskRecognizer.stopRecognition();
      setIsListening(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recognition';
      setError(errorMessage);
      throw err;
    }
  }, [isListening]);

  // 暂停识别
  const pauseListening = useCallback(() => {
    if (!isListening) return;

    try {
      VoskRecognizer.pauseRecognition();
      setIsListening(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause recognition';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isListening, onError]);

  // 恢复识别
  const resumeListening = useCallback(() => {
    if (!isInitialized) {
      const errorMsg = 'Vosk recognizer not initialized';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      VoskRecognizer.resumeRecognition();
      setIsListening(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume recognition';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isInitialized, onError]);

  return {
    isListening,
    isInitialized,
    partialResult,
    finalResult,
    error,
    initialize,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    destroy,
  };
}
