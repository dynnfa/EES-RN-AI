import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../types';

type ExerciseDetailScreenRouteProp = RouteProp<RootStackParamList, 'ExerciseDetail'>;
type ExerciseDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExerciseDetail'>;

interface Props {
  route: ExerciseDetailScreenRouteProp;
  navigation: ExerciseDetailScreenNavigationProp;
}

const ExerciseDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { exercise } = route.params;

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

  const getTypeIcon = (type: string) => {
    return type === 'speaking' ? 'mic' : 'headphones';
  };

  const getTypeText = (type: string) => {
    return type === 'speaking' ? '口语练习' : '听力练习';
  };

  const startExercise = () => {
    // 根据练习类型导航到相应的屏幕
    if (exercise.type === 'speaking') {
      navigation.navigate('SpeakingPractice');
    } else {
      navigation.navigate('ListeningPractice');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 练习头部信息 */}
      <View style={styles.headerCard}>
        <View style={styles.exerciseType}>
          <Icon
            name={getTypeIcon(exercise.type)}
            size={30}
            color="#fff"
          />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          <View style={styles.exerciseMeta}>
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
            <Text style={styles.typeText}>{getTypeText(exercise.type)}</Text>
          </View>
        </View>
      </View>

      {/* 练习内容 */}
      <View style={styles.contentCard}>
        <Text style={styles.contentTitle}>练习内容</Text>
        <Text style={styles.contentText}>{exercise.content}</Text>
      </View>

      {/* 练习说明 */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>练习说明</Text>
        {exercise.type === 'speaking' ? (
          <View>
            <Text style={styles.instructionItem}>
              • 仔细阅读练习文本
            </Text>
            <Text style={styles.instructionItem}>
              • 点击录音按钮开始朗读
            </Text>
            <Text style={styles.instructionItem}>
              • 朗读完成后点击停止按钮
            </Text>
            <Text style={styles.instructionItem}>
              • AI将评估你的发音并给出建议
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.instructionItem}>
              • 点击播放按钮听音频内容
            </Text>
            <Text style={styles.instructionItem}>
              • 仔细听音频并理解内容
            </Text>
            <Text style={styles.instructionItem}>
              • 回答相关问题
            </Text>
            <Text style={styles.instructionItem}>
              • 提交答案查看结果
            </Text>
          </View>
        )}
      </View>

      {/* 学习目标 */}
      <View style={styles.goalsCard}>
        <Text style={styles.goalsTitle}>学习目标</Text>
        <View style={styles.goalsList}>
          <View style={styles.goalItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.goalText}>提高发音准确性</Text>
          </View>
          <View style={styles.goalItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.goalText}>增强语言流利度</Text>
          </View>
          <View style={styles.goalItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.goalText}>建立学习信心</Text>
          </View>
        </View>
      </View>

      {/* 开始练习按钮 */}
      <TouchableOpacity style={styles.startButton} onPress={startExercise}>
        <Text style={styles.startButtonText}>开始练习</Text>
        <Icon name="play-arrow" size={24} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  exerciseType: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  contentCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  instructionItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
  goalsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  startButton: {
    backgroundColor: '#2196F3',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default ExerciseDetailScreen;
