import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import audioService from '../services/audioService';
import aiService from '../services/aiService';

interface ListeningExercise {
  id: string;
  title: string;
  audioText: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

const ListeningPracticeScreen: React.FC = () => {
  const [currentExercise, setCurrentExercise] = useState<ListeningExercise | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // 模拟听力练习数据
  const listeningExercises: ListeningExercise[] = [
    {
      id: '1',
      title: '日常对话听力',
      audioText: 'Hello, I would like to order a coffee and a sandwich. What would you recommend?',
      questions: [
        {
          id: 'q1',
          question: 'What does the person want to order?',
          options: ['Coffee and sandwich', 'Tea and cake', 'Juice and salad', 'Water and bread'],
          correctAnswer: 0,
        },
        {
          id: 'q2',
          question: 'What does the person ask for?',
          options: ['Price', 'Recommendation', 'Time', 'Location'],
          correctAnswer: 1,
        },
      ],
    },
    {
      id: '2',
      title: '新闻听力',
      audioText: 'The weather today will be sunny with a high of 25 degrees Celsius. There might be some clouds in the afternoon.',
      questions: [
        {
          id: 'q1',
          question: 'What is the weather like today?',
          options: ['Rainy', 'Sunny', 'Cloudy', 'Snowy'],
          correctAnswer: 1,
        },
        {
          id: 'q2',
          question: 'What is the temperature?',
          options: ['20°C', '25°C', '30°C', '15°C'],
          correctAnswer: 1,
        },
      ],
    },
  ];

  const [exerciseIndex, setExerciseIndex] = useState(0);

  useEffect(() => {
    setCurrentExercise(listeningExercises[exerciseIndex]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(null);
  }, [exerciseIndex]);

  const playAudio = async () => {
    try {
      setIsPlaying(true);
      // 这里应该播放真实的音频文件
      // 现在使用文本转语音API生成音频
      const audioUrl = await aiService.textToSpeech(currentExercise?.audioText || '');
      await audioService.playAudio(audioUrl);
      setIsPlaying(false);
    } catch (error) {
      Alert.alert('错误', '播放音频失败');
      setIsPlaying(false);
    }
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (currentExercise?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitAnswers = () => {
    if (!currentExercise) return;

    let correctCount = 0;
    currentExercise.questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / currentExercise.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const nextExercise = () => {
    if (exerciseIndex < listeningExercises.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
    }
  };

  const prevExercise = () => {
    if (exerciseIndex > 0) {
      setExerciseIndex(exerciseIndex - 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    return '需要改进';
  };

  if (!currentExercise) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const currentQuestion = currentExercise.questions[currentQuestionIndex];

  return (
    <ScrollView style={styles.container}>
      {/* 练习信息 */}
      <View style={styles.exerciseCard}>
        <Text style={styles.exerciseTitle}>{currentExercise.title}</Text>
        <Text style={styles.exerciseCounter}>
          练习 {exerciseIndex + 1} / {listeningExercises.length}
        </Text>
      </View>

      {/* 音频播放控制 */}
      <View style={styles.audioCard}>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={playAudio}
          disabled={isPlaying}
        >
          <Icon
            name={isPlaying ? 'stop' : 'play-arrow'}
            size={40}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.playText}>
          {isPlaying ? '正在播放...' : '点击播放音频'}
        </Text>
        <Text style={styles.audioHint}>
          请仔细听音频内容，然后回答问题
        </Text>
      </View>

      {/* 问题导航 */}
      <View style={styles.questionNav}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Icon name="chevron-left" size={24} color={currentQuestionIndex === 0 ? '#ccc' : '#2196F3'} />
        </TouchableOpacity>
        
        <Text style={styles.questionCounter}>
          问题 {currentQuestionIndex + 1} / {currentExercise.questions.length}
        </Text>
        
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === currentExercise.questions.length - 1 && styles.navButtonDisabled]}
          onPress={nextQuestion}
          disabled={currentQuestionIndex === currentExercise.questions.length - 1}
        >
          <Icon name="chevron-right" size={24} color={currentQuestionIndex === currentExercise.questions.length - 1 ? '#ccc' : '#2196F3'} />
        </TouchableOpacity>
      </View>

      {/* 当前问题 */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                userAnswers[currentQuestion.id] === index && styles.optionButtonSelected,
                showResults && index === currentQuestion.correctAnswer && styles.optionButtonCorrect,
                showResults && userAnswers[currentQuestion.id] === index && index !== currentQuestion.correctAnswer && styles.optionButtonWrong,
              ]}
              onPress={() => selectAnswer(currentQuestion.id, index)}
              disabled={showResults}
            >
              <Text style={[
                styles.optionText,
                userAnswers[currentQuestion.id] === index && styles.optionTextSelected,
                showResults && index === currentQuestion.correctAnswer && styles.optionTextCorrect,
                showResults && userAnswers[currentQuestion.id] === index && index !== currentQuestion.correctAnswer && styles.optionTextWrong,
              ]}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 提交按钮 */}
      {!showResults && (
        <TouchableOpacity style={styles.submitButton} onPress={submitAnswers}>
          <Text style={styles.submitButtonText}>提交答案</Text>
        </TouchableOpacity>
      )}

      {/* 结果显示 */}
      {showResults && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>练习结果</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(score || 0) }]}>
              {score}
            </Text>
            <Text style={styles.scoreLabel}>分</Text>
          </View>
          <Text style={[styles.scoreText, { color: getScoreColor(score || 0) }]}>
            {getScoreText(score || 0)}
          </Text>
          
          <View style={styles.exerciseNavigation}>
            <TouchableOpacity
              style={[styles.exerciseNavButton, exerciseIndex === 0 && styles.exerciseNavButtonDisabled]}
              onPress={prevExercise}
              disabled={exerciseIndex === 0}
            >
              <Icon name="chevron-left" size={20} color={exerciseIndex === 0 ? '#ccc' : '#2196F3'} />
              <Text style={[styles.exerciseNavText, exerciseIndex === 0 && styles.exerciseNavTextDisabled]}>
                上一题
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.exerciseNavButton, exerciseIndex === listeningExercises.length - 1 && styles.exerciseNavButtonDisabled]}
              onPress={nextExercise}
              disabled={exerciseIndex === listeningExercises.length - 1}
            >
              <Text style={[styles.exerciseNavText, exerciseIndex === listeningExercises.length - 1 && styles.exerciseNavTextDisabled]}>
                下一题
              </Text>
              <Icon name="chevron-right" size={20} color={exerciseIndex === listeningExercises.length - 1 ? '#ccc' : '#2196F3'} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  exerciseCard: {
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
  exerciseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exerciseCounter: {
    fontSize: 14,
    color: '#666',
  },
  audioCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButtonActive: {
    backgroundColor: '#F44336',
  },
  playText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  audioHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  questionNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 0,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  questionCounter: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  questionCard: {
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
  questionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionButtonCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  optionButtonWrong: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#F44336',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 24,
    color: '#666',
    marginLeft: 4,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  exerciseNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  exerciseNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  exerciseNavButtonDisabled: {
    opacity: 0.5,
  },
  exerciseNavText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  exerciseNavTextDisabled: {
    color: '#ccc',
  },
});

export default ListeningPracticeScreen;
