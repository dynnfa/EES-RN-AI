/**
 * 配置管理服务
 * 处理应用配置、环境变量和动态设置
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppConfig {
  // 应用基本信息
  appInfo: {
    version: string;
    buildNumber: string;
    name: string;
  };
  
  // 网络配置
  network: {
    apiTimeout: number;
    maxRetries: number;
    baseUrl?: string;
    enableLogging: boolean;
  };
  
  // 语音识别配置
  speechRecognition: {
    language: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    confidenceThreshold: number;
  };
  
  // 文本转语音配置
  textToSpeech: {
    defaultRate: number;
    defaultPitch: number;
    defaultVolume: number;
    language: string;
  };
  
  // 缓存配置
  cache: {
    maxSize: number;
    ttl: number;
    enableCompression: boolean;
  };
  
  // 调试配置
  debug: {
    enableConsole: boolean;
    enableRemoteLogging: boolean;
    simulateVoiceInput: boolean;
    showPerformanceMetrics: boolean;
  };
  
  // 功能开关
  features: {
    voiceRecognition: boolean;
    textToSpeech: boolean;
    userProfile: boolean;
    analytics: boolean;
    cloudSync: boolean;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  appInfo: {
    version: '1.0.0',
    buildNumber: '1',
    name: 'EES-RN-AI',
  },
  
  network: {
    apiTimeout: 30000,
    maxRetries: 3,
    baseUrl: undefined,
    enableLogging: false,
  },
  
  speechRecognition: {
    language: 'zh-CN',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1,
    confidenceThreshold: 0.5,
  },
  
  textToSpeech: {
    defaultRate: 1.0,
    defaultPitch: 1.0,
    defaultVolume: 1.0,
    language: 'zh-CN',
  },
  
  cache: {
    maxSize: 50 * 1024 * 1024, // 50MB
    ttl: 24 * 60 * 60 * 1000, // 24小时
    enableCompression: true,
  },
  
  debug: {
    enableConsole: __DEV__,
    enableRemoteLogging: false,
    simulateVoiceInput: __DEV__,
    showPerformanceMetrics: __DEV__,
  },
  
  features: {
    voiceRecognition: true,
    textToSpeech: true,
    userProfile: true,
    analytics: false,
    cloudSync: false,
  },
};

class ConfigService {
  private storageKey = '@EESApp:config';
  private config: AppConfig = { ...DEFAULT_CONFIG };
  private listeners: Map<string, (config: Partial<AppConfig>) => void> = new Map();

  // 初始化配置服务
  async initialize(): Promise<void> {
    try {
      await this.loadConfig();
      console.log('Config service initialized');
    } catch (error) {
      console.error('Failed to initialize config service:', error);
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  // 加载配置
  private async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        const savedConfig = JSON.parse(stored);
        // 合并保存的配置和默认配置
        this.config = this.deepMerge(DEFAULT_CONFIG, savedConfig);
      } else {
        this.config = { ...DEFAULT_CONFIG };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  // 保存配置
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new Error('保存配置失败');
    }
  }

  // 深度合并对象
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  // 获取完整配置
  getConfig(): AppConfig {
    return { ...this.config };
  }

  // 获取特定配置项
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return { ...this.config[key] };
  }

  // 获取嵌套配置项
  getNested<K extends keyof AppConfig, T extends keyof AppConfig[K]>(
    category: K,
    key: T
  ): AppConfig[K][T] {
    return this.config[category][key];
  }

  // 更新配置
  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    try {
      const oldConfig = { ...this.config };
      this.config = this.deepMerge(this.config, updates);
      await this.saveConfig();
      
      // 触发配置变更监听器
      this.notifyListeners(updates);
      
      console.log('Config updated:', updates);
    } catch (error) {
      console.error('Failed to update config:', error);
      throw new Error('更新配置失败');
    }
  }

  // 更新特定配置项
  async update<K extends keyof AppConfig>(
    category: K,
    updates: Partial<AppConfig[K]>
  ): Promise<void> {
    await this.updateConfig({
      [category]: { ...this.config[category], ...updates }
    } as Partial<AppConfig>);
  }

  // 重置为默认配置
  async resetToDefaults(): Promise<void> {
    try {
      this.config = { ...DEFAULT_CONFIG };
      await this.saveConfig();
      console.log('Config reset to defaults');
    } catch (error) {
      console.error('Failed to reset config:', error);
      throw new Error('重置配置失败');
    }
  }

  // 添加配置变更监听器
  addListener(id: string, callback: (config: Partial<AppConfig>) => void): void {
    this.listeners.set(id, callback);
  }

  // 移除配置变更监听器
  removeListener(id: string): void {
    this.listeners.delete(id);
  }

  // 通知监听器
  private notifyListeners(updates: Partial<AppConfig>): void {
    this.listeners.forEach(callback => {
      try {
        callback(updates);
      } catch (error) {
        console.error('Config listener error:', error);
      }
    });
  }

  // 导出配置
  async exportConfig(): Promise<string> {
    try {
      return JSON.stringify(this.config, null, 2);
    } catch (error) {
      console.error('Failed to export config:', error);
      throw new Error('导出配置失败');
    }
  }

  // 导入配置
  async importConfig(configJson: string): Promise<void> {
    try {
      const importedConfig = JSON.parse(configJson);
      await this.updateConfig(importedConfig);
      console.log('Config imported successfully');
    } catch (error) {
      console.error('Failed to import config:', error);
      throw new Error('导入配置失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }

  // 验证配置
  validateConfig(config: any): config is AppConfig {
    try {
      // 基本结构验证
      if (!config || typeof config !== 'object') return false;
      
      const requiredCategories = [
        'appInfo', 'network', 'speechRecognition', 'textToSpeech', 
        'cache', 'debug', 'features'
      ];
      
      for (const category of requiredCategories) {
        if (!config[category] || typeof config[category] !== 'object') {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // 获取配置摘要
  getConfigSummary(): string {
    const { appInfo, features, debug } = this.config;
    return `App: ${appInfo.name} v${appInfo.version} (Build ${appInfo.buildNumber})
Features: Voice: ${features.voiceRecognition ? 'ON' : 'OFF'}, TTS: ${features.textToSpeech ? 'ON' : 'OFF'}
Debug Mode: ${debug.enableConsole ? 'ON' : 'OFF'}`;
  }

  // 清除所有配置数据
  async clearConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      this.config = { ...DEFAULT_CONFIG };
      console.log('Config cleared');
    } catch (error) {
      console.error('Failed to clear config:', error);
      throw new Error('清除配置失败');
    }
  }
}

// 单例实现
export const configService = new ConfigService();
export default configService;