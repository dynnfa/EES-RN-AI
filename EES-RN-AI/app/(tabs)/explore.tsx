import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card } from 'react-native-elements';
import { Search, User, History, Settings, Cpu, Smartphone, Globe, Zap } from 'lucide-react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function TabTwoScreen() {
  const router = useRouter();

  const navigationItems = [
    {
      id: 'voice',
      title: '语音功能',
      description: '语音识别和文本转语音',
      icon: <Search size={32} color="#007AFF" />,
      route: '/voice',
      color: '#007AFF'
    },
    {
      id: 'history',
      title: '语音历史',
      description: '查看历史语音记录',
      icon: <History size={32} color="#34C759" />,
      route: '/history',
      color: '#34C759'
    },
    {
      id: 'profile',
      title: '个人资料',
      description: '用户信息和设置',
      icon: <User size={32} color="#af52de" />,
      route: '/profile',
      color: '#af52de'
    },
    {
      id: 'settings',
      title: '设置',
      description: '应用偏好设置',
      icon: <Settings size={32} color="#ff9500" />,
      route: '/settings',
      color: '#ff9500'
    }
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          功能探索
        </ThemedText>
      </ThemedView>
      
      {/* 导航卡片 */}
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>快速导航</Card.Title>
        <View style={styles.navigationGrid}>
          {navigationItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.navCard}
              onPress={() => router.push(item.route)}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                {item.icon}
              </View>
              <ThemedText style={[styles.navTitle, { color: item.color }]}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.navDescription}>
                {item.description}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Collapsible title="文件路由">
        <ThemedText>
          本应用采用基于文件的路由结构：{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> 和{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          布局文件 <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          设置了标签页导航器。
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">了解更多</ThemedText>
        </ExternalLink>
      </Collapsible>
      
      <Collapsible title="跨平台支持">
        <ThemedText>
          可以在 Android、iOS 和 Web 上打开此项目。要打开 Web 版本，请按{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> 运行此项目的终端。
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="图片处理">
        <ThemedText>
          对于静态图像，可以使用 <ThemedText type="defaultSemiBold">@2x</ThemedText> 和{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> 后缀为不同屏幕密度提供文件
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">了解更多</ThemedText>
        </ExternalLink>
      </Collapsible>
      
      <Collapsible title="主题模式">
        <ThemedText>
          此模板支持亮色和暗色模式。<ThemedText type="defaultSemiBold">useColorScheme()</ThemedText>{' '}
          钩子让您检查用户当前的颜色方案，并相应地调整 UI 颜色。
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">了解更多</ThemedText>
        </ExternalLink>
      </Collapsible>
      
      <Collapsible title="动画效果">
        <ThemedText>
          此模板包含动画组件的示例。<ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText>{' '}
          组件使用强大的{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          库创建挥手动画。
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              组件为标题图像提供视差效果。
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  navCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  navDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
