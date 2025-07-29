import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Marker as MarkerType } from '@/types/Marker';

const getMarkerColors = (score: number) => {
  if (score === 5) return { primary: '#8B5CF6', glow: '#8B5CF6' };
  if (score >= 15) return { primary: '#FFD700', glow: '#FFD700' };
  if (score >= 12) return { primary: '#10B981', glow: '#10B981' };
  if (score >= 10) return { primary: '#F59E0B', glow: '#F59E0B' };
  if (score >= 8) return { primary: '#EF4444', glow: '#EF4444' };
  return { primary: '#3B82F6', glow: '#3B82F6' };
};

const getMarkerSize = (score: number): number => {
  if (score >= 15) return 52;
  if (score >= 12) return 48;
  if (score >= 10) return 44;
  if (score >= 8) return 40;
  return 36;
};

interface MapMarkersProps {
  markers: MarkerType[];
  onMarkerPress: (marker: MarkerType) => void;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ markers, onMarkerPress }) => {
  const memoizedMarkers = useMemo(() => {
    if (!markers || markers.length === 0) return null;
    return Platform.OS === 'ios'
      ? [...markers].sort((a, b) => b.point_value - a.point_value)
      : markers;
  }, [markers]);

  if (!memoizedMarkers) {
    return null;
  }

  return (
    <>
      {memoizedMarkers.map((marker) => {
        const colors = getMarkerColors(marker.point_value);
        const size = getMarkerSize(marker.point_value);

        return (
          <MapboxGL.PointAnnotation
            key={`marker-${marker.id}`}
            id={`marker-${marker.id}`}
            coordinate={[marker.longitude, marker.latitude]}
            onSelected={() => onMarkerPress(marker)}
          >
            <View
              style={[
                styles.markerCircle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.markerText,
                  { fontSize: Math.max(size * 0.4, 12) },
                ]}
              >
                {marker.point_value}
              </Text>
            </View>
          </MapboxGL.PointAnnotation>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  markerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default memo(MapMarkers);
