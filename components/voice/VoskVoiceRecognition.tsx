import React, { useState } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useVoskRecognition } from '../../hooks/useVoskRecognition';

// 模型下载服务
import { downloadModel, getModelPath } from '../../services/vosk-model-manager';

/**
 * Vosk 语音识别测试组件
 *
 * 功能:
 * - 模型下载和管理
 * - 实时语音识别
 * - 权限处理
 * - 状态显示
 */
export default function VoskVoiceRecognition() {
  const [isModelReady, setIsModelReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const {
    isListening,
    isInitialized,
    partialResult,
    finalResult,
    error,
    initialize,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    destroy,
  } = useVoskRecognition({
    onPartialResult: text => {
      console.log('Partial result:', text);
    },
    onFinalResult: result => {
      console.log('Final result:', result.text, 'Confidence:', result.confidence);
    },
    onError: error => {
      console.error('Recognition error:', error);
      Alert.alert('识别错误', error);
    },
    enablePartialResults: true,
  });

  // 请求权限
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '录音权限',
          message: '应用需要录音权限来进行语音识别',
          buttonNeutral: '稍后询问',
          buttonNegative: '取消',
          buttonPositive: '允许',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // iOS 权限在 Info.plist 中配置
      return true;
    }
  };

  // 下载模型
  const handleDownloadModel = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // 下载英文小型模型
      await downloadModel('en-US-small', (progress: number) => {
        setDownloadProgress(progress);
      });

      setIsModelReady(true);
      Alert.alert('下载完成', '语音识别模型下载成功');
    } catch (error) {
      console.error('Model download failed:', error);
      Alert.alert('下载失败', '模型下载失败，请检查网络连接');
    } finally {
      setIsDownloading(false);
    }
  };

  // 初始化 Vosk
  const handleInitialize = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('权限拒绝', '需要录音权限才能使用语音识别');
        return;
      }

      if (!isModelReady) {
        Alert.alert('模型未就绪', '请先下载语音识别模型');
        return;
      }

      const modelPath = await getModelPath('vosk-model-small-en-us-0.15');

      await initialize({
        modelPath,
        sampleRate: 16000,
        enablePartialResults: true,
        maxAlternatives: 1,
      });

      Alert.alert('初始化成功', '语音识别已准备就绪');
    } catch (error) {
      console.error('Initialization failed:', error);
      Alert.alert('初始化失败', '语音识别初始化失败');
    }
  };

  // 开始识别
  const handleStartRecognition = async () => {
    try {
      await startListening();
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }
  };

  // 停止识别
  const handleStopRecognition = async () => {
    try {
      const result = await stopListening();
      console.log('Final recognition result:', result);
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  };

  // 清理资源
  const handleCleanup = () => {
    destroy();
    setIsModelReady(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Vosk 离线语音识别</Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>模型状态:</Text>
          <Text
            style={[styles.statusValue, isModelReady ? styles.statusReady : styles.statusNotReady]}
          >
            {isModelReady ? '已就绪' : '未下载'}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>初始化状态:</Text>
          <Text
            style={[styles.statusValue, isInitialized ? styles.statusReady : styles.statusNotReady]}
          >
            {isInitialized ? '已初始化' : '未初始化'}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>识别状态:</Text>
          <Text
            style={[styles.statusValue, isListening ? styles.statusActive : styles.statusInactive]}
          >
            {isListening ? '正在识别' : '未开始'}
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>错误: {error}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>模型管理</Text>

        {!isModelReady && !isDownloading && (
          <TouchableOpacity style={styles.button} onPress={handleDownloadModel}>
            <Text style={styles.buttonText}>下载语音识别模型</Text>
          </TouchableOpacity>
        )}

        {isDownloading && (
          <View style={styles.downloadContainer}>
            <Text style={styles.downloadText}>
              正在下载模型... {Math.round(downloadProgress * 100)}%
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${downloadProgress * 100}%` }]} />
            </View>
          </View>
        )}

        {isModelReady && !isInitialized && (
          <TouchableOpacity style={styles.button} onPress={handleInitialize}>
            <Text style={styles.buttonText}>初始化语音识别</Text>
          </TouchableOpacity>
        )}
      </View>

      {isInitialized && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>语音识别控制</Text>

          {!isListening ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStartRecognition}
            >
              <Text style={styles.buttonText}>开始识别</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStopRecognition}
            >
              <Text style={styles.buttonText}>停止识别</Text>
            </TouchableOpacity>
          )}

          {isListening && (
            <TouchableOpacity style={styles.button} onPress={pauseListening}>
              <Text style={styles.buttonText}>暂停识别</Text>
            </TouchableOpacity>
          )}

          {!isListening && isInitialized && (
            <TouchableOpacity style={styles.button} onPress={resumeListening}>
              <Text style={styles.buttonText}>恢复识别</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {(partialResult || finalResult) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>识别结果</Text>

          {partialResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>中间结果:</Text>
              <Text style={styles.resultText}>{partialResult}</Text>
            </View>
          )}

          {finalResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>最终结果:</Text>
              <Text style={styles.resultText}>{finalResult.text}</Text>
              <Text style={styles.confidenceText}>
                置信度: {Math.round(finalResult.confidence * 100)}%
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={[styles.button, styles.cleanupButton]} onPress={handleCleanup}>
          <Text style={styles.buttonText}>清理资源</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusReady: {
    color: '#4CAF50',
  },
  statusNotReady: {
    color: '#f44336',
  },
  statusActive: {
    color: '#2196F3',
  },
  statusInactive: {
    color: '#9E9E9E',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 4,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  cleanupButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadContainer: {
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
