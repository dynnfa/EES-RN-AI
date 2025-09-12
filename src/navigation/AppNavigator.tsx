import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import SpeakingPracticeScreen from '../screens/SpeakingPracticeScreen';
import ListeningPracticeScreen from '../screens/ListeningPracticeScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';

import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// 底部标签导航
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'SpeakingPractice':
              iconName = 'mic';
              break;
            case 'ListeningPractice':
              iconName = 'headphones';
              break;
            case 'AIChat':
              iconName = 'chat';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '首页' }}
      />
      <Tab.Screen 
        name="SpeakingPractice" 
        component={SpeakingPracticeScreen} 
        options={{ title: '口语练习' }}
      />
      <Tab.Screen 
        name="ListeningPractice" 
        component={ListeningPracticeScreen} 
        options={{ title: '听力练习' }}
      />
      <Tab.Screen 
        name="AIChat" 
        component={AIChatScreen} 
        options={{ title: 'AI对话' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '个人中心' }}
      />
    </Tab.Navigator>
  );
}

// 主导航器
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ExerciseDetail" 
          component={ExerciseDetailScreen} 
          options={{ title: '练习详情' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
