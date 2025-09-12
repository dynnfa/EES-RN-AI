# 🚀 快速开始指南

## 1. 环境准备

### 必需软件
- Node.js (版本 >= 16)
- npm 或 yarn
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发，仅macOS)

### 检查环境
```bash
node -v
npm -v
react-native --version
```

## 2. 项目设置

### 克隆项目
```bash
git clone <your-repo-url>
cd EES-RN-AI
```

### 运行设置脚本
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 手动设置（如果脚本失败）
```bash
# 安装依赖
npm install

# 创建环境配置
cp env.example .env
```

## 3. 配置API密钥

编辑 `.env` 文件，填入你的API密钥：

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 获取API密钥
1. 访问 [OpenAI官网](https://platform.openai.com/)
2. 注册账号并登录
3. 在API Keys页面创建新的密钥
4. 复制密钥到 `.env` 文件

## 4. 运行应用

### Android
```bash
# 启动Metro服务器
npm start

# 在另一个终端运行
npm run android
```

### iOS
```bash
# 启动Metro服务器
npm start

# 在另一个终端运行
npm run ios
```

## 5. 功能测试

### 口语练习
1. 进入"口语练习"页面
2. 点击录音按钮
3. 朗读显示的文本
4. 查看AI评估结果

### 听力练习
1. 进入"听力练习"页面
2. 点击播放按钮听音频
3. 回答相关问题
4. 查看答题结果

### AI对话
1. 进入"AI对话"页面
2. 选择话题或直接输入
3. 使用语音或文字与AI对话

## 6. 常见问题

### 依赖安装失败
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules
npm install
```

### Android构建失败
```bash
# 清理Android构建
cd android
./gradlew clean
cd ..
npm run android
```

### iOS构建失败
```bash
# 清理iOS构建
cd ios
xcodebuild clean
cd ..
npm run ios
```

### 权限问题
- Android: 确保在 `AndroidManifest.xml` 中配置了录音权限
- iOS: 确保在 `Info.plist` 中配置了麦克风权限

## 7. 开发调试

### 启用调试模式
在 `.env` 文件中设置：
```env
DEBUG_MODE=true
```

### 查看日志
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

### 热重载
应用运行后，按 `R` 键重新加载，或摇动设备选择"Reload"

## 8. 下一步

- 查看 [README.md](./README.md) 了解完整功能
- 查看 [项目结构](./README.md#项目结构) 了解代码组织
- 查看 [API文档](./README.md#api服务配置) 了解服务配置

## 9. 获取帮助

- 查看项目Issues
- 阅读React Native官方文档
- 查看OpenAI API文档

---

**注意**: 这是一个MVP版本，部分功能需要真实的API密钥才能正常工作。请确保正确配置所有必要的API服务。
