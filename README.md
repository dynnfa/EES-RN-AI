# EES-RN-AI - AI智能口语和听力练习应用

一个基于React Native构建的AI智能英语学习应用，帮助学习者更好地练习口语和听力。

## 🚀 功能特性

### 核心功能
- **口语练习**: 实时语音识别和发音评估
- **听力练习**: 音频播放和答题系统
- **AI对话**: 智能对话伙伴，提供个性化学习体验
- **学习进度**: 详细的学习统计和成就系统

### 技术特性
- **跨平台**: 支持iOS和Android
- **AI集成**: 集成OpenAI GPT和语音服务
- **实时反馈**: 即时的语音识别和评估结果
- **现代UI**: 美观直观的用户界面

## 📱 应用截图

### 主要界面
- 首页：学习概览和快速开始
- 口语练习：录音界面和实时反馈
- 听力练习：音频播放和答题
- AI对话：智能聊天界面
- 个人中心：学习统计和设置

## 🛠 技术栈

- **React Native**: 0.72.6
- **TypeScript**: 类型安全
- **React Navigation**: 导航管理
- **React Native Paper**: UI组件库
- **React Native Vector Icons**: 图标库
- **React Native Audio Recorder Player**: 音频录制
- **React Native Sound**: 音频播放
- **OpenAI API**: AI对话和内容生成
- **Google Cloud Speech API**: 语音识别

## 📦 安装和运行

### 环境要求
- Node.js >= 16
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发)

### 安装依赖
```bash
npm install
```

### 配置API密钥
1. 复制 `.env.example` 为 `.env`
2. 填入你的API密钥：
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### 运行应用

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

## 🔧 配置说明

### API服务配置

#### OpenAI API
- 用于AI对话生成和内容理解
- 需要注册OpenAI账号获取API密钥
- 支持GPT-3.5-turbo和Whisper模型

#### 语音服务
- 支持Google Cloud Speech API
- 支持Azure Cognitive Services
- 可配置不同的语音识别服务

### 权限配置

#### Android
- 录音权限：`RECORD_AUDIO`
- 网络权限：`INTERNET`
- 存储权限：`WRITE_EXTERNAL_STORAGE`

#### iOS
- 麦克风权限：`NSMicrophoneUsageDescription`
- 相机权限：`NSCameraUsageDescription`

## 📁 项目结构

```
src/
├── components/          # 可复用组件
├── screens/            # 页面组件
│   ├── HomeScreen.tsx
│   ├── SpeakingPracticeScreen.tsx
│   ├── ListeningPracticeScreen.tsx
│   ├── AIChatScreen.tsx
│   └── ProfileScreen.tsx
├── services/           # 服务层
│   ├── aiService.ts    # AI API服务
│   └── audioService.ts # 音频服务
├── navigation/         # 导航配置
├── types/             # TypeScript类型定义
└── utils/             # 工具函数
```

## 🎯 核心功能实现

### 口语练习
1. 语音录制和播放
2. 实时语音识别
3. AI发音评估
4. 学习进度跟踪

### 听力练习
1. 音频内容播放
2. 交互式答题系统
3. 自动评分和反馈
4. 难度分级管理

### AI对话
1. 智能对话生成
2. 语音输入输出
3. 话题选择系统
4. 学习建议提供

## 🔮 未来规划

### 短期目标
- [ ] 完善AI评估算法
- [ ] 增加更多练习内容
- [ ] 优化用户界面
- [ ] 添加离线模式

### 长期目标
- [ ] 多语言支持
- [ ] 社交学习功能
- [ ] 个性化学习路径
- [ ] 学习数据分析

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱: your-email@example.com
- GitHub Issues: [项目Issues页面]

---

**注意**: 这是一个MVP版本，部分功能需要配置真实的API密钥才能正常工作。请确保在使用前正确配置所有必要的API服务。