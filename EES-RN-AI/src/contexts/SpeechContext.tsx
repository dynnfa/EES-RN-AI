import React, { createContext, useContext, ReactNode } from 'react';
import { speechService } from '../services/speechService';
import { SpeechRecognitionState, TextToSpeechState, SpeechRecognitionResult } from '../types';

interface SpeechContextType {
  // 语音识别状态
  recognitionState: SpeechRecognitionState;
  isListening: boolean;
  
  // 文本转语音状态
  ttsState: TextToSpeechState;
  isSpeaking: boolean;
  
  // 识别到的文本
  recognizedText: string;
  
  // 语音识别方法
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  
  // 文本转语音方法
  speak: (text: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  
  // 工具方法
  clearRecognizedText: () => void;
  simulateVoiceInput: (text: string) => void;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

interface SpeechProviderProps {
  children: ReactNode;
}

export function SpeechProvider({ children }: SpeechProviderProps) {
  const [recognitionState, setRecognitionState] = React.useState<SpeechRecognitionState>('idle');
  const [ttsState, setTtsState] = React.useState<TextToSpeechState>('idle');
  const [recognizedText, setRecognizedText] = React.useState<string>('');

  // 语音识别方法
  const startListening = React.useCallback(async () => {
    try {
      setRecognitionState('listening');
      await speechService.startListening();
    } catch (error) {
      console.error('Failed to start listening:', error);
      setRecognitionState('error');
    }
  }, []);

  const stopListening = React.useCallback(async () => {
    try {
      await speechService.stopListening();
      setRecognitionState('idle');
    } catch (error) {
      console.error('Failed to stop listening:', error);
      setRecognitionState('error');
    }
  }, []);

  // 文本转语音方法
  const speak = React.useCallback(async (text: string) => {
    try {
      setTtsState('speaking');
      await speechService.speak(text);
    } catch (error) {
      console.error('Failed to speak:', error);
      setTtsState('error');
    }
  }, []);

  const stop = React.useCallback(async () => {
    try {
      await speechService.stop();
      setTtsState('idle');
    } catch (error) {
      console.error('Failed to stop speaking:', error);
      setTtsState('error');
    }
  }, []);

  const pause = React.useCallback(async () => {
    try {
      await speechService.pause();
      setTtsState('paused');
    } catch (error) {
      console.error('Failed to pause speaking:', error);
      setTtsState('error');
    }
  }, []);

  const resume = React.useCallback(async () => {
    try {
      await speechService.resume();
      setTtsState('speaking');
    } catch (error) {
      console.error('Failed to resume speaking:', error);
      setTtsState('error');
    }
  }, []);

  // 工具方法
  const clearRecognizedText = React.useCallback(() => {
    setRecognizedText('');
  }, []);

  const simulateVoiceInput = React.useCallback((text: string) => {
    speechService.simulateRecognitionResult(text);
  }, []);

  // 设置语音识别回调
  React.useEffect(() => {
    const handleResult = (result: SpeechRecognitionResult) => {
      setRecognizedText(prev => prev + result.transcript);
      setRecognitionState('idle');
    };

    const handleError = (error: string) => {
      console.error('Speech recognition error:', error);
      setRecognitionState('error');
    };

    speechService.onResult(handleResult);
    speechService.onError(handleError);

    // 定期更新状态
    const statusInterval = setInterval(() => {
      const currentRecognitionState = speechService.getRecognitionState();
      const currentTtsState = speechService.getTTSState();
      
      setRecognitionState(currentRecognitionState);
      setTtsState(currentTtsState);
    }, 100);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const value: SpeechContextType = {
    // 状态
    recognitionState,
    isListening: recognitionState === 'listening',
    ttsState,
    isSpeaking: ttsState === 'speaking',
    recognizedText,
    
    // 语音识别方法
    startListening,
    stopListening,
    
    // 文本转语音方法
    speak,
    stop,
    pause,
    resume,
    
    // 工具方法
    clearRecognizedText,
    simulateVoiceInput,
  };

  return (
    <SpeechContext.Provider value={value}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech(): SpeechContextType {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
}