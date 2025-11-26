// 应用类型定义

// 语音识别结果
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// 语音识别状态
export type SpeechRecognitionState = 
  | 'idle'           // 空闲状态
  | 'listening'      // 监听中
  | 'processing'     // 处理中
  | 'error'          // 错误状态
  | 'unavailable';   // 不可用

// 文本转语音状态
export type TextToSpeechState = 
  | 'idle'           // 空闲状态
  | 'speaking'       // 朗读中
  | 'paused'         // 暂停
  | 'error';         // 错误状态

// 语音服务接口
export interface SpeechService {
  // 语音识别相关
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  isListening: () => boolean;
  getRecognitionState: () => SpeechRecognitionState;
  onResult: (callback: (result: SpeechRecognitionResult) => void) => void;
  onError: (callback: (error: string) => void) => void;
  
  // 文本转语音相关
  speak: (text: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  getTTSState: () => TextToSpeechState;
}

// 主题配置
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

// 应用状态
export interface AppState {
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

// 导航路由类型
export type TabRoutes = 'index' | 'explore' | 'voice' | 'settings';

export type RootStackParamList = {
  '(tabs)': undefined;
  'voice': undefined;
  'settings': undefined;
  'modal': undefined;
};

export type TabParamList = {
  'index': undefined;
  'explore': undefined;
  'voice': undefined;
  'settings': undefined;
};