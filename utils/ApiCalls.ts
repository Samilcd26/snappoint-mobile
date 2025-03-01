import axios from 'axios';
import ToastService from './toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

// create an axios instance
const service = axios.create({
  baseURL: 'http://10.0.2.2:8080/api',
  timeout: 15000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  async (config) => {
    // Check if the request should include a token
    const includeToken = config.headers.includeToken !== false;

    if (includeToken) {
      // Token'ı Redux store yerine AsyncStorage'dan al
      const access_token = await AsyncStorage.getItem('access_token');

      if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }
    }

    // Remove the custom header to avoid sending it to the server
    delete config.headers.includeToken;

    return config;
  },
  (error) => {
    ToastService.error('İstek gönderilirken bir hata oluştu');
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (!error.response) {
      ToastService.error('Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.');
      return Promise.reject(error);
    }
    const message = error.response.data.message;

    switch (error.response.status) {
      case 401:
        ToastService.error('Bir hata oluştu. Hata: ' + message);
        break;

      case 403:
        ToastService.error('Bu işlemi yapmaya yetkiniz yok.');
        break;

      case 404:
        ToastService.error('İstenen kaynak bulunamadı.');
        break;

      case 405:
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('userData');
        ToastService.error('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
        break;

      case 408:
      case 504:
        ToastService.error({
          message: 'Sunucu zaman aşımına uğradı. Lütfen tekrar deneyin.',
          duration: 4000,
          onHide: () => {
            console.log('Timeout hatası kapatıldı');
          },
        });
        break;

      case 500:
        ToastService.error({
          message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
          position: 'bottom',
          duration: 5000,
        });
        break;

      case 503:
        ToastService.warning({
          message: 'Servis geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
          title: 'Servis Bakımda',
          duration: 4000,
        });
        break;

      default:
        ToastService.error('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    }

    return Promise.reject(error);
  }
);

// API çağrıları için yardımcı fonksiyonlar
export const apiCall = {
  get: async <T>(url: string, params?: any, includeToken: boolean = true): Promise<T> => {
    try {
      return await service.get(url, { params, headers: { includeToken } });
    } catch (error) {
      throw error;
    }
  },

  post: async <T>(url: string, data?: any, includeToken: boolean = true): Promise<T> => {
    try {
      return await service.post(url, data, { headers: { includeToken } });
    } catch (error) {
      throw error;
    }
  },

  put: async <T>(url: string, data?: any, includeToken: boolean = true): Promise<T> => {
    try {
      return await service.put(url, data, { headers: { includeToken } });
    } catch (error) {
      throw error;
    }
  },

  delete: async <T>(url: string, includeToken: boolean = true): Promise<T> => {
    try {
      return await service.delete(url, { headers: { includeToken } });
    } catch (error) {
      throw error;
    }
  }
};

// Başarılı işlemler için kullanılabilecek helper fonksiyonlar
export const successMessages = {
  created: (entity: string) => ToastService.success(`${entity} başarıyla oluşturuldu`),
  updated: (entity: string) => ToastService.success(`${entity} başarıyla güncellendi`),
  deleted: (entity: string) => ToastService.success(`${entity} başarıyla silindi`),
  saved: (entity: string) => ToastService.success(`${entity} başarıyla kaydedildi`),
  loaded: (entity: string) => ToastService.success(`${entity} başarıyla yüklendi`),
};

export default service;
