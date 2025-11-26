/**
 * 语音历史记录服务
 * 管理语音识别历史、会话记录和统计分析
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpeechRecognitionResult } from '../types';

export interface VoiceSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  results: VoiceResult[];
  duration: number; // 持续时间（秒）
  averageConfidence: number;
  totalWords: number;
  status: 'active' | 'completed' | 'interrupted' | 'failed';
  metadata: SessionMetadata;
}

export interface VoiceResult {
  id: string;
  timestamp: Date;
  transcript: string;
  confidence: number;
  isFinal: boolean;
  duration: number; // 识别耗时（秒）
  language?: string;
  metadata: ResultMetadata;
}

export interface SessionMetadata {
  deviceInfo: string;
  appVersion: string;
  networkType?: string;
  userAgent?: string;
  errorMessage?: string;
}

export interface ResultMetadata {
  engine: string;
  audioLength: number;
  processingTime: number;
  alternativeResults?: string[];
}

export interface VoiceStatistics {
  totalSessions: number;
  totalResults: number;
  totalDuration: number;
  averageSessionDuration: number;
  averageConfidence: number;
  mostUsedWords: WordFrequency[];
  sessionFrequencyByDay: DailyFrequency[];
  recentSessions: VoiceSession[];
}

export interface WordFrequency {
  word: string;
  count: number;
  frequency: number;
}

export interface DailyFrequency {
  date: string;
  count: number;
  duration: number;
}

class VoiceHistoryService {
  private sessionsKey = '@EESVoice:sessions';
  private maxSessions = 100; // 最多保存100个会话
  private maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30天

  // 创建新会话
  async createSession(): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      const session: VoiceSession = {
        id: sessionId,
        startTime: new Date(),
        results: [],
        duration: 0,
        averageConfidence: 0,
        totalWords: 0,
        status: 'active',
        metadata: {
          deviceInfo: this.getDeviceInfo(),
          appVersion: '1.0.0',
        },
      };

      const sessions = await this.getAllSessions();
      sessions.unshift(session);
      
      // 限制保存的会话数量
      const limitedSessions = sessions.slice(0, this.maxSessions);
      
      await AsyncStorage.setItem(this.sessionsKey, JSON.stringify(limitedSessions));
      return sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('创建语音会话失败');
    }
  }

  // 结束会话
  async endSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        const session = sessions[sessionIndex];
        session.endTime = new Date();
        session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
        session.status = 'completed';
        session.averageConfidence = this.calculateAverageConfidence(session.results);
        session.totalWords = this.calculateTotalWords(session.results);

        sessions[sessionIndex] = session;
        await AsyncStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  // 添加语音识别结果
  async addResult(sessionId: string, result: SpeechRecognitionResult): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        const voiceResult: VoiceResult = {
          id: this.generateResultId(),
          timestamp: new Date(),
          transcript: result.transcript,
          confidence: result.confidence,
          isFinal: result.isFinal,
          duration: 0, // 这里可以计算实际识别时间
          metadata: {
            engine: 'default',
            audioLength: 0,
            processingTime: 0,
          },
        };

        sessions[sessionIndex].results.push(voiceResult);
        await AsyncStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to add result:', error);
    }
  }

  // 获取会话列表
  async getSessions(limit?: number): Promise<VoiceSession[]> {
    try {
      const sessions = await this.getAllSessions();
      const filtered = this.filterExpiredSessions(sessions);
      
      if (limit) {
        return filtered.slice(0, limit);
      }
      
      return filtered;
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  // 获取特定会话
  async getSession(sessionId: string): Promise<VoiceSession | null> {
    try {
      const sessions = await this.getAllSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  // 获取统计数据
  async getStatistics(): Promise<VoiceStatistics> {
    try {
      const sessions = await this.getAllSessions();
      const completedSessions = sessions.filter(s => s.status === 'completed');
      
      const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
      const totalResults = completedSessions.reduce((sum, s) => sum + s.results.length, 0);
      const averageConfidence = this.calculateOverallAverageConfidence(completedSessions);
      
      // 统计词频
      const wordFrequencies = this.calculateWordFrequencies(completedSessions);
      
      // 按日期统计频率
      const dailyFrequencies = this.calculateDailyFrequencies(completedSessions);
      
      return {
        totalSessions: completedSessions.length,
        totalResults,
        totalDuration,
        averageSessionDuration: completedSessions.length > 0 ? totalDuration / completedSessions.length : 0,
        averageConfidence,
        mostUsedWords: wordFrequencies.slice(0, 20),
        sessionFrequencyByDay: dailyFrequencies,
        recentSessions: sessions.slice(0, 5),
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return this.getEmptyStatistics();
    }
  }

  // 搜索会话
  async searchSessions(query: string): Promise<VoiceSession[]> {
    try {
      const sessions = await this.getAllSessions();
      const lowerQuery = query.toLowerCase();
      
      return sessions.filter(session => 
        session.results.some(result => 
          result.transcript.toLowerCase().includes(lowerQuery)
        )
      );
    } catch (error) {
      console.error('Failed to search sessions:', error);
      return [];
    }
  }

  // 删除会话
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      await AsyncStorage.setItem(this.sessionsKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  // 清除所有历史记录
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.sessionsKey);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  // 导出历史记录
  async exportHistory(): Promise<string> {
    try {
      const sessions = await this.getAllSessions();
      const statistics = await this.getStatistics();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        sessions,
        statistics,
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export history:', error);
      throw new Error('导出历史记录失败');
    }
  }

  // 私有辅助方法
  private async getAllSessions(): Promise<VoiceSession[]> {
    try {
      const stored = await AsyncStorage.getItem(this.sessionsKey);
      if (stored) {
        const sessions = JSON.parse(stored);
        // 确保日期字段被正确解析
        return sessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          results: session.results.map((result: any) => ({
            ...result,
            timestamp: new Date(result.timestamp),
          })),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      return [];
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): string {
    return `${Platform.OS} ${Platform.Version || 'Unknown'}`;
  }

  private calculateAverageConfidence(results: VoiceResult[]): number {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, result) => acc + result.confidence, 0);
    return sum / results.length;
  }

  private calculateTotalWords(results: VoiceResult[]): number {
    return results.reduce((acc, result) => {
      const words = result.transcript.trim().split(/\s+/);
      return acc + words.filter(word => word.length > 0).length;
    }, 0);
  }

  private calculateOverallAverageConfidence(sessions: VoiceSession[]): number {
    if (sessions.length === 0) return 0;
    const totalResults = sessions.reduce((sum, session) => sum + session.results.length, 0);
    if (totalResults === 0) return 0;
    
    const totalConfidence = sessions.reduce((sum, session) => 
      sum + session.results.reduce((resultSum, result) => resultSum + result.confidence, 0), 0);
    
    return totalConfidence / totalResults;
  }

  private calculateWordFrequencies(sessions: VoiceSession[]): WordFrequency[] {
    const wordCount: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      session.results.forEach(result => {
        const words = result.transcript.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach(word => {
          if (word.length > 1) { // 忽略单字符
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      });
    });

    return Object.entries(wordCount)
      .map(([word, count]) => ({ word, count, frequency: count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateDailyFrequencies(sessions: VoiceSession[]): DailyFrequency[] {
    const dailyCount: { [key: string]: { count: number; duration: number } } = {};
    
    sessions.forEach(session => {
      if (session.endTime) {
        const date = session.endTime.toISOString().split('T')[0];
        if (!dailyCount[date]) {
          dailyCount[date] = { count: 0, duration: 0 };
        }
        dailyCount[date].count += 1;
        dailyCount[date].duration += session.duration;
      }
    });

    return Object.entries(dailyCount)
      .map(([date, data]) => ({
        date,
        count: data.count,
        duration: data.duration,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private filterExpiredSessions(sessions: VoiceSession[]): VoiceSession[] {
    const cutoffTime = Date.now() - this.maxSessionAge;
    return sessions.filter(session => 
      session.startTime.getTime() > cutoffTime
    );
  }

  private getEmptyStatistics(): VoiceStatistics {
    return {
      totalSessions: 0,
      totalResults: 0,
      totalDuration: 0,
      averageSessionDuration: 0,
      averageConfidence: 0,
      mostUsedWords: [],
      sessionFrequencyByDay: [],
      recentSessions: [],
    };
  }
}

// 单例实现
export const voiceHistoryService = new VoiceHistoryService();
export default voiceHistoryService;