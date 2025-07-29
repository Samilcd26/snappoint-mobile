import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

export const MAP_CONFIG = {
  LATITUDE_DELTA: 0.01,
  LONGITUDE_DELTA: 0.01 * ASPECT_RATIO,
  
  DEFAULT_ZOOM: 15,
  DEFAULT_CENTER: [28.9784, 41.0082], // Longitude, Latitude

  DEFAULT_REGION: {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01 * ASPECT_RATIO,
  },
  
  PLATFORM_SPECIFIC: {
    ios: {
      showsCompass: false,
      showsScale: false,
      showsTraffic: false,
      showsIndoors: false,
      showsPointsOfInterest: false,
      showsBuildings: false,
      rotateEnabled: false, // iOS'ta performans için disable
      pitchEnabled: false, // iOS'ta performans için disable
      scrollEnabled: true,
      zoomEnabled: true,
      zoomTapEnabled: true,
      scrollDuringRotateOrZoomEnabled: false, // iOS'ta performans için disable
      cacheEnabled: true,
      loadingBackgroundColor: '#f3f4f6',
      // iOS performans optimizasyonları
      loadingEnabled: false,
      moveOnMarkerPress: false,
      showsMyLocationButton: false,
      showsUserLocation: false,
      followsUserLocation: false,
      showsIndoorLevelPicker: false,
      toolbarEnabled: false,
      maxZoomLevel: 20,
      minZoomLevel: 8,
    },
    android: {
      showsCompass: false,
      showsScale: false,
      showsTraffic: false,
      showsIndoors: false,
      showsPointsOfInterest: false,
      showsBuildings: false,
      rotateEnabled: true,
      pitchEnabled: false,
      scrollEnabled: true,
      zoomEnabled: true,
      zoomTapEnabled: true,
      zoomControlEnabled: true,
      scrollDuringRotateOrZoomEnabled: true,
      toolbarEnabled: false,
      cacheEnabled: false,
      loadingBackgroundColor: '#f3f4f6',
      googleMapId: undefined,
    },
  } as const,
  
  ANIMATION_DURATION: 1000,
  DEBOUNCE_DELAY: Platform.OS === 'ios' ? 2000 : 1000, // iOS'ta daha uzun debounce
};

export const ZOOM_CONFIG = {
  MIN_ZOOM: 8,
  MAX_ZOOM: 20,
  DEFAULT_ZOOM: 16,
  
  // Zoom seviyesine göre radius hesaplama (km)
  calculateRadiusFromZoom: (zoomLevel: number): number => {
    switch (true) {
      case zoomLevel >= 18:
        return 0.5;
      case zoomLevel >= 16:
        return 1.0;
      case zoomLevel >= 14:
        return 2.0;
      case zoomLevel >= 12:
        return 5.0;
      case zoomLevel >= 10:
        return 10.0;
      case zoomLevel >= 8:
        return 20.0;
      default:
        return 50.0;
    }
  },
  
  // Zoom seviyesine göre maksimum marker sayısı
  calculateMaxMarkers: (zoomLevel: number): number => {
    // iOS'ta performans için daha az marker
    const multiplier = Platform.OS === 'ios' ? 0.6 : 1.0;
    
    switch (true) {
      case zoomLevel >= 18:
        return Math.floor(15 * multiplier);
      case zoomLevel >= 16:
        return Math.floor(20 * multiplier);
      case zoomLevel >= 14:
        return Math.floor(25 * multiplier);
      case zoomLevel >= 12:
        return Math.floor(30 * multiplier);
      case zoomLevel >= 10:
        return Math.floor(35 * multiplier);
      default:
        return Math.floor(40 * multiplier);
    }
  },
  
  // Zoom seviyesinden delta hesaplama
  calculateDeltaFromZoom: (zoomLevel: number) => {
    const longitudeDelta = 360 / Math.pow(2, zoomLevel);
    const latitudeDelta = longitudeDelta * ASPECT_RATIO;
    return { latitudeDelta, longitudeDelta };
  },
  
  // Region'dan zoom seviyesi hesaplama
  calculateZoomFromRegion: (region: any): number => {
    const angle = region.longitudeDelta;
    return Math.round(Math.log(360 / angle) / Math.LN2);
  },
  
  // Zoom değişiminin önemli olup olmadığını kontrol et
  isSignificantZoomChange: (oldZoom: number, newZoom: number): boolean => {
    return Math.abs(oldZoom - newZoom) >= 1;
  },
  
  // Zoom seviyesi açıklaması
  getZoomDescription: (zoomLevel: number): string => {
    if (zoomLevel >= 17) return 'Very Close';
    if (zoomLevel >= 15) return 'Close';
    if (zoomLevel >= 13) return 'Medium';
    if (zoomLevel >= 11) return 'Far';
    if (zoomLevel >= 9) return 'Very Far';
    return 'Ultra Far';
  },
}; 