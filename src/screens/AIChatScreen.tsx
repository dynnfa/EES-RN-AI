import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import aiService from '../services/aiService';
import audioService from '../services/audioService';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

const AIChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 预设话题
  const topics = [
    '自我介绍',
    '日常对话',
    '工作面试',
    '旅行计划',
    '兴趣爱好',
    '学习英语',
  ];

  useEffect(() => {
    // 添加欢迎消息
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: '你好！我是你的AI英语学习助手。你可以选择话题开始对话，或者直接输入你想练习的内容。',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // 调用AI生成回复
      const aiResponse = await aiService.generateConversation(text, 'intermediate');
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      Alert.alert('错误', 'AI回复失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const startVoiceInput = async () => {
    try {
      setIsRecording(true);
      await audioService.startRecording();
    } catch (error) {
      Alert.alert('错误', error.message);
      setIsRecording(false);
    }
  };

  const stopVoiceInput = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      const audioPath = await audioService.stopRecording();
      
      // 模拟语音识别
      setTimeout(async () => {
        try {
          // 这里应该调用真实的语音识别API
          const recognizedText = 'Hello, how are you today?'; // 模拟识别结果
          
          const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: recognizedText,
            isUser: true,
            timestamp: new Date(),
            audioUrl: audioPath,
          };

          setMessages(prev => [...prev, userMessage]);
          
          // 生成AI回复
          const aiResponse = await aiService.generateConversation(recognizedText, 'intermediate');
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, aiMessage]);
          setIsProcessing(false);
        } catch (error) {
          Alert.alert('错误', '语音识别失败');
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      Alert.alert('错误', error.message);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const selectTopic = (topic: string) => {
    sendMessage(`我想练习关于"${topic}"的对话`);
  };

  const playMessage = async (message: ChatMessage) => {
    if (message.audioUrl) {
      try {
        await audioService.playAudio(message.audioUrl);
      } catch (error) {
        Alert.alert('错误', '播放音频失败');
      }
    } else {
      // 使用TTS播放文本
      try {
        const audioUrl = await aiService.textToSpeech(message.text);
        await audioService.playAudio(audioUrl);
      } catch (error) {
        Alert.alert('错误', '语音合成失败');
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 聊天消息 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.aiText,
                ]}
              >
                {message.text}
              </Text>
              <View style={styles.messageFooter}>
                <Text style={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </Text>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => playMessage(message)}
                >
                  <Icon name="volume-up" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        
        {isProcessing && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={[styles.messageText, styles.aiText]}>
                AI正在思考中...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 话题选择 */}
      {messages.length === 1 && (
        <View style={styles.topicsContainer}>
          <Text style={styles.topicsTitle}>选择话题开始对话：</Text>
          <View style={styles.topicsGrid}>
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={styles.topicButton}
                onPress={() => selectTopic(topic)}
              >
                <Text style={styles.topicText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="输入消息..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonActive,
            ]}
            onPress={isRecording ? stopVoiceInput : startVoiceInput}
            disabled={isProcessing}
          >
            <Icon
              name={isRecording ? 'stop' : 'mic'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isProcessing}
          >
            <Icon name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  playButton: {
    padding: 4,
    marginLeft: 8,
  },
  topicsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  topicText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#F44336',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default AIChatScreen;
