import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Button, Input } from 'react-native-elements';
import { Search, Trash2, Play, Clock, TrendingUp, Filter } from 'lucide-react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { voiceHistoryService, VoiceSession, VoiceResult } from '@/src/services/voiceHistoryService';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, selectedFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await voiceHistoryService.getHistory();
      setSessions(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert('错误', '加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // 时间过滤
    const now = new Date();
    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(session => 
          isSameDay(new Date(session.startTime), now)
        );
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(session => 
          new Date(session.startTime) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(session => 
          new Date(session.startTime) >= monthAgo
        );
        break;
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.results.some(result =>
          result.transcript.toLowerCase().includes(query)
        )
      );
    }

    setFilteredSessions(filtered);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      '删除会话',
      '确定要删除这个语音会话吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await voiceHistoryService.deleteSession(sessionId);
              await loadHistory();
              Alert.alert('成功', '会话已删除');
            } catch (error) {
              console.error('Failed to delete session:', error);
              Alert.alert('错误', '删除会话失败');
            }
          },
        },
      ]
    );
  };

  const handleClearAllHistory = () => {
    Alert.alert(
      '清空历史',
      '确定要清空所有历史记录吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              await voiceHistoryService.clearHistory();
              await loadHistory();
              Alert.alert('成功', '历史记录已清空');
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('错误', '清空历史记录失败');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      if (isSameDay(date, now)) {
        return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (isSameDay(date, yesterday)) {
          return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
      }
    }

    if (diffInHours < 168) { // 7天
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      return `周${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderFilterButton = (filter: 'all' | 'today' | 'week' | 'month', label: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}>
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSessionItem = ({ item: session }: { item: VoiceSession }) => (
    <Card containerStyle={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Clock size={16} color="#666" />
          <Text style={styles.sessionDate}>
            {formatDate(session.startTime)}
          </Text>
        </View>
        <Text style={styles.sessionDuration}>
          {formatDuration(session.duration)}
        </Text>
      </View>

      <View style={styles.sessionStats}>
        <Text style={styles.statText}>
          结果数量: {session.results.length}
        </Text>
        <Text style={styles.statText}>
          平均置信度: {session.averageConfidence.toFixed(2)}
        </Text>
      </View>

      {session.results.length > 0 && (
        <View style={styles.resultsPreview}>
          <Text style={styles.resultsTitle}>最近结果:</Text>
          {session.results.slice(0, 3).map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText} numberOfLines={1}>
                {result.transcript}
              </Text>
              <Text style={styles.resultTime}>
                {formatDuration(result.duration)}
              </Text>
            </View>
          ))}
          {session.results.length > 3 && (
            <Text style={styles.moreResults}>
              还有 {session.results.length - 3} 个结果...
            </Text>
          )}
        </View>
      )}

      <View style={styles.sessionActions}>
        <Button
          title="播放"
          icon={<Play size={16} color="#007AFF" />}
          type="clear"
          titleStyle={styles.actionButtonText}
          onPress={() => Alert.alert('提示', '播放功能即将推出')}
        />
        <Button
          title="删除"
          icon={<Trash2 size={16} color="#ff3b30" />}
          type="clear"
          titleStyle={[styles.actionButtonText, { color: '#ff3b30' }]}
          onPress={() => handleDeleteSession(session.id)}
        />
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Search size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>暂无历史记录</Text>
      <Text style={styles.emptyStateText}>
        开始使用语音功能，历史记录将显示在这里
      </Text>
      <Button
        title="开始语音"
        onPress={() => Alert.alert('提示', '请前往语音页面使用功能')}
        buttonStyle={styles.emptyStateButton}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <Input
          placeholder="搜索语音结果..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          inputStyle={styles.searchInput}
          containerStyle={styles.searchInputContainer}
          inputContainerStyle={styles.searchInputInnerContainer}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Filter size={16} color="#666" />
        <View style={styles.filterButtons}>
          {renderFilterButton('all', '全部')}
          {renderFilterButton('today', '今天')}
          {renderFilterButton('week', '本周')}
          {renderFilterButton('month', '本月')}
        </View>
      </View>

      {filteredSessions.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            共找到 {filteredSessions.length} 个会话
          </Text>
          <Button
            title="清空所有"
            onPress={handleClearAllHistory}
            type="clear"
            titleStyle={styles.clearAllButtonText}
          />
        </View>
      )}
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.headerImage}>
          <Search size={120} color="#fff" />
        </View>
      }>
      <ThemedView style={styles.container}>
        {renderHeader()}

        <FlatList
          data={filteredSessions}
          renderItem={renderSessionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 40,
  },
  searchInputContainer: {
    paddingHorizontal: 0,
  },
  searchInputInnerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  clearAllButtonText: {
    fontSize: 14,
    color: '#ff3b30',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  sessionDuration: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  resultsPreview: {
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  moreResults: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
  },
});