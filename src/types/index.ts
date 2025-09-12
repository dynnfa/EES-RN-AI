// 用户相关类型
export interface User {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalScore: number;
  streak: number;
}

// 练习相关类型
export interface Exercise {
  id: string;
  type: 'speaking' | 'listening';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  content: string;
  audioUrl?: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
}

// 录音相关类型
export interface Recording {
  id: string;
  text: string;
  audioPath: string;
  duration: number;
  score?: number;
  feedback?: string;
  timestamp: Date;
}

// AI API响应类型
export interface AIResponse {
  text: string;
  confidence: number;
  suggestions?: string[];
  score?: number;
}

// 导航类型
export type RootStackParamList = {
  Home: undefined;
  SpeakingPractice: undefined;
  ListeningPractice: undefined;
  AIChat: undefined;
  Profile: undefined;
  ExerciseDetail: { exercise: Exercise };
};

// 状态管理类型
export interface AppState {
  user: User | null;
  exercises: Exercise[];
  recordings: Recording[];
  isLoading: boolean;
  error: string | null;
}
