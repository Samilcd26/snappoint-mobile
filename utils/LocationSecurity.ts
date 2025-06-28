import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

export interface SecureLocationResult {
  location: Location.LocationObject | null;
  verified: boolean;
  error?: string;
}

export interface LocationSecurityOptions {
  accuracyThreshold?: number;
  maxDistanceBetweenReadings?: number;
  maxSpeedThreshold?: number;
  timeBetweenReadings?: number;
}

const DEFAULT_OPTIONS: LocationSecurityOptions = {
  accuracyThreshold: 100,
  maxDistanceBetweenReadings: 200,
  maxSpeedThreshold: 83.33, // 300 km/h in m/s
  timeBetweenReadings: 3000,
};

// Güvenli lokasyon alma fonksiyonu
export const getSecureLocation = async (
  options: LocationSecurityOptions = DEFAULT_OPTIONS
): Promise<SecureLocationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // İlk lokasyon alma
    const location1 = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,
    });

    // Android için mock location kontrolü
    if (Platform.OS === 'android' && location1.mocked) {
      Alert.alert(
        'Sahte Konum Tespit Edildi',
        'Uygulamayı kullanmak için gerçek konumunuzu paylaşmanız gerekiyor.',
        [{ text: 'Tamam' }]
      );
      return { location: null, verified: false, error: 'Mock location detected' };
    }

    // Düşük doğruluk kontrolü
    if (location1.coords.accuracy && location1.coords.accuracy > opts.accuracyThreshold!) {
      Alert.alert(
        'Konum Doğruluğu Düşük',
        'Daha iyi bir GPS sinyali için açık bir alana çıkın.',
        [{ text: 'Tamam' }]
      );
      return { location: null, verified: false, error: 'Low accuracy' };
    }

    // Belirtilen süre kadar bekle
    await new Promise(resolve => setTimeout(resolve, opts.timeBetweenReadings!));
    
    const location2 = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 3000,
    });

    // İki lokasyon arasındaki mesafe kontrolü
    const distance = calculateDistance(
      location1.coords.latitude,
      location1.coords.longitude,
      location2.coords.latitude,
      location2.coords.longitude
    );

    if (distance > opts.maxDistanceBetweenReadings!) {
      Alert.alert(
        'Konum Tutarsızlığı',
        'Konum bilgisi tutarsız. Lütfen sabit durun ve tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
      return { location: null, verified: false, error: 'Location inconsistency' };
    }

    // Zaman damgası kontrolü (10 dakikadan eski olmamalı)
    const now = Date.now();
    if (now - location2.timestamp > 600000) {
      Alert.alert(
        'Eski Konum Verisi',
        'Konum verisi çok eski. GPS sinyal kalitesini kontrol edin.',
        [{ text: 'Tamam' }]
      );
      return { location: null, verified: false, error: 'Old location data' };
    }

    return { location: location2, verified: true };
  } catch (error) {
    console.error('Lokasyon alma hatası:', error);
    Alert.alert(
      'Konum Hatası',
      'Konum bilgisi alınamadı. GPS açık olduğundan emin olun.',
      [{ text: 'Tamam' }]
    );
    return { location: null, verified: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// İki nokta arasındaki mesafeyi hesapla (metre cinsinden)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Dünya yarıçapı metre cinsinden
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Lokasyon güvenlik doğrulaması
export const validateLocationSecurity = (
  location: Location.LocationObject,
  options: LocationSecurityOptions = DEFAULT_OPTIONS
): { isValid: boolean; alertCount: number; warnings: string[] } => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let alertCount = 0;
  const warnings: string[] = [];

  // Mock location kontrolü (Android)
  if (Platform.OS === 'android' && location.mocked) {
    alertCount++;
    warnings.push('Mock location detected');
    Alert.alert(
      'Güvenlik Uyarısı',
      'Sahte konum tespit edildi! Gerçek konumunuzu kullanın.',
      [{ text: 'Tamam' }]
    );
  }

  // Doğruluk kontrolü
  if (location.coords.accuracy && location.coords.accuracy > opts.accuracyThreshold! * 2) {
    alertCount++;
    warnings.push(`Low accuracy: ${location.coords.accuracy}m`);
    console.warn('Düşük konum doğruluğu:', location.coords.accuracy);
  }

  // Anormal hız kontrolü
  if (location.coords.speed && location.coords.speed > opts.maxSpeedThreshold!) {
    alertCount++;
    warnings.push(`Abnormal speed: ${location.coords.speed}m/s`);
    Alert.alert(
      'Anormal Hareket',
      'Çok hızlı hareket tespit edildi. Bu sahte konum olabilir.',
      [{ text: 'Tamam' }]
    );
  }

  return {
    isValid: alertCount === 0,
    alertCount,
    warnings
  };
};

// Konum izinlerini kontrol et ve al
export const requestLocationPermissions = async (): Promise<{
  granted: boolean;
  foregroundStatus: Location.PermissionStatus;
  backgroundStatus?: Location.PermissionStatus;
}> => {
  // Konum izni al
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  
  if (foregroundStatus !== 'granted') {
    Alert.alert(
      'Konum İzni Gerekli',
      'Uygulamayı kullanmak için konum iznini vermeniz gerekiyor.',
      [{ text: 'Tamam' }]
    );
    return { granted: false, foregroundStatus };
  }

  // Arka plan konum iznini de al (daha iyi doğruluk için)
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  
  // GPS servislerinin açık olup olmadığını kontrol et
  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    Alert.alert(
      'GPS Kapalı',
      'Konum servislerini açmanız gerekiyor.',
      [{ text: 'Tamam' }]
    );
    return { granted: false, foregroundStatus, backgroundStatus };
  }

  return { granted: true, foregroundStatus, backgroundStatus };
};

// Sürekli lokasyon izleme başlat
export const startLocationWatching = async (
  onLocationUpdate: (location: Location.LocationObject) => void,
  options: {
    timeInterval?: number;
    distanceInterval?: number;
  } = {}
): Promise<Location.LocationSubscription | null> => {
  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: options.timeInterval || 30000,
        distanceInterval: options.distanceInterval || 50,
      },
      onLocationUpdate
    );
    return subscription;
  } catch (error) {
    console.error('Sürekli lokasyon izleme hatası:', error);
    return null;
  }
}; 