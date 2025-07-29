import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import { ZOOM_CONFIG } from '../constants/mapConfig';
import { FilterOptions } from '@/types/Marker';

interface ZoomDisplayProps {
  currentZoomLevel: number;
  markersCount: number;
  isLoading: boolean;
}

const ZoomDisplay: React.FC<ZoomDisplayProps> = memo(({
  currentZoomLevel,
  markersCount,
  isLoading,
}) => {
  const maxMarkers = ZOOM_CONFIG.calculateMaxMarkers(currentZoomLevel);
  const radiusKm = ZOOM_CONFIG.calculateRadiusFromZoom(currentZoomLevel);
  const zoomDescription = ZOOM_CONFIG.getZoomDescription(currentZoomLevel);

  return (
    <View style={styles.container}>
      {/* Zoom Info */}
      <View style={styles.zoomInfo}>
        <View style={styles.zoomHeader}>
          <Text style={styles.zoomText}>Zoom: {currentZoomLevel}</Text>
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Text style={styles.loadingText}>⟳</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.zoomSubText}>{zoomDescription}</Text>
        
        <Text style={styles.zoomSubText}>
          Markers: {markersCount}/{maxMarkers}
          {isLoading && (
            <Text style={styles.loadingSubText}> • Yükleniyor...</Text>
          )}
        </Text>
        
        <Text style={styles.locationText}>
          📍 Konumunuza göre • Radius: {radiusKm}km
        </Text>
      </View>
    </View>
  );
});

ZoomDisplay.displayName = 'ZoomDisplay';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Constants.statusBarHeight + 10,
    left: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  debugButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginRight: 10,
  },
  debugButtonText: {
    fontSize: 20,
  },
  zoomInfo: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 120,
  },
  zoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  loadingIndicator: {
    marginLeft: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    opacity: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
  },
  zoomSubText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 1,
  },
  locationText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 1,
    opacity: 0.7,
  },
  filterText: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
    opacity: 0.6,
  },
  loadingSubText: {
    color: '#3b82f6',
    fontSize: 10,
  },
});

export default ZoomDisplay; 