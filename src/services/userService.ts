/**
 * 用户管理服务
 * 处理用户数据、偏好设置和会话管理
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserPreferences {
  language: 'zh' | 'en';
  theme: 'light' | 'dark' | 'system';
  voiceSettings: {
    speechRate: number;
    speechPitch: number;
    speechVolume: number;
    autoSpeak: boolean;
  };
  notificationSettings: {
    voiceResults: boolean;
    systemUpdates: boolean;
    errorAlerts: boolean;
  };
}

export interface UserStatistics {
  totalSessions: number;
  totalVoiceMinutes: number;
  averageConfidence: number;
  favoriteCommands: string[];
  lastUsedFeatures: string[];
}

class UserService {
  private storageKey = '@EESUser:profile';
  private readonly defaultProfile: UserProfile = {
    id: this.generateId(),
    name: 'Guest User',
    preferences: {
      language: 'zh',
      theme: 'system',
      voiceSettings: {
        speechRate: 1.0,
        speechPitch: 1.0,
        speechVolume: 1.0,
        autoSpeak: false,
      },
      notificationSettings: {
        voiceResults: true,
        systemUpdates: true,
        errorAlerts: true,
      },
    },
    statistics: {
      totalSessions: 0,
      totalVoiceMinutes: 0,
      averageConfidence: 0.0,
      favoriteCommands: [],
      lastUsedFeatures: [],
    },
    createdAt: new Date(),
    lastActiveAt: new Date(),
  };

  // 生成唯一ID
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取当前用户配置文件
  async getUserProfile(): Promise<UserProfile> {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        const profile = JSON.parse(stored);
        // 确保日期字段被正确解析
        profile.createdAt = new Date(profile.createdAt);
        profile.lastActiveAt = new Date(profile.lastActiveAt);
        return profile;
      }
      return this.defaultProfile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return this.defaultProfile;
    }
  }

  // 保存用户配置文件
  async saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const currentProfile = await this.getUserProfile();
      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...profile,
        lastActiveAt: new Date(),
      };

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      console.error('Failed to save user profile:', error);
      throw new Error('保存用户配置文件失败');
    }
  }

  // 更新用户偏好设置
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const profile = await this.getUserProfile();
      const updatedProfile = await this.saveUserProfile({
        preferences: { ...profile.preferences, ...preferences },
      });
      return updatedProfile.preferences;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw new Error('更新用户偏好设置失败');
    }
  }

  // 更新统计数据
  async updateStatistics(statistics: Partial<UserStatistics>): Promise<UserStatistics> {
    try {
      const profile = await this.getUserProfile();
      const updatedProfile = await this.saveUserProfile({
        statistics: { ...profile.statistics, ...statistics },
      });
      return updatedProfile.statistics;
    } catch (error) {
      console.error('Failed to update statistics:', error);
      throw new Error('更新统计数据失败');
    }
  }

  // 记录语音使用情况
  async recordVoiceSession(minutes: number, confidence: number): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      const statistics = profile.statistics;

      const updatedStats: UserStatistics = {
        ...statistics,
        totalSessions: statistics.totalSessions + 1,
        totalVoiceMinutes: statistics.totalVoiceMinutes + minutes,
        averageConfidence: this.calculateNewAverage(
          statistics.averageConfidence,
          statistics.totalSessions,
          confidence
        ),
      };

      await this.updateStatistics(updatedStats);
    } catch (error) {
      console.error('Failed to record voice session:', error);
    }
  }

  // 添加常用命令
  async addFavoriteCommand(command: string): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      const favorites = profile.statistics.favoriteCommands;

      if (!favorites.includes(command) && favorites.length < 10) {
        favorites.push(command);
        await this.updateStatistics({
          favoriteCommands: favorites,
        });
      }
    } catch (error) {
      console.error('Failed to add favorite command:', error);
    }
  }

  // 记录使用的功能
  async recordFeatureUsage(feature: string): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      const lastUsedFeatures = profile.statistics.lastUsedFeatures;

      // 移除旧的记录，添加新记录到前面
      const filtered = lastUsedFeatures.filter(f => f !== feature);
      filtered.unshift(feature);

      // 只保留最近使用的5个功能
      const trimmed = filtered.slice(0, 5);

      await this.updateStatistics({
        lastUsedFeatures: trimmed,
      });
    } catch (error) {
      console.error('Failed to record feature usage:', error);
    }
  }

  // 计算新的平均值
  private calculateNewAverage(currentAverage: number, currentCount: number, newValue: number): number {
    if (currentCount === 0) return newValue;
    return (currentAverage * currentCount + newValue) / (currentCount + 1);
  }

  // 清除用户数据
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear user data:', error);
      throw new Error('清除用户数据失败');
    }
  }

  // 导出用户数据
  async exportUserData(): Promise<string> {
    try {
      const profile = await this.getUserProfile();
      return JSON.stringify(profile, null, 2);
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw new Error('导出用户数据失败');
    }
  }
}

// 单例实现
export const userService = new UserService();
export default userService;