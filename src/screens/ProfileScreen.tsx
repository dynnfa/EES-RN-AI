import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import { User } from '../types';

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    autoPlay: true,
    voiceFeedback: true,
    darkMode: false,
  });

  useEffect(() => {
    // 模拟用户数据
    setUser({
      id: '1',
      name: '学习者',
      level: 'intermediate',
      totalScore: 1250,
      streak: 7,
    });
  }, []);

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return '未知';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', style: 'destructive', onPress: () => {
          // 处理退出登录逻辑
          console.log('用户退出登录');
        }},
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      '清除数据',
      '确定要清除所有学习数据吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', style: 'destructive', onPress: () => {
          // 处理清除数据逻辑
          console.log('清除学习数据');
        }},
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 用户信息卡片 */}
      <LinearGradient
        colors={['#2196F3', '#21CBF3']}
        style={styles.userCard}
      >
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Icon name="person" size={50} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || '学习者'}</Text>
            <View style={styles.levelContainer}>
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: getLevelColor(user?.level || 'beginner') },
                ]}
              >
                <Text style={styles.levelText}>
                  {getLevelText(user?.level || 'beginner')}
                </Text>
              </View>
            </View>
            <Text style={styles.userScore}>总分: {user?.totalScore || 0}</Text>
            <Text style={styles.userStreak}>连续学习 {user?.streak || 0} 天</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 学习统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>学习统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>完成练习</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>连续天数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>平均准确率</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>学习小时</Text>
          </View>
        </View>
      </View>

      {/* 成就徽章 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>成就徽章</Text>
        <View style={styles.badgesGrid}>
          <View style={styles.badgeItem}>
            <Icon name="star" size={30} color="#FFD700" />
            <Text style={styles.badgeText}>初学者</Text>
          </View>
          <View style={styles.badgeItem}>
            <Icon name="trending-up" size={30} color="#4CAF50" />
            <Text style={styles.badgeText}>进步之星</Text>
          </View>
          <View style={styles.badgeItem}>
            <Icon name="schedule" size={30} color="#2196F3" />
            <Text style={styles.badgeText}>坚持者</Text>
          </View>
          <View style={styles.badgeItem}>
            <Icon name="mic" size={30} color="#FF9800" />
            <Text style={styles.badgeText}>口语达人</Text>
          </View>
        </View>
      </View>

      {/* 设置选项 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设置</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="notifications" size={24} color="#666" />
            <Text style={styles.settingText}>推送通知</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => handleSettingChange('notifications', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.notifications ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="play-arrow" size={24} color="#666" />
            <Text style={styles.settingText}>自动播放</Text>
          </View>
          <Switch
            value={settings.autoPlay}
            onValueChange={(value) => handleSettingChange('autoPlay', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.autoPlay ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="volume-up" size={24} color="#666" />
            <Text style={styles.settingText}>语音反馈</Text>
          </View>
          <Switch
            value={settings.voiceFeedback}
            onValueChange={(value) => handleSettingChange('voiceFeedback', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.voiceFeedback ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="dark-mode" size={24} color="#666" />
            <Text style={styles.settingText}>深色模式</Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => handleSettingChange('darkMode', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.darkMode ? '#2196F3' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 其他选项 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionInfo}>
            <Icon name="help" size={24} color="#666" />
            <Text style={styles.optionText}>帮助与支持</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionInfo}>
            <Icon name="info" size={24} color="#666" />
            <Text style={styles.optionText}>关于我们</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={handleClearData}>
          <View style={styles.optionInfo}>
            <Icon name="delete" size={24} color="#F44336" />
            <Text style={[styles.optionText, { color: '#F44336' }]}>清除数据</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
          <View style={styles.optionInfo}>
            <Icon name="logout" size={24} color="#F44336" />
            <Text style={[styles.optionText, { color: '#F44336' }]}>退出登录</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userCard: {
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  levelContainer: {
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  userScore: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  userStreak: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  badgeItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default ProfileScreen;
