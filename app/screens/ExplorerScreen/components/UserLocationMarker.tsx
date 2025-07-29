import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

interface UserLocationMarkerProps {
  coordinate: { latitude: number; longitude: number };
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = memo(({ coordinate }) => {
  return (
    <MapboxGL.PointAnnotation
      id="user-location"
      coordinate={[coordinate.longitude, coordinate.latitude]}
    >
      <View style={styles.userMarkerContainer}>
        {/* Pulse rings */}
        <View style={styles.userPulseOuter} />
        <View style={styles.userPulseMiddle} />

        {/* Main user dot */}
        <View style={styles.userMainDot}>
          <View style={styles.userInnerDot} />
        </View>

        {/* Accuracy ring */}
        <View style={styles.userAccuracyRing} />
      </View>
    </MapboxGL.PointAnnotation>
  );
}, (prev, next) =>
  prev.coordinate.latitude === next.coordinate.latitude &&
  prev.coordinate.longitude === next.coordinate.longitude
);

UserLocationMarker.displayName = 'UserLocationMarker';

const styles = StyleSheet.create({
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  userPulseOuter: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  userPulseMiddle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  userMainDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 2,
          elevation: 4,
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 8,
        }),
  },
  userInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  userAccuracyRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
});

export default UserLocationMarker;
