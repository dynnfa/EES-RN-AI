# Workflow 迁移指南：Managed → Bare

## 🚀 项目概述

本项目已成功从 **Expo Managed Workflow** 迁移至 **Bare Workflow**，获得完整的原生代码访问权限。

## 📋 主要变更

### 1. 核心依赖更新

- **React Native**: `0.81.5` (最新稳定版)
- **Expo SDK**: `54.0.25`
- **Expo Dev Client**: `~6.0.18` (新增，用于原生模块开发)
- **New Architecture**: 已启用 (`newArchEnabled: true`)

### 2. 开发命令变更

```json
{
  "start": "expo start --dev-client",
  "android": "expo run:android",
  "ios": "expo run:ios"
}
```

### 3. 架构升级

- ✅ **TypeScript**: 支持类型安全开发
- ✅ **Metro Bundler**: 现代化打包工具
- ✅ **Expo Router**: 文件系统路由
- ✅ **NativeWind**: 原子化CSS框架
- ✅ **React Compiler**: 自动优化渲染

## ⚠️ 开发注意事项

### Dev Client 使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run start

# 在设备上测试
npm run android  # Android设备
npm run ios      # iOS设备
```

### 原生模块开发

1. **新增原生模块**：

   ```bash
   # 在项目根目录创建原生模块
   expo install some-native-package
   npx expo run:android  # 重新构建Android
   npx expo run:ios      # 重新构建iOS
   ```

2. **Android 配置**：
   - 访问 `android/` 目录进行原生配置
   - 遵循 Android 官方开发规范

3. **iOS 配置**：
   - 访问 `ios/` 目录进行原生配置
   - 使用 Xcode 进行 iOS 原生开发

### 性能优化

- ✅ **Hermes 引擎**: 已启用，提供更好的JavaScript性能
- ✅ **Fabric 渲染器**: 新架构渲染，提升UI性能
- ✅ **JSI 支持**: 原生JavaScript接口，提升模块间通信效率

### 调试工具

- **Flipper**: 支持React Native调试
- **React Native Debugger**: 支持Redux DevTools
- **Chrome DevTools**: 标准Web调试工具
- **Expo Dev Tools**: Expo专属开发工具

## 🔧 常见问题解决

### 构建失败

```bash
# 清理缓存
npx expo install --fix

# 重新安装依赖
rm -rf node_modules && npm install

# 清理原生构建
cd android && ./gradlew clean && cd ..
cd ios && xcodebuild clean && cd ..
```

### Dev Client 问题

1. **确保开发设备已安装Dev Client**
2. **重新构建Dev Client**:
   ```bash
   expo run:android  # 会自动构建Dev Client
   expo run:ios      # 会自动构建Dev Client
   ```

### 依赖冲突

```bash
# 使用Expo兼容性检查
npx expo doctor

# 修复依赖版本
npx expo install --fix
```

## 📁 项目结构

```
├── android/          # Android原生代码
├── ios/              # iOS原生代码
├── app/              # 应用路由
├── components/       # React组件
├── hooks/            # 自定义Hooks
├── modules/          # 原生模块代码
└── plugins/          # Expo插件配置
```

## 🎯 迁移优势

1. **完整原生访问**: 可使用任意React Native和原生库
2. **性能提升**: New Architecture + Hermes引擎
3. **开发灵活性**: 自定义原生功能不受限制
4. **长期维护**: 紧跟React Native最新版本
5. **调试增强**: 完整的原生调试工具链

---

_文档版本: v1.0 | 最后更新: 2024年_
