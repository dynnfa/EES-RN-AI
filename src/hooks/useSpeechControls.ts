import { useContext } from 'react';
import { SpeechContext } from '../contexts/SpeechContext';

/**
 * 语音控制自定义Hook
 * 提供便捷的语音识别和文本转语音功能
 * 
 * @example
 * const { 
 *   isListening, 
 *   startListening, 
 *   stopListening,
 *   speak,
 *   recognizedText 
 * } = useSpeechControls();
 */
export const useSpeechControls = () => {
  const context = useContext(SpeechContext);
  
  if (context === undefined) {
    throw new Error('useSpeechControls must be used within a SpeechProvider');
  }

  // 提供简化的接口和便捷方法
  return {
    ...context,
    
    // 便捷方法
    toggleListening: () => {
      if (context.isListening) {
        context.stopListening();
      } else {
        context.startListening();
      }
    },
    
    toggleSpeaking: () => {
      if (context.isSpeaking) {
        context.stop();
      } else if (context.recognizedText) {
        context.speak(context.recognizedText);
      }
    },
    
    // 检查语音服务是否可用
    isServiceAvailable: () => {
      // 这里可以添加实际的可用性检查逻辑
      return true;
    },
    
    // 获取状态描述
    getStateDescription: () => {
      const { recognitionState, ttsState } = context;
      return {
        recognition: recognitionState,
        tts: ttsState,
        description: `识别状态: ${recognitionState}, 朗读状态: ${ttsState}`,
      };
    },
  };
};

export default useSpeechControls;