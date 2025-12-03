# Workflow Migration Guide: Managed → Bare

## 🚀 Project Overview

This project has successfully migrated from **Expo Managed Workflow** to **Bare Workflow**, gaining full native code access.

## 📋 Major Changes

### 1. Core Dependency Updates

- **React Native**: `0.81.5` (Latest stable version)
- **Expo SDK**: `54.0.25`
- **Expo Dev Client**: `~6.0.18` (New addition, for native module development)
- **New Architecture**: Enabled (`newArchEnabled: true`)

### 2. Development Command Changes

```json
{
  "start": "expo start --dev-client",
  "android": "expo run:android",
  "ios": "expo run:ios"
}
```

### 3. Architecture Upgrades

- ✅ **TypeScript**: Type-safe development support
- ✅ **Metro Bundler**: Modern bundling tool
- ✅ **Expo Router**: File-system based routing
- ✅ **NativeWind**: Atomic CSS framework
- ✅ **React Compiler**: Automatic optimization for rendering

## ⚠️ Development Notes

### Dev Client Usage

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Test on device
npm run android  # Android device
npm run ios      # iOS device
```

### Native Module Development

1. **Add New Native Module**:

   ```bash
   # Create native module in project root
   expo install some-native-package
   npx expo run:android  # Rebuild Android
   npx expo run:ios      # Rebuild iOS
   ```

2. **Android Configuration**:
   - Access `android/` directory for native configuration
   - Follow Android official development guidelines

3. **iOS Configuration**:
   - Access `ios/` directory for native configuration
   - Use Xcode for iOS native development

### Performance Optimization

- ✅ **Hermes Engine**: Enabled for better JavaScript performance
- ✅ **Fabric Renderer**: New architecture renderer, improved UI performance
- ✅ **JSI Support**: Native JavaScript interface, improved inter-module communication efficiency

### Debugging Tools

- **Flipper**: React Native debugging support
- **React Native Debugger**: Redux DevTools support
- **Chrome DevTools**: Standard web debugging tools
- **Expo Dev Tools**: Expo-specific development tools

## 🔧 Common Issues Resolution

### Build Failures

```bash
# Clear cache
npx expo install --fix

# Reinstall dependencies
rm -rf node_modules && npm install

# Clean native builds
cd android && ./gradlew clean && cd ..
cd ios && xcodebuild clean && cd ..
```

### Dev Client Issues

1. **Ensure dev device has Dev Client installed**
2. **Rebuild Dev Client**:
   ```bash
   expo run:android  # Will automatically build Dev Client
   expo run:ios      # Will automatically build Dev Client
   ```

### Dependency Conflicts

```bash
# Use Expo compatibility check
npx expo doctor

# Fix dependency versions
npx expo install --fix
```

## 📁 Project Structure

```
├── android/          # Android native code
├── ios/              # iOS native code
├── app/              # Application routing
├── components/       # React components
├── hooks/            # Custom Hooks
├── modules/          # Native module code
└── plugins/          # Expo plugin configuration
```

## 🎯 Migration Benefits

1. **Full Native Access**: Can use any React Native and native libraries
2. **Performance Improvements**: New Architecture + Hermes engine
3. **Development Flexibility**: Custom native features without restrictions
4. **Long-term Maintenance**: Keep up with latest React Native versions
5. **Enhanced Debugging**: Complete native debugging toolchain

---

_Document Version: v1.0 | Last Updated: 2024_