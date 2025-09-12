import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import audioService from '../services/audioService';
import aiService from '../services/aiService';
import { Recording } from '../types';

const { width } = Dimensions.get('window');

const SpeakingPracticeScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  // 练习文本
  const practiceTexts = [
    "Hello, how are you today?",
    "I would like to order a coffee, please.",
    "Could you please help me with this?",
    "What time is it now?",
    "I'm learning English and I love it!",
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    setCurrentText(practiceTexts[currentTextIndex]);
  }, [currentTextIndex]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await audioService.startRecording();
    } catch (error) {
      Alert.alert('错误', error.message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const audioPath = await audioService.stopRecording();
      
      // 模拟AI处理
      setTimeout(async () => {
        try {
          // 这里应该调用真实的AI服务
          const aiResponse = await aiService.evaluatePronunciation(
            currentText,
            currentText // 模拟用户发音文本
          );

          const newRecording: Recording = {
            id: Date.now().toString(),
            text: currentText,
            audioPath,
            duration: 5, // 模拟时长
            score: aiResponse.score,
            feedback: aiResponse.text,
            timestamp: new Date(),
          };

          setRecordings(prev => [newRecording, ...prev]);
          setScore(aiResponse.score || 0);
          setFeedback(aiResponse.text);
          setIsProcessing(false);
        } catch (error) {
          Alert.alert('错误', 'AI评估失败');
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      Alert.alert('错误', error.message);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const nextText = () => {
    if (currentTextIndex < practiceTexts.length - 1) {
      setCurrentTextIndex(currentTextIndex + 1);
      setScore(null);
      setFeedback('');
    }
  };

  const prevText = () => {
    if (currentTextIndex > 0) {
      setCurrentTextIndex(currentTextIndex - 1);
      setScore(null);
      setFeedback('');
    }
  };

  const playRecording = async (recording: Recording) => {
    try {
      await audioService.playAudio(recording.audioPath);
    } catch (error) {
      Alert.alert('错误', '播放录音失败');
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

  return (
    <ScrollView style={styles.container}>
      {/* 当前练习文本 */}
      <View style={styles.textCard}>
        <Text style={styles.textTitle}>请朗读以下句子：</Text>
        <Text style={styles.practiceText}>{currentText}</Text>
        
        <View style={styles.textNavigation}>
          <TouchableOpacity
            style={[styles.navButton, currentTextIndex === 0 && styles.navButtonDisabled]}
            onPress={prevText}
            disabled={currentTextIndex === 0}
          >
            <Icon name="chevron-left" size={24} color={currentTextIndex === 0 ? '#ccc' : '#2196F3'} />
          </TouchableOpacity>
          
          <Text style={styles.textCounter}>
            {currentTextIndex + 1} / {practiceTexts.length}
          </Text>
          
          <TouchableOpacity
            style={[styles.navButton, currentTextIndex === practiceTexts.length - 1 && styles.navButtonDisabled]}
            onPress={nextText}
            disabled={currentTextIndex === practiceTexts.length - 1}
          >
            <Icon name="chevron-right" size={24} color={currentTextIndex === practiceTexts.length - 1 ? '#ccc' : '#2196F3'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 录音控制 */}
      <View style={styles.recordingCard}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            isProcessing && styles.recordButtonProcessing,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          <Icon
            name={isRecording ? 'stop' : 'mic'}
            size={40}
            color="#fff"
          />
        </TouchableOpacity>
        
        <Text style={styles.recordText}>
          {isProcessing ? 'AI正在评估中...' : isRecording ? '点击停止录音' : '点击开始录音'}
        </Text>
      </View>

      {/* 评分结果 */}
      {score !== null && (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>发音评分</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
              {score}
            </Text>
            <Text style={styles.scoreLabel}>分</Text>
          </View>
          <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
            {getScoreText(score)}
          </Text>
          {feedback && (
            <Text style={styles.feedbackText}>{feedback}</Text>
          )}
        </View>
      )}

      {/* 录音历史 */}
      {recordings.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>录音历史</Text>
          {recordings.slice(0, 5).map((recording) => (
            <View key={recording.id} style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyText} numberOfLines={2}>
                  {recording.text}
                </Text>
                <Text style={styles.historyTime}>
                  {recording.timestamp.toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.historyActions}>
                {recording.score && (
                  <Text style={[styles.historyScore, { color: getScoreColor(recording.score) }]}>
                    {recording.score}分
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => playRecording(recording)}
                >
                  <Icon name="play-arrow" size={20} color="#2196F3" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  textCard: {
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
  textTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  practiceText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  textNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  textCounter: {
    fontSize: 14,
    color: '#666',
  },
  recordingCard: {
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
  recordButton: {
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
  recordButtonActive: {
    backgroundColor: '#F44336',
  },
  recordButtonProcessing: {
    backgroundColor: '#FF9800',
  },
  recordText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scoreCard: {
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
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  historyCard: {
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
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyInfo: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyScore: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  playButton: {
    padding: 8,
  },
});

export default SpeakingPracticeScreen;
