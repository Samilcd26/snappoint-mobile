import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from '@/utils/useTranslation';

// Bileşenler
import { LoaderOne } from '@/components/ui/LoaderOne';
import MarkerBottomSheet from './MarkerBottomSheet';
import FilterModal from './FilterModal';
import MapControls from './components/MapControls';
import MapMarkers from './components/MapMarkers';
import UserLocationMarker from './components/UserLocationMarker';
import ZoomDisplay from './components/ZoomDisplay';
import ErrorDisplay from './components/ErrorDisplay';

// Hook'lar
import useLocation from './hooks/useLocation';
import { useExplorerMap } from './hooks/useExplorerMap';
import useFilters from './hooks/useFilters';

// Tipler
import { Marker as MarkerType } from '@/types/Marker';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

export default function ExplorerScreen() {
  const { t } = useTranslation();

  // Konum ve Filtre hook'ları
  const { userLocation, locationVerified, isLocationLoading, locationError, requestLocationUpdate } = useLocation();
  const { filters, isFilterModalVisible, handleOpenFilterModal, handleCloseFilterModal, handleApplyFilters: applyFiltersToHook } = useFilters();

  // Birleştirilmiş ve optimize edilmiş harita hook'u
  const {
    cameraRef,
    markers,
    isMarkersLoading,
    markersError,
    cameraState,
    activeFilters,
    onMapIdle,
    flyToUserLocation,
    refreshMarkers,
    applyFilters,
  } = useExplorerMap(userLocation, filters, locationVerified);

  // Bottom Sheet ve Marker seçimi
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);

  const handleMarkerPress = useCallback((marker: MarkerType) => {
    setSelectedMarker(marker);
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setSelectedMarker(null);
  }, []);
  
  const handleApplyAndCloseFilters = useCallback((newFilters: any) => {
    applyFilters(newFilters);
    applyFiltersToHook(newFilters)
    handleCloseFilterModal();
  }, [applyFilters, handleCloseFilterModal]);


  const handleRetry = useCallback(() => {
    if (locationError) requestLocationUpdate();
    if (markersError) refreshMarkers();
  }, [locationError, markersError, requestLocationUpdate, refreshMarkers]);

  // Yüklenme ve Hata durumları
  if (isLocationLoading) {
    return <LoaderOne title="Konum alınıyor..." subtitle="Harita yükleniyor..." />;
  }
  if (isMarkersLoading) {
    return <LoaderOne title={t('markersLoading')} subtitle={t('searchingNearby')} />;
  }
  if (locationError || markersError) {
    return <ErrorDisplay error={locationError || markersError} onRetry={handleRetry} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        onMapIdle={onMapIdle}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          centerCoordinate={cameraState.centerCoordinate}
          zoomLevel={cameraState.zoomLevel}
          animationMode="flyTo"
          animationDuration={1000}
        />

        <MapMarkers markers={markers} onMarkerPress={handleMarkerPress} />

        {userLocation && <UserLocationMarker coordinate={userLocation} />}
      </MapboxGL.MapView>

      <ZoomDisplay
        currentZoomLevel={cameraState.zoomLevel}
        markersCount={markers.length}
        isLoading={isMarkersLoading}
      />

      <MapControls
        activeFilters={activeFilters.hideVisited || activeFilters.categories.length > 0}
        onFilterPress={handleOpenFilterModal}
        onMyLocationPress={flyToUserLocation}
      />

      {isModalVisible && selectedMarker && (
        <MarkerBottomSheet
          isVisible={isModalVisible}
          marker={selectedMarker}
          onClose={handleCloseModal}
          onShowLocation={(lat, lon) => cameraRef.current?.flyTo([lon, lat], 1000)}
        />
      )}

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyAndCloseFilters}
        initialFilters={filters}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
