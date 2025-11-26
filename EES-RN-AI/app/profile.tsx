import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Card, Button, Input } from 'react-native-elements';
import { User, Settings, BarChart3, History, Bell } from 'lucide-react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { userService, UserProfile, UserPreferences } from '@/src/services/userService';
import { configService } from '@/src/services/configService';
import { voiceHistoryService, VoiceStatistics } from '@/src/services/voiceHistoryService';

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<VoiceStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profile, stats] = await Promise.all([
        userService.getUserProfile(),
        voiceHistoryService.getStatistics(),
      ]);
      setUserProfile(profile);
      setStatistics(stats);
      setEditName(profile.name);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      Alert.alert('错误', '加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!userProfile) return;
      
      const updatedProfile = await userService.saveUserProfile({
        name: editName.trim() || '未命名用户',
      });
      
      setUserProfile(updatedProfile);
      setEditing(false);
      Alert.alert('成功', '用户信息已更新');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('错误', '保存用户信息失败');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '清除数据',
      '确定要清除所有用户数据吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.clearUserData();
              await voiceHistoryService.clearHistory();
              await loadProfileData();
              Alert.alert('成功', '数据已清除');
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert('错误', '清除数据失败');
            }
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Text>加载中...</Text>
      </ThemedView>
    );
  }

  if (!userProfile) {
    return (
      <ThemedView style={styles.container}>
        <Text>无法加载用户信息</Text>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.headerImage}>
          <User size={120} color="#fff" />
        </View>
      }>
      <ThemedView style={styles.container}>
        {/* 用户基本信息 */}
        <Card containerStyle={styles.card}>
          <Card.Title>用户信息</Card.Title>
          {editing ? (
            <View style={styles.editContainer}>
              <Input
                label="用户名"
                value={editName}
                onChangeText={setEditName}
                placeholder="请输入用户名"
              />
              <View style={styles.editButtons}>
                <Button
                  title="保存"
                  onPress={handleSaveProfile}
                  buttonStyle={styles.saveButton}
                />
                <Button
                  title="取消"
                  onPress={() => {
                    setEditing(false);
                    setEditName(userProfile.name);
                  }}
                  type="outline"
                  buttonStyle={styles.cancelButton}
                />
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>用户名：</Text>
                <Text style={styles.value}>{userProfile.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>用户ID：</Text>
                <Text style={styles.value}>{userProfile.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>注册时间：</Text>
                <Text style={styles.value}>
                  {userProfile.createdAt.toLocaleDateString()}
                </Text>
              </View>
              <Button
                title="编辑资料"
                onPress={() => setEditing(true)}
                type="outline"
                icon={<Settings size={16} color="#007AFF" />}
                buttonStyle={styles.editButton}
              />
            </View>
          )}
        </Card>

        {/* 使用统计 */}
        {statistics && (
          <Card containerStyle={styles.card}>
            <Card.Title>使用统计</Card.Title>
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.label}>语音会话：</Text>
                <Text style={styles.value}>{statistics.totalSessions} 次</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.label}>识别结果：</Text>
                <Text style={styles.value}>{statistics.totalResults} 条</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.label}>总使用时长：</Text>
                <Text style={styles.value}>{formatDuration(statistics.totalDuration)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.label}>平均置信度：</Text>
                <Text style={styles.value}>
                  {statistics.averageConfidence.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* 常用命令 */}
        {userProfile.statistics.favoriteCommands.length > 0 && (
          <Card containerStyle={styles.card}>
            <Card.Title>常用命令</Card.Title>
            <View style={styles.commandsContainer}>
              {userProfile.statistics.favoriteCommands.map((command, index) => (
                <View key={index} style={styles.commandChip}>
                  <Text style={styles.commandText}>{command}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* 最近使用的功能 */}
        {userProfile.statistics.lastUsedFeatures.length > 0 && (
          <Card containerStyle={styles.card}>
            <Card.Title>最近使用</Card.Title>
            <View style={styles.featuresContainer}>
              {userProfile.statistics.lastUsedFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* 设置选项 */}
        <Card containerStyle={styles.card}>
          <Card.Title>设置与操作</Card.Title>
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('提示', '设置功能即将推出')}>
              <Settings size={20} color="#007AFF" />
              <Text style={styles.settingText}>应用设置</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('提示', '历史记录功能即将推出')}>
              <History size={20} color="#007AFF" />
              <Text style={styles.settingText}>语音历史</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('提示', '统计信息功能即将推出')}>
              <BarChart3 size={20} color="#007AFF" />
              <Text style={styles.settingText}>使用统计</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('提示', '通知设置功能即将推出')}>
              <Bell size={20} color="#007AFF" />
              <Text style={styles.settingText}>通知设置</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 危险操作 */}
        <Card containerStyle={[styles.card, styles.dangerCard]}>
          <Card.Title style={styles.dangerTitle}>危险操作</Card.Title>
          <Button
            title="清除所有数据"
            onPress={handleClearData}
            buttonStyle={styles.dangerButton}
            titleStyle={styles.dangerButtonText}
          />
        </Card>

        <View style={styles.bottomSpacing} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  headerImage: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  editContainer: {
    gap: 16,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 16,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  statsContainer: {
    gap: 0,
  },
  commandsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commandChip: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  commandText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  settingsContainer: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  dangerCard: {
    borderColor: '#ff3b30',
    borderWidth: 1,
  },
  dangerTitle: {
    color: '#ff3b30',
  },
  dangerButton: {
    backgroundColor: '#ff3b30',
  },
  dangerButtonText: {
    color: '#fff',
  },
  bottomSpacing: {
    height: 32,
  },
});