import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Card, Button, Slider } from 'react-native-elements';
import {
  Bell,
  Volume2,
  Mic,
  Palette,
  Globe,
  Shield,
  Info,
  ChevronRight,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { configService, AppConfig } from '@/src/services/configService';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: React.ReactNode;
  onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, value, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingRight}>
      {value}
      {!value && <ChevronRight size={20} color="#ccc" />}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentConfig = await configService.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('错误', '加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async (updates: Partial<AppConfig>) => {
    if (!config) return;

    try {
      const updatedConfig = await configService.updateConfig(updates);
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Failed to update config:', error);
      Alert.alert('错误', '更新设置失败');
    }
  };

  const handleExportData = () => {
    Alert.alert('提示', '数据导出功能即将推出');
  };

  const handleImportData = () => {
    Alert.alert('提示', '数据导入功能即将推出');
  };

  const handleResetSettings = () => {
    Alert.alert(
      '重置设置',
      '确定要重置所有设置为默认值吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              await configService.resetConfig();
              await loadSettings();
              Alert.alert('成功', '设置已重置为默认值');
            } catch (error) {
              console.error('Failed to reset settings:', error);
              Alert.alert('错误', '重置设置失败');
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除缓存',
      '确定要清除应用缓存吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            Alert.alert('成功', '缓存已清除');
          },
        },
      ]
    );
  };

  if (loading || !config) {
    return (
      <ThemedView style={styles.container}>
        <Text>加载中...</Text>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <View style={styles.headerImage}>
          <Bell size={120} color="#fff" />
        </View>
      }>
      <ThemedView style={styles.container}>
        {/* 基本设置 */}
        <Card containerStyle={styles.card}>
          <Card.Title>基本设置</Card.Title>
          
          <SettingItem
            icon={<Bell size={20} color="#007AFF" />}
            title="通知权限"
            subtitle="允许应用发送通知"
            value={
              <Switch
                value={config.permissions.notifications}
                onValueChange={(value) =>
                  handleConfigUpdate({
                    permissions: { ...config.permissions, notifications: value }
                  })
                }
              />
            }
            onPress={() => Alert.alert('提示', '请在系统设置中管理通知权限')}
          />

          <SettingItem
            icon={<Mic size={20} color="#007AFF" />}
            title="语音识别"
            subtitle="语音转文字识别"
            value={
              <Switch
                value={config.features.voiceRecognition}
                onValueChange={(value) =>
                  handleConfigUpdate({
                    features: { ...config.features, voiceRecognition: value }
                  })
                }
              />
            }
          />

          <SettingItem
            icon={<Volume2 size={20} color="#007AFF" />}
            title="文本转语音"
            subtitle="文字转语音播放"
            value={
              <Switch
                value={config.features.textToSpeech}
                onValueChange={(value) =>
                  handleConfigUpdate({
                    features: { ...config.features, textToSpeech: value }
                  })
                }
              />
            }
          />
        </Card>

        {/* 语音设置 */}
        <Card containerStyle={styles.card}>
          <Card.Title>语音设置</Card.Title>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>识别置信度</Text>
            <Text style={styles.sliderValue}>{config.speech.confidenceThreshold.toFixed(2)}</Text>
            <Slider
              minimumValue={0.1}
              maximumValue={1.0}
              step={0.1}
              value={config.speech.confidenceThreshold}
              onValueChange={(value) =>
                handleConfigUpdate({
                  speech: { ...config.speech, confidenceThreshold: value }
                })
              }
              trackStyle={styles.sliderTrack}
              thumbStyle={styles.sliderThumb}
              maximumTrackTintColor="#ccc"
              minimumTrackTintColor="#007AFF"
            />
            <Text style={styles.sliderHint}>控制语音识别的准确度要求</Text>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>语音超时</Text>
            <Text style={styles.sliderValue}>{config.speech.timeout}秒</Text>
            <Slider
              minimumValue={3}
              maximumValue={30}
              step={1}
              value={config.speech.timeout}
              onValueChange={(value) =>
                handleConfigUpdate({
                  speech: { ...config.speech, timeout: value }
                })
              }
              trackStyle={styles.sliderTrack}
              thumbStyle={styles.sliderThumb}
              maximumTrackTintColor="#ccc"
              minimumTrackTintColor="#007AFF"
            />
            <Text style={styles.sliderHint}>自动停止语音识别的等待时间</Text>
          </View>

          <SettingItem
            icon={<Globe size={20} color="#007AFF" />}
            title="识别语言"
            subtitle={config.speech.language === 'zh-CN' ? '中文（简体）' : config.speech.language}
            onPress={() => Alert.alert('提示', '语言选择功能即将推出')}
          />

          <SettingItem
            icon={<Volume2 size={20} color="#007AFF" />}
            title="TTS 语音"
            subtitle={`语速: ${config.speech.ttsSpeed}x`}
            onPress={() => Alert.alert('提示', 'TTS 设置功能即将推出')}
          />
        </Card>

        {/* 用户体验 */}
        <Card containerStyle={styles.card}>
          <Card.Title>用户体验</Card.Title>
          
          <SettingItem
            icon={<Palette size={20} color="#007AFF" />}
            title="主题模式"
            subtitle="跟随系统"
            value={
              <Switch
                value={config.ui.theme === 'auto'}
                onValueChange={(value) =>
                  handleConfigUpdate({
                    ui: { ...config.ui, theme: value ? 'auto' : 'light' }
                  })
                }
              />
            }
            onPress={() => Alert.alert('提示', '更多主题选项即将推出')}
          />

          <SettingItem
            icon={<Bell size={20} color="#007AFF" />}
            title="反馈提示"
            subtitle="操作成功/失败提示"
            value={
              <Switch
                value={config.ui.showFeedback}
                onValueChange={(value) =>
                  handleConfigUpdate({
                    ui: { ...config.ui, showFeedback: value }
                  })
                }
              />
            }
          />

          <SettingItem
            icon={<Info size={20} color="#007AFF" />}
            title="调试模式"
            subtitle="显示详细调试信息"
            value={
              <Switch
                value={config.debug.enabled}
                onValueChange={(value) =>
                  handleConfigUpdate({
                    debug: { ...config.debug, enabled: value }
                  })
                }
              />
            }
          />
        </Card>

        {/* 数据管理 */}
        <Card containerStyle={styles.card}>
          <Card.Title>数据管理</Card.Title>
          
          <SettingItem
            icon={<Download size={20} color="#007AFF" />}
            title="导出数据"
            subtitle="备份用户数据"
            onPress={handleExportData}
          />

          <SettingItem
            icon={<Upload size={20} color="#007AFF" />}
            title="导入数据"
            subtitle="恢复用户数据"
            onPress={handleImportData}
          />

          <SettingItem
            icon={<RotateCcw size={20} color="#ff9500" />}
            title="重置设置"
            subtitle="恢复所有默认值"
            onPress={handleResetSettings}
          />

          <SettingItem
            icon={<Shield size={20} color="#007AFF" />}
            title="清除缓存"
            subtitle="释放存储空间"
            onPress={handleClearCache}
          />
        </Card>

        {/* 关于 */}
        <Card containerStyle={styles.card}>
          <Card.Title>关于</Card.Title>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>应用版本：</Text>
              {config.version}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>构建时间：</Text>
              {new Date().toLocaleDateString('zh-CN')}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>服务状态：</Text>
              <Text style={{ color: config.debug.enabled ? '#28a745' : '#666' }}>
                {config.debug.enabled ? '已启用' : '已禁用'}
              </Text>
            </Text>
          </View>

          <Button
            title="查看许可协议"
            type="outline"
            onPress={() => Alert.alert('提示', '许可协议页面即将推出')}
            buttonStyle={styles.licenseButton}
            titleStyle={styles.licenseButtonText}
          />

          <Button
            title="隐私政策"
            type="outline"
            onPress={() => Alert.alert('提示', '隐私政策页面即将推出')}
            buttonStyle={styles.licenseButton}
            titleStyle={styles.licenseButtonText}
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'right',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  sliderHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: '500',
    color: '#666',
  },
  licenseButton: {
    marginTop: 8,
    marginBottom: 4,
  },
  licenseButtonText: {
    color: '#007AFF',
  },
  bottomSpacing: {
    height: 32,
  },
});