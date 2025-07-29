import { useToast } from "@/components/ui/toast";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { debugLogger } from './DebugLogger';

// Axios instance setup
const service = axios.create({
  baseURL: "http://192.168.1.40:8080/api",
  timeout: 15000 // request timeout
});


service.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Using standard response type
export type ApiResponse<T = any> = T;

// Helper function to create toast configuration
const createToastConfig = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'muted' = 'success') => {
  return {
    title: message,
    duration: 3000,
    variant: 'solid',
    action: type,
  };
};

// Hook to show toast messages
export const useShowToast = () => {
  const toast = useToast();
  return (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'muted' = 'success') => {
    toast.show(createToastConfig(message, type));
  };
};



// API çağrıları için yardımcı fonksiyonlar
export const apiCall = {
  get: async <T>(url: string, params?: any, includeToken: boolean = true): Promise<T> => {
      try {
          debugLogger.logApiCall('GET', url, params);
          const response = await service.get<T>(url, { params, headers: { includeToken } });
          debugLogger.logApiResponse('GET', url, response.status, response.data);
          return response.data;
      } catch (error: any) {
          debugLogger.logApiError('GET', url, error);
          throw error;
      }
  },

  post: async <T>(url: string, data?: any, includeToken: boolean = true): Promise<T> => {
      try {
          debugLogger.logApiCall('POST', url, data);
          const response = await service.post<T>(url, data, { headers: { includeToken } });
          debugLogger.logApiResponse('POST', url, response.status, response.data);
          return response.data;
      } catch (error: any) {
          debugLogger.logApiError('POST', url, error);
          throw error;
      }
  },

  put: async <T>(url: string, data?: any, includeToken: boolean = true): Promise<T> => {
      try {
          debugLogger.logApiCall('PUT', url, data);
          const response = await service.put<T>(url, data, { headers: { includeToken } });
          debugLogger.logApiResponse('PUT', url, response.status, response.data);
          return response.data;
      } catch (error: any) {
          debugLogger.logApiError('PUT', url, error);
          throw error;
      }
  },

  patch: async <T>(url: string, data?: any, includeToken: boolean = true): Promise<T> => {
      try {
          debugLogger.logApiCall('PATCH', url, data);
          const response = await service.patch<T>(url, data, { headers: { includeToken } });
          debugLogger.logApiResponse('PATCH', url, response.status, response.data);
          return response.data;
      } catch (error: any) {
          debugLogger.logApiError('PATCH', url, error);
          throw error;
      }
  },

  delete: async <T>(url: string, includeToken: boolean = true): Promise<T> => {
      try {
          debugLogger.logApiCall('DELETE', url);
          const response = await service.delete<T>(url, { headers: { includeToken } });
          debugLogger.logApiResponse('DELETE', url, response.status, response.data);
          return response.data;
      } catch (error: any) {
          debugLogger.logApiError('DELETE', url, error);
          throw error;
      }
  }
};

// Error handler
export const useHandleApiError = () => {
  const showToast = useShowToast();

  return async (error: any) => {
    if (!error.response) {
      showToast("Ağ hatası, lütfen bağlantınızı kontrol edin!", 'error');
      return Promise.reject(error);
    }

    switch (error.response.status) {
      case 401:
        showToast("Oturum süreniz doldu, lütfen tekrar giriş yapın", 'error');
        break;
      case 403:
        showToast(error.response.data.message || "Bu işlem için yetkiniz yok", 'error');
        break;
      case 404:
        showToast("İstenen kaynak bulunamadı", 'error');
        break;
      case 405:
        await AsyncStorage.removeItem('userToken');
        showToast(error.response.data.message || "Oturum süreniz doldu, lütfen tekrar giriş yapın", 'error');
        break;
      case 408:
      case 504:
        showToast("Sunucu yanıt vermiyor", 'error');
        break;
      case 500:
        showToast("Sunucu hatası", 'error');
        break;
      case 503:
        showToast("Servis şu anda kullanılamıyor", 'warning');
        break;
      default:
        showToast(error.response.data.message || "Beklenmeyen bir hata oluştu", 'error');
    }

    return Promise.reject(error);
  };
};

// Başarılı işlemler için kullanılabilecek helper fonksiyonlar
export const useSuccessMessages = () => {
  const showToast = useShowToast();

  return {
    created: (entity: string) => showToast(`${entity} başarıyla oluşturuldu`),
    updated: (entity: string) => showToast(`${entity} başarıyla güncellendi`),
    deleted: (entity: string) => showToast(`${entity} başarıyla silindi`),
    saved: (entity: string) => showToast(`${entity} başarıyla kaydedildi`),
    loaded: (entity: string) => showToast(`${entity} başarıyla yüklendi`)
  };
};
