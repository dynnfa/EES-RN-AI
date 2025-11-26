import { useContext } from 'react';
import { SpeechContext } from '../contexts/SpeechContext';

/**
 * 语音功能自定义Hook
 * 提供便捷的语音识别和文本转语音功能
 */
export const useSpeech = () => {
  return useContext(SpeechContext);
};

export default useSpeech;