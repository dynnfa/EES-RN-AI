// 环境配置
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

export const APP_CONFIG = {
  name: 'EES-RN-AI',
  version: '1.0.0',
  environment: __DEV__ ? ENV.DEVELOPMENT : ENV.PRODUCTION,
} as const;

// 语音服务配置
export const SPEECH_CONFIG = {
  // 语音识别配置
  speechRecognition: {
    lang: 'zh-CN', // 中文识别
    continuous: false,
    interimResults: true,
    maxAlternatives: 1,
  },
  // 文本转语音配置
  textToSpeech: {
    lang: 'zh-CN',
    rate: 1.0, // 语速
    pitch: 1.0, // 音调
    volume: 1.0, // 音量
  },
} as const;

export default {
  ENV,
  APP_CONFIG,
  SPEECH_CONFIG,
};