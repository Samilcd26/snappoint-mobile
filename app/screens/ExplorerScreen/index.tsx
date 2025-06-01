import 'react-native-get-random-values';
import React, { useRef, useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, ViewStyle, TouchableOpacity, Platform, Animated } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, MapMarkerProps } from 'react-native-maps';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useGetMarkers } from '@/api/placeApi';
import MarkerModal from '@/app/screens/ExplorerScreen/MarkerModal';
import FilterModal from '@/app/screens/ExplorerScreen/FilterModal';
import { Feather } from '@expo/vector-icons';
import { Marker as MarkerType } from '@/types/Marker';
import { FilterOptions } from '@/types/Marker';
import { mapStyle } from '@/app/config/mapStyle';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const getMarkerColors = (score: number): { primary: string; secondary: string; accent: string } => {
  if (score >= 4) return { 
    primary: '#4CAF50', 
    secondary: '#66BB6A', 
    accent: '#2E7D32' 
  }; // Green gradient for high scores (4-5)
  if (score >= 3) return { 
    primary: '#FF9800', 
    secondary: '#FFB74D', 
    accent: '#F57C00' 
  }; // Orange gradient for medium scores (3-4)
  if (score >= 2) return { 
    primary: '#FF5722', 
    secondary: '#FF8A65', 
    accent: '#D84315' 
  }; // Red-orange gradient for low-medium scores (2-3)
  return { 
    primary: '#F44336', 
    secondary: '#EF5350', 
    accent: '#C62828' 
  }; // Red gradient for low scores (1-2)
};

const getMarkerSize = (score: number): number => {
  // Dynamic sizing based on score 1-5 (minimum 28, maximum 44)
  return Math.max(28, Math.min(44, 28 + (score - 1) * 4));
};

interface CustomMarkerProps extends Omit<MapMarkerProps, 'children'> {
  score: number;
  onPress: () => void;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ score, onPress, ...props }) => {
  const colors = getMarkerColors(score);
  const size = getMarkerSize(score);
  
  return (
    <Marker
      {...props}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[styles.simpleMarkerContainer, { width: size, height: size + 8 }]}>
        {/* Pin Body */}
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          style={[styles.simpleMarkerBody, { 
            width: size, 
            height: size, 
            borderRadius: size / 2 
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Score Text */}
          <Text style={[styles.simpleScoreText, { fontSize: size * 0.40, fontWeight: 'bold' }]}>
            {score}
          </Text>
          
          {/* Highlight dot */}
          <View style={[styles.simpleHighlight, { 
            top: size * 0.2, 
            right: size * 0.2,
            width: size * 0.12,
            height: size * 0.12,
            borderRadius: (size * 0.12) / 2
          }]} />
        </LinearGradient>
        
        {/* Simple Pin Tip */}
        <View style={[styles.simplePinTip, { 
          borderTopColor: colors.accent,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderTopWidth: 6,
        }]} />
      </View>
    </Marker>
  );
};

export default function ExplorerScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [initialLocation, setInitialLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    zoomLevel: 15,
    radius: 1000,
  });
  const [filters, setFilters] = useState<FilterOptions>({
    hideVisited: false,
    categories: [],
    radius: 1000,
    zoomLevel: 15,
  });
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);


  const { data, isLoading, error } = useGetMarkers(
    initialLocation.latitude, 
    initialLocation.longitude, 
    initialLocation.zoomLevel, 
    initialLocation.radius, 
    filters.hideVisited, 
  );




  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [activeFilters, setActiveFilters] = useState<boolean>(false);
/**
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        console.log("location", location);
        setInitialLocation(prev => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);
 */

  // Check if any filters are active
  useEffect(() => {
    const hasActiveFilters = 
      filters.hideVisited || 
      filters.categories.length > 0;
    
    setActiveFilters(hasActiveFilters);
  }, [filters]);

  const handleMarkerPress = (marker: MarkerType) => {
    setSelectedMarker(marker);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMarker(null);
  };

  const handlePostAt = () => {
    // Navigate to the CreatePost screen with the marker location
    if (selectedMarker) {
      router.push({
        pathname: '/screens/CreatePost',
        params: {
          latitude: selectedMarker.latitude,
          longitude: selectedMarker.longitude,
          placeId: selectedMarker.id,
          pointValue: selectedMarker.pointValue,
        }
      });
    }
    handleCloseModal();
  };

  const handleGoToProfile = () => {
    console.log('Go to profile for marker:', selectedMarker);
    // Navigate to the profile tab with the marker data
    if (selectedMarker) {
      router.push({
        pathname: '/screens/PlaceProfileScreen',
        params: {
          placeId: selectedMarker.id,
          latitude: selectedMarker.latitude,
          longitude: selectedMarker.longitude,
          pointValue: selectedMarker.pointValue,
          isVerified: selectedMarker.isVerified.toString(),
        }
      });
    }
    handleCloseModal();
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalVisible(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalVisible(false);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading markers...</Text>
      </View>
    );
  }

  

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        ref={mapRef}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
  
        mapType="standard"
        onMapReady={() => {
          console.log('Map is ready');
        }}
      >
        {data?.markers && data.markers.map((marker) => (
          <CustomMarker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            score={marker.pointValue}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
      </MapView>

      {/* Filter Button */}
      <TouchableOpacity 
        style={[styles.filterButton, activeFilters && styles.activeFilterButton]}
        onPress={handleOpenFilterModal}
      >
        <Feather name="filter" size={24} color={activeFilters ? "white" : "black"} />
      </TouchableOpacity>

      <MarkerModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        onPostAt={handlePostAt}
        onGoToProfile={handleGoToProfile}
      />
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
    </View>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterButton: {
    position: 'absolute',
    top: Constants.statusBarHeight + 10,
    right: 15,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeFilterButton: {
    backgroundColor: '#3498db',
  },
  simpleMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleMarkerBody: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  simpleScoreText: {
    color: 'white',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  simpleHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  simplePinTip: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
