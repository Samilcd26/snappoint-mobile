import { useState, useEffect, useCallback, useRef } from 'react';
import { useGetMarkers } from '@/api/placeApi';
import { Marker as MarkerType, FilterOptions } from '@/types/Marker';
import { ZOOM_CONFIG, MAP_CONFIG } from '../constants/mapConfig';
import MapboxGL from '@rnmapbox/maps';

// Debounce hook'u - Değer değişimini geciktirerek performansı artırır.
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const useExplorerMap = (
  userLocation: { latitude: number; longitude: number } | null,
  initialFilters: FilterOptions,
  locationVerified: boolean
) => {
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Haritanın merkez koordinatını ve zoom seviyesini tutan state
  const [cameraState, setCameraState] = useState({
    centerCoordinate: userLocation ? [userLocation.longitude, userLocation.latitude] : MAP_CONFIG.DEFAULT_CENTER,
    zoomLevel: MAP_CONFIG.DEFAULT_ZOOM,
  });

  // API çağrılarını tetikleyecek olan, geciktirilmiş (debounced) kamera durumu.
  const debouncedCameraState = useDebounce(cameraState, MAP_CONFIG.DEBOUNCE_DELAY);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetMarkers(
    debouncedCameraState.centerCoordinate[1], // latitude
    debouncedCameraState.centerCoordinate[0], // longitude
    debouncedCameraState.zoomLevel,
    ZOOM_CONFIG.calculateRadiusFromZoom(debouncedCameraState.zoomLevel) * 1000,
    activeFilters.hideVisited,
    activeFilters.categories.length > 0 ? activeFilters.categories.join(',') : undefined,
    ZOOM_CONFIG.calculateMaxMarkers(debouncedCameraState.zoomLevel),
    locationVerified // API çağrısı sadece konum doğrulandıktan sonra etkinleşir
  );

  // API'den gelen marker verisi güncellendiğinde state'i güncelle
  useEffect(() => {
    if (data?.markers) {
      setMarkers(data.markers);
      if (isFirstLoad) setIsFirstLoad(false);
    }
  }, [data]);

  // Harita üzerindeki etkileşim durduğunda (onIdle) çağrılır.
  // Bu, sürekli API isteği göndermeyi engeller.
  const onMapIdle = useCallback(async (event: any) => {
    const { properties } = event;
    const { center, zoom } = properties;
    console.log(`🗺️ Map Idle: Zoom: ${zoom.toFixed(2)}, Center: ${center[1].toFixed(4)}, ${center[0].toFixed(4)}`);
    setCameraState({
      centerCoordinate: center,
      zoomLevel: zoom,
    });
  }, []);
  
  // Filtreleri uygulama fonksiyonu
  const applyFilters = useCallback((newFilters: FilterOptions) => {
    setActiveFilters(newFilters);
  }, []);

  // Filtreler değiştiğinde API'yi yeniden tetikle
  useEffect(() => {
    if (!isFirstLoad) {
      refetch();
    }
  }, [activeFilters, refetch, isFirstLoad]);


  // Kullanıcının mevcut konumuna git
  const flyToUserLocation = useCallback(() => {
    if (userLocation) {
      cameraRef.current?.flyTo([userLocation.longitude, userLocation.latitude], MAP_CONFIG.ANIMATION_DURATION);
    }
  }, [userLocation]);
  
  // Marker'ları manuel olarak yenile
  const refreshMarkers = useCallback(() => {
    console.log('🔄 Manual Refresh Triggered');
    refetch();
  }, [refetch]);

  return {
    cameraRef,
    markers,
    isMarkersLoading: isLoading && isFirstLoad,
    markersError: error,
    cameraState,
    activeFilters,
    
    // Fonksiyonlar
    onMapIdle,
    applyFilters,
    flyToUserLocation,
    refreshMarkers
  };
};