import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { 
  getSecureLocation, 
  getQuickLocation,
  validateLocationSecurity, 
  requestLocationPermissions, 
  startLocationWatching,
  SecureLocationResult 
} from '@/utils/LocationSecurity';

interface LocationState {
  userLocation: { latitude: number; longitude: number } | null;
  locationVerified: boolean;
  isLocationLoading: boolean;
  locationError: Error | null;
  securityAlerts: number;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    userLocation: null,
    locationVerified: false,
    isLocationLoading: true,
    locationError: null,
    securityAlerts: 0,
  });

  const [locationWatcher, setLocationWatcher] = useState<Location.LocationSubscription | null>(null);

  // Lokasyon güvenlik doğrulaması
  const handleLocationUpdate = useCallback((location: Location.LocationObject) => {
    const validation = validateLocationSecurity(location);
    
    if (validation.alertCount > 0) {
      setState(prev => {
        const newAlertCount = prev.securityAlerts + validation.alertCount;
        
        if (newAlertCount > 5) {
          Alert.alert(
            'Konum Güvenlik Uyarısı',
            'Konumunuzda anormal aktivite tespit edildi. Lütfen uygulamayı yeniden başlatın.',
            [
              { 
                text: 'Yeniden Başlat', 
                onPress: () => requestLocationUpdate()
              },
              { 
                text: 'İptal',
                style: 'cancel'
              }
            ]
          );
        }
        
        return { ...prev, securityAlerts: newAlertCount };
      });
    }
  }, []);

  // Sürekli lokasyon izleme
  const startContinuousLocationMonitoring = useCallback(async () => {
    try {
      const subscription = await startLocationWatching(
        (newLocation) => {
          const newUserLocation = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          
          setState(prev => {
            // Güvenlik kontrolü - önceki lokasyon var mı?
            const prevLocation = prev.userLocation;
            if (prevLocation) {
              const distance = Math.sqrt(
                Math.pow(newLocation.coords.latitude - prevLocation.latitude, 2) + 
                Math.pow(newLocation.coords.longitude - prevLocation.longitude, 2)
              );
              
              if (distance > 0.1) {
                handleLocationUpdate(newLocation);
              }
            }
            
            return { ...prev, userLocation: newUserLocation };
          });
        },
        {
          timeInterval: 60000,
          distanceInterval: 100,
        }
      );
      
      if (subscription) {
        setLocationWatcher(subscription);
      }
    } catch (error) {
      console.error('Continuous location monitoring error:', error);
    }
  }, [handleLocationUpdate]);

  // Lokasyon alma
  const requestLocationUpdate = useCallback(async () => {
    setState(prev => ({ ...prev, isLocationLoading: true, locationError: null }));

    try {
      const permissionResult = await requestLocationPermissions();
      if (!permissionResult.granted) {
        setState(prev => ({ 
          ...prev, 
          isLocationLoading: false, 
          locationVerified: true,
          locationError: new Error('Konum izni verilmedi')
        }));
        return;
      }

      // Önce hızlı lokasyon dene
      let locationResult = await getQuickLocation();
      
      // Başarısızsa güvenli lokasyon dene
      if (!locationResult.verified || !locationResult.location) {
        locationResult = await getSecureLocation();
      }
      
      if (locationResult.verified && locationResult.location) {
        const userCoords = {
          latitude: locationResult.location.coords.latitude,
          longitude: locationResult.location.coords.longitude,
        };
        
        setState(prev => ({
          ...prev,
          userLocation: userCoords,
          locationVerified: true,
          isLocationLoading: false,
          locationError: null,
          securityAlerts: 0,
        }));
        
        // Sürekli lokasyon izleme başlat
        startContinuousLocationMonitoring();
      } else {
        setState(prev => ({
          ...prev,
          isLocationLoading: false,
          locationVerified: true,
          locationError: new Error(locationResult.error || 'Lokasyon alınamadı'),
        }));
      }
    } catch (error) {
      console.error('Location request error:', error);
      setState(prev => ({
        ...prev,
        isLocationLoading: false,
        locationVerified: true,
        locationError: error instanceof Error ? error : new Error('Lokasyon hatası'),
      }));
    }
  }, []); // Dependency'yi kaldırdım

  // İlk yükleme
  useEffect(() => {
    const initializeLocation = async () => {
      const timeoutId = setTimeout(() => {
        setState(prev => ({ ...prev, isLocationLoading: false, locationVerified: true }));
      }, 10000);

      try {
        await requestLocationUpdate();
      } finally {
        clearTimeout(timeoutId);
      }
    };

    initializeLocation();
  }, []); // Sadece mount'ta çalışsın

  // Temizlik
  useEffect(() => {
    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, [locationWatcher]);

  return {
    userLocation: state.userLocation,
    locationVerified: state.locationVerified,
    isLocationLoading: state.isLocationLoading,
    locationError: state.locationError,
    securityAlerts: state.securityAlerts,
    requestLocationUpdate,
  };
};

export default useLocation; 