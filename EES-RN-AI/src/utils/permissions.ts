import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { isAndroid, isIOS } from './index';

export interface PermissionResult {
  granted: boolean;
  reason?: string;
  showAlert?: boolean;
}

export interface PermissionConfig {
  title: string;
  message: string;
  buttonNeutral?: string;
  buttonNegative?: string;
  buttonPositive?: string;
}

/**
 * 检查麦克风权限
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted;
    } else if (Platform.OS === 'ios') {
      // iOS 的权限检查通常需要在 Info.plist 中配置
      // 这里暂时返回 true，实际项目中可能需要使用不同的方法
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to check microphone permission:', error);
    return false;
  }
}

/**
 * 请求麦克风权限
 */
export async function requestMicrophonePermission(): Promise<PermissionResult> {
  try {
    if (Platform.OS === 'android') {
      return await requestAndroidPermission(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '语音识别权限',
          message: '应用需要访问麦克风以提供语音识别功能，请授予权限',
          buttonNeutral: '稍后询问',
          buttonNegative: '取消',
          buttonPositive: '确定'
        }
      );
    } else if (Platform.OS === 'ios') {
      // iOS 权限处理
      // 在实际应用中，这里可能需要展示系统权限请求或使用其他方法
      return {
        granted: true,
        reason: 'iOS 权限处理需要额外配置'
      };
    }
    
    return {
      granted: false,
      reason: '不支持的平台'
    };
  } catch (error) {
    console.error('Failed to request microphone permission:', error);
    return {
      granted: false,
      reason: '请求权限时发生错误'
    };
  }
}

/**
 * Android 平台权限请求
 */
async function requestAndroidPermission(
  permission: string,
  config: PermissionConfig
): Promise<PermissionResult> {
  const granted = await PermissionsAndroid.request(permission, config);
  
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    return {
      granted: true,
      reason: '权限已授予'
    };
  } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
    return {
      granted: false,
      reason: '用户拒绝了权限请求',
      showAlert: true
    };
  } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    return {
      granted: false,
      reason: '用户选择了"不再询问"，需要在系统设置中手动授予',
      showAlert: true
    };
  } else {
    return {
      granted: false,
      reason: '未知权限状态'
    };
  }
}

/**
 * 显示权限相关错误提示
 */
export function showPermissionAlert(
  title: string,
  message: string,
  onDismiss?: () => void
): void {
  Alert.alert(
    title,
    message,
    [
      {
        text: '确定',
        onPress: onDismiss
      }
    ]
  );
}

/**
 * 检查设备是否支持语音功能
 */
export function isVoiceFeatureSupported(): boolean {
  if (isIOS() || isAndroid()) {
    return true;
  }
  
  // Web 或其他平台可能不支持完整的语音功能
  console.warn('Voice feature may not be fully supported on this platform');
  return false;
}

/**
 * 检查网络连接（某些语音服务可能需要网络）
 */
export async function checkNetworkConnection(): Promise<boolean> {
  try {
    // 基础网络检查，实际项目中可能需要更复杂的实现
    if (Platform.OS === 'web') {
      return navigator.onLine;
    }
    
    // 对于移动平台，返回 true（简化实现）
    // 实际项目中可能需要使用 NetInfo 或其他网络状态库
    return true;
  } catch (error) {
    console.error('Failed to check network connection:', error);
    return false;
  }
}

/**
 * 综合权限检查（包含权限、网络、设备支持等）
 */
export async function comprehensivePermissionCheck(): Promise<{
  canUseVoiceFeatures: boolean;
  issues: string[];
  permissions: PermissionResult;
}> {
  const issues: string[] = [];
  
  // 检查设备支持
  if (!isVoiceFeatureSupported()) {
    issues.push('当前设备或平台不支持语音功能');
  }
  
  // 检查权限
  const hasPermission = await checkMicrophonePermission();
  let permissions: PermissionResult;
  
  if (!hasPermission) {
    permissions = await requestMicrophonePermission();
    if (!permissions.granted) {
      issues.push(`权限问题: ${permissions.reason}`);
    }
  } else {
    permissions = {
      granted: true,
      reason: '权限已存在'
    };
  }
  
  // 检查网络（可选）
  const hasNetwork = await checkNetworkConnection();
  if (!hasNetwork) {
    issues.push('网络连接不可用（某些功能可能受影响）');
  }
  
  return {
    canUseVoiceFeatures: issues.length === 0,
    issues,
    permissions
  };
}