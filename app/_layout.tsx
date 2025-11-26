import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpeechProvider } from '@/src/contexts/SpeechContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SpeechProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="profile" options={{ title: '个人资料', headerStyle: { backgroundColor: '#007AFF' }, headerTintColor: '#fff' }} />
          <Stack.Screen name="history" options={{ title: '语音历史', headerStyle: { backgroundColor: '#007AFF' }, headerTintColor: '#fff' }} />
          <Stack.Screen name="settings" options={{ title: '设置', headerStyle: { backgroundColor: '#007AFF' }, headerTintColor: '#fff' }} />
        </Stack>
        <StatusBar style="auto" />
      </SpeechProvider>
    </ThemeProvider>
  );
}
