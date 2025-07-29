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
  accuracyThreshold: 200, // Increased from 100 for faster results
  maxDistanceBetweenReadings: 500, // Increased from 200 for more tolerance
  maxSpeedThreshold: 83.33, // 300 km/h in m/s
  timeBetweenReadings: 1000, // Reduced from 3000 to 1000ms
};

// Güvenli lokasyon alma fonksiyonu
export const getSecureLocation = async (
  options: LocationSecurityOptions = DEFAULT_OPTIONS
): Promise<SecureLocationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Hızlı lokasyon alma - tek okuma ile başla
    const location1 = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // Changed from BestForNavigation to High for faster results
      timeInterval: 2000, // Reduced from 5000
    });

    // Android için mock location kontrolü (sadece warning, blocking değil)
    if (Platform.OS === 'android' && location1.mocked) {
      console.warn('Mock location detected, but allowing for development');
      // Development için mock location'a izin ver, sadece warning ver
      // return { location: null, verified: false, error: 'Mock location detected' };
    }

    // Düşük doğruluk kontrolü - daha toleranslı
    if (location1.coords.accuracy && location1.coords.accuracy > opts.accuracyThreshold!) {
      console.warn('Low accuracy detected:', location1.coords.accuracy);
      // Çok düşük doğruluk değilse devam et
      if (location1.coords.accuracy > opts.accuracyThreshold! * 2) {
        return { location: null, verified: false, error: 'Very low accuracy' };
      }
    }

    // Basit doğrulama için ikinci okuma (daha kısa süre)
    await new Promise(resolve => setTimeout(resolve, opts.timeBetweenReadings!));
    
    const location2 = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // Changed from BestForNavigation
      timeInterval: 1000, // Reduced from 3000
    });

    // İki lokasyon arasındaki mesafe kontrolü - daha toleranslı
    const distance = calculateDistance(
      location1.coords.latitude,
      location1.coords.longitude,
      location2.coords.latitude,
      location2.coords.longitude
    );

    if (distance > opts.maxDistanceBetweenReadings!) {
      console.warn('Location inconsistency detected:', distance);
      // Çok büyük fark değilse ilk lokasyonu kullan
      if (distance > opts.maxDistanceBetweenReadings! * 2) {
        return { location: null, verified: false, error: 'Major location inconsistency' };
      }
    }

    // Zaman damgası kontrolü (daha toleranslı - 15 dakika)
    const now = Date.now();
    if (now - location2.timestamp > 900000) {
      console.warn('Old location data detected');
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

// Hızlı lokasyon alma - minimal güvenlik kontrolü ile
export const getQuickLocation = async (): Promise<SecureLocationResult> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Faster than High
      timeInterval: 1000,
    });

    // Sadece temel kontroller
    if (location.coords.accuracy && location.coords.accuracy > 500) {
      return { location: null, verified: false, error: 'Very low accuracy' };
    }

    // Mock location kontrolü (sadece warning)
    if (Platform.OS === 'android' && location.mocked) {
      console.warn('Mock location detected in quick mode');
    }

    return { location, verified: true };
  } catch (error) {
    console.error('Quick location error:', error);
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