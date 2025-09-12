import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Sound from 'react-native-sound';
import { Platform, PermissionsAndroid } from 'react-native';

class AudioService {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private currentSound: Sound | null = null;

  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.setupAudio();
  }

  private setupAudio() {
    // 设置音频模式
    Sound.setCategory('Playback');
  }

  // 请求录音权限
  async requestRecordPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '录音权限',
            message: '应用需要录音权限来进行口语练习',
            buttonNeutral: '稍后询问',
            buttonNegative: '拒绝',
            buttonPositive: '允许',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS权限在Info.plist中配置
  }

  // 开始录音
  async startRecording(): Promise<string> {
    try {
      const hasPermission = await this.requestRecordPermission();
      if (!hasPermission) {
        throw new Error('录音权限被拒绝');
      }

      const result = await this.audioRecorderPlayer.startRecorder();
      return result;
    } catch (error) {
      console.error('开始录音失败:', error);
      throw new Error('录音失败，请检查权限设置');
    }
  }

  // 停止录音
  async stopRecording(): Promise<string> {
    try {
      const result = await this.audioRecorderPlayer.stopRecorder();
      return result;
    } catch (error) {
      console.error('停止录音失败:', error);
      throw new Error('停止录音失败');
    }
  }

  // 播放音频
  async playAudio(audioPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 停止当前播放的音频
      if (this.currentSound) {
        this.currentSound.stop();
        this.currentSound.release();
      }

      this.currentSound = new Sound(audioPath, '', (error) => {
        if (error) {
          console.error('音频加载失败:', error);
          reject(new Error('音频播放失败'));
          return;
        }

        this.currentSound?.play((success) => {
          if (success) {
            console.log('音频播放完成');
            resolve();
          } else {
            console.error('音频播放失败');
            reject(new Error('音频播放失败'));
          }
        });
      });
    });
  }

  // 停止播放
  stopPlayback(): void {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }
  }

  // 获取录音时长
  getRecordingDuration(): number {
    return this.audioRecorderPlayer.mmssss;
  }

  // 清理资源
  cleanup(): void {
    this.stopPlayback();
    this.audioRecorderPlayer.stopRecorder();
  }
}

export default new AudioService();
