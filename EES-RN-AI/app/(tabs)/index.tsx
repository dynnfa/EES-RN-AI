import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Card, Button } from "react-native-elements";
import {
  User,
  History,
  Settings,
  Mic,
  Play,
  Volume2,
  ChevronRight,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter, Link } from "expo-router";
import { useSpeech } from "@/src/contexts/SpeechContext";

export default function HomeScreen() {
  const router = useRouter();
  const { isListening, recognizedText } = useSpeech();

  const quickActions = [
    {
      icon: <Mic size={24} color="#007AFF" />,
      title: "语音识别",
      subtitle: "开始语音转文字",
      onPress: () => router.push("/(tabs)/voice"),
    },
    {
      icon: <Volume2 size={24} color="#34c759" />,
      title: "文本转语音",
      subtitle: "文字转语音播放",
      onPress: () => router.push("/(tabs)/voice"),
    },
    {
      icon: <History size={24} color="#ff9500" />,
      title: "语音历史",
      subtitle: "查看历史记录",
      onPress: () => router.push("/history"),
    },
    {
      icon: <User size={24} color="#af52de" />,
      title: "个人资料",
      subtitle: "管理用户信息",
      onPress: () => router.push("/profile"),
    },
  ];

  const recentStats = [
    {
      icon: <Activity size={20} color="#007AFF" />,
      label: "今日会话",
      value: "3",
    },
    {
      icon: <Clock size={20} color="#34c759" />,
      label: "使用时长",
      value: "15分钟",
    },
    {
      icon: <TrendingUp size={20} color="#ff9500" />,
      label: "识别准确度",
      value: "94%",
    },
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <View style={styles.headerImage}>
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        </View>
      }
    >
      <ThemedView style={styles.container}>
        {/* 欢迎区域 */}
        <View style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            欢迎使用 EES 语音应用
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            智能语音识别与文本转语音解决方案
          </ThemedText>
        </View>

        {/* 状态卡片 */}
        <Card containerStyle={styles.statusCard}>
          <Card.Title>应用状态</Card.Title>
          <View style={styles.statusContent}>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: isListening ? "#34c759" : "#ccc",
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {isListening ? "正在监听" : "等待语音"}
              </Text>
            </View>
            <Text style={styles.lastResultText}>
              {recognizedText ? `"${recognizedText}"` : "暂无识别结果"}
            </Text>
          </View>
        </Card>

        {/* 快速操作 */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            快速操作
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.actionIcon}>{action.icon}</View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <ChevronRight size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 使用统计 */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            今日统计
          </ThemedText>
          <View style={styles.statsContainer}>
            {recentStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statIcon}>{stat.icon}</View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 功能介绍 */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            功能亮点
          </ThemedText>
          <Card containerStyle={styles.featureCard}>
            <Card.Title>智能语音处理</Card.Title>
            <View style={styles.featuresList}>
              <Text style={styles.featureText}>✓ 高精度语音识别</Text>
              <Text style={styles.featureText}>✓ 多语言文本转语音</Text>
              <Text style={styles.featureText}>✓ 实时语音处理</Text>
              <Text style={styles.featureText}>✓ 历史记录管理</Text>
              <Text style={styles.featureText}>✓ 用户配置定制</Text>
            </View>
          </Card>
        </View>

        {/* 底部操作按钮 */}
        <View style={styles.bottomActions}>
          <Button
            title="开始使用"
            icon={<Play size={20} color="#fff" />}
            onPress={() => router.push("/(tabs)/voice")}
            buttonStyle={styles.primaryButton}
            titleStyle={styles.primaryButtonText}
          />
          <Button
            title="设置"
            icon={<Settings size={20} color="#007AFF" />}
            onPress={() => router.push("/settings")}
            type="outline"
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonText}
          />
        </View>

        <View style={styles.bottomSpacing} />
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
    justifyContent: "center",
    alignItems: "center",
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  statusCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  statusContent: {
    gap: 8,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: "#333",
  },
  lastResultText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  quickActionsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  featureCard: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  featuresList: {
    marginTop: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomActions: {
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 32,
  },
});
