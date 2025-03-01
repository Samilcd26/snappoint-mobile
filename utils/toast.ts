import Toast, { ToastPosition } from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  message: string;
  title?: string;
  duration?: number;
  position?: ToastPosition;
  onPress?: () => void;
  onShow?: () => void;
  onHide?: () => void;
}

class ToastService {
  private static defaultDuration = 3000;
  private static defaultPosition: ToastPosition = 'top';

  private static show(type: ToastType, messageOrConfig: string | ToastConfig) {
    // Eğer string ise basit config oluştur
    const config =
      typeof messageOrConfig === 'string' ? { message: messageOrConfig } : messageOrConfig;

    const {
      message,
      title,
      duration = this.defaultDuration,
      position = this.defaultPosition,
      onPress,
      onShow,
      onHide,
    } = config;

    Toast.show({
      type,
      text1: title || this.getDefaultTitle(type),
      text2: message,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 40,
      bottomOffset: 40,
      onPress: onPress || (() => {}),
      onShow: onShow || (() => {}),
      onHide: onHide || (() => {}),
    });
  }

  private static getDefaultTitle(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'Başarılı';
      case 'error':
        return 'Hata';
      case 'warning':
        return 'Uyarı';
      case 'info':
        return 'Bilgi';
    }
  }

  // Basit kullanım için string overload
  static success(message: string): void;
  // Detaylı kullanım için config overload
  static success(config: ToastConfig): void;
  static success(messageOrConfig: string | ToastConfig): void {
    this.show('success', messageOrConfig);
  }

  // Basit kullanım için string overload
  static error(message: string): void;
  // Detaylı kullanım için config overload
  static error(config: ToastConfig): void;
  static error(messageOrConfig: string | ToastConfig): void {
    console.log(messageOrConfig);

    this.show('error', messageOrConfig);
  }

  // Basit kullanım için string overload
  static warning(message: string): void;
  // Detaylı kullanım için config overload
  static warning(config: ToastConfig): void;
  static warning(messageOrConfig: string | ToastConfig): void {
    this.show('warning', messageOrConfig);
  }

  // Basit kullanım için string overload
  static info(message: string): void;
  // Detaylı kullanım için config overload
  static info(config: ToastConfig): void;
  static info(messageOrConfig: string | ToastConfig): void {
    this.show('info', messageOrConfig);
  }
}

export default ToastService;
