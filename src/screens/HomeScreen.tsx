import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { User, Exercise } from '../types';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    // 模拟用户数据
    setUser({
      id: '1',
      name: '学习者',
      level: 'intermediate',
      totalScore: 1250,
      streak: 7,
    });

    // 模拟练习数据
    setRecentExercises([
      {
        id: '1',
        type: 'speaking',
        title: '日常对话练习',
        description: '练习基本的日常英语对话',
        difficulty: 'easy',
        content: 'Hello, how are you today?',
      },
      {
        id: '2',
        type: 'listening',
        title: '新闻听力',
        description: '听新闻并回答问题',
        difficulty: 'medium',
        content: 'Today\'s weather forecast...',
      },
    ]);
  }, []);

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return '未知';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
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
            <Icon name="person" size={40} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || '学习者'}</Text>
            <Text style={styles.userLevel}>
              {getLevelText(user?.level || 'beginner')} • 连续学习 {user?.streak || 0} 天
            </Text>
            <Text style={styles.userScore}>总分: {user?.totalScore || 0}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 快速开始 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快速开始</Text>
        <View style={styles.quickStartGrid}>
          <TouchableOpacity style={styles.quickStartItem}>
            <Icon name="mic" size={30} color="#2196F3" />
            <Text style={styles.quickStartText}>口语练习</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickStartItem}>
            <Icon name="headphones" size={30} color="#4CAF50" />
            <Text style={styles.quickStartText}>听力练习</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickStartItem}>
            <Icon name="chat" size={30} color="#FF9800" />
            <Text style={styles.quickStartText}>AI对话</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickStartItem}>
            <Icon name="assessment" size={30} color="#9C27B0" />
            <Text style={styles.quickStartText}>学习报告</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 最近练习 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近练习</Text>
        {recentExercises.map((exercise) => (
          <TouchableOpacity key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseType}>
                <Icon
                  name={exercise.type === 'speaking' ? 'mic' : 'headphones'}
                  size={20}
                  color="#fff"
                />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(exercise.difficulty) },
                ]}
              >
                <Text style={styles.difficultyText}>
                  {getDifficultyText(exercise.difficulty)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 学习统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>学习统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>连续天数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>完成练习</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>平均准确率</Text>
          </View>
        </View>
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userScore: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
  quickStartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStartItem: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  quickStartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseType: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    alignItems: 'center',
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
});

export default HomeScreen;
