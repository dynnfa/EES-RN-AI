import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Button, Card, Input } from "react-native-elements";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  PlayCircle,
  User,
  History,
  Settings,
} from "lucide-react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSpeechControls } from "@/src/hooks/useSpeechControls";
import { useRouter } from "expo-router";

export default function VoiceScreen() {
  const router = useRouter();
  const {
    isListening,
    isSpeaking,
    recognizedText,
    recognitionState,
    ttsState,
    startListening,
    stopListening,
    speak,
    stop,
    clearRecognizedText,
    simulateVoiceInput,
    toggleListening,
    toggleSpeaking,
  } = useSpeechControls();

  const [textToSpeak, setTextToSpeak] = useState("");

  const handleVoiceInput = async () => {
    try {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      Alert.alert("语音识别错误", "请检查麦克风权限");
    }
  };

  const handleTextToSpeech = async () => {
    try {
      if (textToSpeak.trim()) {
        await speak(textToSpeak);
      } else if (recognizedText) {
        await speak(recognizedText);
      } else {
        Alert.alert("提示", "请输入要朗读的文本");
      }
    } catch (error) {
      Alert.alert("文本转语音错误", "语音合成失败");
    }
  };

  const handleTestRecognition = () => {
    // 测试用的模拟语音输入
    simulateVoiceInput("这是测试语音识别的模拟输入");
  };

  const getStatusColor = () => {
    switch (recognitionState) {
      case "listening":
        return "#00ff00";
      case "error":
        return "#ff0000";
      default:
        return "#666666";
    }
  };

  const getStateText = () => {
    switch (recognitionState) {
      case "listening":
        return "正在监听...";
      case "processing":
        return "处理中...";
      case "error":
        return "语音识别错误";
      case "unavailable":
        return "语音识别不可用";
      default:
        return "语音识别就绪";
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <View style={styles.headerImage}>
          <Mic size={120} color="#fff" />
        </View>
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">语音功能演示</ThemedText>
        </ThemedView>

        {/* 状态指示器 */}
        <Card containerStyle={styles.card}>
          <Card.Title>语音识别状态</Card.Title>
          <View style={styles.statusContainer}>
            <View
              style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
            />
            <Text style={styles.statusText}>{getStateText()}</Text>
          </View>
        </Card>

        {/* 语音识别控制 */}
        <Card containerStyle={styles.card}>
          <Card.Title>语音转文字</Card.Title>

          <Button
            title={isListening ? "停止识别" : "开始识别"}
            onPress={handleVoiceInput}
            icon={
              isListening ? (
                <MicOff size={20} color="white" />
              ) : (
                <Mic size={20} color="white" />
              )
            }
            buttonStyle={[
              styles.primaryButton,
              isListening && styles.recordingButton,
            ]}
            containerStyle={styles.buttonContainer}
          />

          {/* 识别结果展示 */}
          {recognizedText ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>识别结果:</Text>
              <Text style={styles.resultText}>{recognizedText}</Text>
              <Button
                title="清空"
                onPress={clearRecognizedText}
                type="clear"
                titleStyle={styles.clearButtonText}
              />
            </View>
          ) : null}

          {/* 测试按钮（开发用） */}
          {__DEV__ && (
            <Button
              title="测试识别"
              onPress={handleTestRecognition}
              type="outline"
              containerStyle={styles.testButtonContainer}
            />
          )}
        </Card>

        {/* 文本转语音控制 */}
        <Card containerStyle={styles.card}>
          <Card.Title>文字转语音</Card.Title>

          <Input
            placeholder="输入要朗读的文本..."
            value={textToSpeak}
            onChangeText={setTextToSpeak}
            multiline
            numberOfLines={3}
            containerStyle={styles.inputContainer}
          />

          <Button
            title={isSpeaking ? "停止朗读" : "开始朗读"}
            onPress={handleTextToSpeech}
            icon={
              isSpeaking ? (
                <VolumeX size={20} color="white" />
              ) : (
                <Volume2 size={20} color="white" />
              )
            }
            buttonStyle={styles.primaryButton}
            containerStyle={styles.buttonContainer}
          />
        </Card>

        {/* 便捷操作 */}
        <Card containerStyle={styles.card}>
          <Card.Title>便捷操作</Card.Title>

          <Button
            title="朗读识别结果"
            onPress={() => speak(recognizedText)}
            disabled={!recognizedText || isSpeaking}
            icon={<Play size={20} color="white" />}
            buttonStyle={styles.secondaryButton}
            containerStyle={styles.buttonContainer}
          />
        </Card>

        {/* 快捷导航 */}
        <Card containerStyle={styles.card}>
          <Card.Title>快捷导航</Card.Title>
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push("/history")}
            >
              <History size={24} color="#007AFF" />
              <Text style={styles.navButtonText}>语音历史</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push("/profile")}
            >
              <User size={24} color="#af52de" />
              <Text style={styles.navButtonText}>个人资料</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push("/settings")}
            >
              <Settings size={24} color="#ff9500" />
              <Text style={styles.navButtonText}>设置</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 技术说明 */}
        <Card containerStyle={styles.card}>
          <Card.Title>技术说明</Card.Title>
          <Text style={styles.infoText}>
            本页面展示了语音识别和文本转语音功能。{"\n"}
            语音识别：支持中文语音转文字{"\n"}
            文本转语音：支持文字朗读功能{"\n"}
            开发环境包含测试功能
          </Text>
        </Card>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: "#666",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
  },
  buttonContainer: {
    marginVertical: 8,
  },
  testButtonContainer: {
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 8,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  clearButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 12,
  },
  navButton: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    minWidth: 100,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navButtonText: {
    fontSize: 12,
    color: "#333",
    marginTop: 8,
    fontWeight: "500",
    textAlign: "center",
  },
});
