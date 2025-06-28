import 'react-native-get-random-values';
import React, { useRef, useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, ViewStyle, TouchableOpacity, Platform, Animated, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, MapMarkerProps } from 'react-native-maps';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useGetMarkers } from '@/api/placeApi';
import MarkerBottomSheet from '@/app/screens/ExplorerScreen/MarkerBottomSheet';
import FilterModal from '@/app/screens/ExplorerScreen/FilterModal';
import { Feather } from '@expo/vector-icons';
import { Marker as MarkerType } from '@/types/Marker';
import { FilterOptions } from '@/types/Marker';
import { mapStyle } from '@/app/config/mapStyle';
import { LinearGradient } from 'expo-linear-gradient';
import { PostSummary } from '@/types/post.types';
import * as Location from 'expo-location';
import { 
  getSecureLocation, 
  validateLocationSecurity, 
  requestLocationPermissions, 
  startLocationWatching,
  SecureLocationResult 
} from '@/utils/LocationSecurity';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01; // Daha yakın zoom için küçültüldü (0.0922 → 0.01)
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const getMarkerColors = (score: number): { primary: string; secondary: string; accent: string; glow: string } => {
  if (score >= 50) return { 
    primary: '#FFD700', 
    secondary: '#FFF8DC', 
    accent: '#DAA520',
    glow: '#FFD700'
  }; // Gold for very high scores (50+) - very rare
  if (score >= 30) return { 
    primary: '#4CAF50', 
    secondary: '#66BB6A', 
    accent: '#2E7D32',
    glow: '#4CAF50'
  }; // Green for good scores (30-49)
  if (score >= 20) return { 
    primary: '#FF9800', 
    secondary: '#FFB74D', 
    accent: '#F57C00',
    glow: '#FF9800'
  }; // Orange for medium scores (20-29)
  if (score >= 10) return { 
    primary: '#FF5722', 
    secondary: '#FF8A65', 
    accent: '#D84315',
    glow: '#FF5722'
  }; // Red-orange for low-medium scores (10-19)
  return { 
    primary: '#F44336', 
    secondary: '#EF5350', 
    accent: '#C62828',
    glow: '#F44336'
  }; // Red for very low scores (5-9)
};

const getMarkerSize = (score: number): number => {
  // Daha küçük ve kompakt boyutlar
  if (score >= 50) return 36; // Maximum size for very rare high scores
  if (score >= 30) return 32; // Large for good scores
  if (score >= 20) return 28; // Medium-large for medium scores
  if (score >= 10) return 26; // Medium for low-medium scores
  return 24; // Minimum size for very low scores
};

interface CustomMarkerProps extends Omit<MapMarkerProps, 'children'> {
  marker: MarkerType;
  onPress: () => void;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ marker, onPress, ...props }) => {
  const colors = getMarkerColors(marker.point_value);
  const size = getMarkerSize(marker.point_value);
  const isLegendary = marker.point_value >= 50;
  
  return (
    <Marker
      {...props}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[styles.simpleContainer, { width: size + 4, height: size + 12 }]}>
        {/* Main circle with gradient - focus on points */}
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          style={[styles.mainCircle, {
            width: size,
            height: size,
            borderRadius: size / 2,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 6,
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* BIG SCORE - main focus */}
          <Text style={[styles.bigScore, {
            fontSize: size * 0.45,
            fontWeight: '900',
            color: 'white',
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }]}>
            {marker.point_value}
          </Text>
          
          {/* Small verification dot */}
          {marker.is_verified && (
            <View style={[styles.verifyDot, {
              position: 'absolute',
              top: size * 0.15,
              right: size * 0.15,
              width: size * 0.2,
              height: size * 0.2,
              borderRadius: size * 0.1,
              backgroundColor: '#FFD700',
            }]} />
          )}
          
          {/* Crown for legendary */}
          {isLegendary && (
            <Text style={{
              position: 'absolute',
              top: -size * 0.1,
              fontSize: size * 0.25,
              color: '#FFD700',
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
            }}>👑</Text>
          )}
        </LinearGradient>
        
        {/* Small distance info */}
        <View style={[styles.distanceTag, {
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: [{ translateX: -10 }],
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: 6,
          paddingHorizontal: 4,
          paddingVertical: 1,
          minWidth: 20,
        }]}>
          <Text style={[styles.distanceSmall, {
            fontSize: 7,
            fontWeight: '600',
            color: 'white',
            textAlign: 'center',
          }]}>
            {Math.round(marker.distance * 1000)}m
          </Text>
        </View>
      </View>
    </Marker>
  );
};

// Kullanıcı konumu marker bileşeni
const UserLocationMarker: React.FC<{ coordinate: { latitude: number; longitude: number } }> = ({ 
  coordinate 
}) => {
  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.userLocationContainer}>
        {/* Outer pulse circle */}
        <View style={styles.userLocationPulse} />
        
        {/* Inner dot */}
        <View style={styles.userLocationDot}>
          <View style={styles.userLocationInnerDot} />
        </View>
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
    zoomLevel: 16, // Daha yakın zoom level (15 → 16)
    radius: 500,   // Daha küçük radius (1000 → 500)
  });
  const [filters, setFilters] = useState<FilterOptions>({
    hideVisited: false,
    categories: [],
    radius: 500,   // Daha küçük radius (1000 → 500)
    zoomLevel: 16, // Daha yakın zoom level (15 → 16)
  });
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState<Location.LocationSubscription | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);


  // Sadece lokasyon doğrulandıysa useGetMarkers'ı çalıştır
  const { data, isLoading, error } = useGetMarkers(
    initialLocation.latitude, 
    initialLocation.longitude, 
    initialLocation.zoomLevel, 
    initialLocation.radius, 
    filters.hideVisited,
    undefined, // category
    undefined, // maxPlaces
    locationVerified // enabled - sadece lokasyon doğrulandıysa çalıştır
  );

console.log({data});



  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [activeFilters, setActiveFilters] = useState<boolean>(false);



    useEffect(() => {
    (async () => {
      // Konum izinlerini kontrol et ve al
      const permissionResult = await requestLocationPermissions();
      if (!permissionResult.granted) {
        return;
      }

      // Güvenli lokasyon al
      const locationResult = await getSecureLocation();
             if (locationResult.verified && locationResult.location) {
         console.log("Güvenli lokasyon alındı:", locationResult.location);
         const userCoords = {
           latitude: locationResult.location.coords.latitude,
           longitude: locationResult.location.coords.longitude,
         };
         
         setInitialLocation(prev => ({
           ...prev,
           ...userCoords,
         }));
         setUserLocation(userCoords);
         setLocationVerified(true);
         
         // Sürekli lokasyon izleme başlat (güvenlik için)
         startContinuousLocationMonitoring();
       }
    })();
  }, []);

   // Sürekli lokasyon izleme (güvenlik kontrolü)
   const startContinuousLocationMonitoring = async () => {
     const subscription = await startLocationWatching(
       (newLocation) => {
         // Yeni lokasyon güvenlik kontrolü
         handleLocationUpdate(newLocation);
       },
       {
         timeInterval: 30000, // 30 saniye aralıklarla
         distanceInterval: 50, // 50 metre değişimde
       }
     );
     if (subscription) {
       setLocationWatcher(subscription);
     }
   };

   // Lokasyon güvenlik doğrulaması
   const handleLocationUpdate = (location: Location.LocationObject) => {
     const validation = validateLocationSecurity(location);
     
     // Kullanıcı konumunu güncelle
     const newUserLocation = {
       latitude: location.coords.latitude,
       longitude: location.coords.longitude,
     };
     setUserLocation(newUserLocation);
     
     setSecurityAlerts(prev => {
       const newAlertCount = prev + validation.alertCount;
       
       // Çok fazla güvenlik uyarısı varsa uygulamayı kısıtla
       if (newAlertCount > 3) {
         Alert.alert(
           'Güvenlik İhlali',
           'Çok fazla şüpheli aktivite tespit edildi. Uygulamayı yeniden başlatın.',
           [
             { 
               text: 'Yeniden Başlat', 
               onPress: async () => {
                 setSecurityAlerts(0);
                 setLocationVerified(false);
                 // Konumu yeniden al
                 const locationResult = await getSecureLocation();
                 if (locationResult.verified && locationResult.location) {
                   const userCoords = {
                     latitude: locationResult.location.coords.latitude,
                     longitude: locationResult.location.coords.longitude,
                   };
                   setInitialLocation(prev => ({
                     ...prev,
                     ...userCoords,
                   }));
                   setUserLocation(userCoords);
                   setLocationVerified(true);
                 }
               }
             }
           ]
         );
       }
       
       return newAlertCount;
     });
   };

   // Temizlik işlemi
   useEffect(() => {
     return () => {
       if (locationWatcher) {
         locationWatcher.remove();
       }
     };
   }, [locationWatcher]);
 

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
          pointValue: selectedMarker.point_value,
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

  const handlePostPress = (post: PostSummary) => {
    router.push({
      pathname: '/screens/PostDetailScreen',
      params: {
        userId: post.user.id.toString(),
        placeId: selectedMarker?.id.toString(),
        postId: post.id.toString(),
      }
    });
  };

  const handleUserPress = (userId: string) => {
    router.push(`/screens/UserProfileScreen?userId=${userId}`);
  };

  const handleShowLocation = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  // Konum doğrulanmadıysa yükleme göster
  if (!locationVerified) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Güvenli konum alınıyor...</Text>
        <Text style={styles.loadingSubText}>
          Bu işlem güvenlik kontrollerini içerir ve birkaç saniye sürebilir.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Markerlar yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Hata: {error.message}</Text>
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
            marker={marker}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}

        {/* Kullanıcı konumu marker */}
        {userLocation && (
          <UserLocationMarker coordinate={userLocation} />
        )}
      </MapView>

      {/* Filter Button */}
      <TouchableOpacity 
        style={[styles.filterButton, activeFilters && styles.activeFilterButton]}
        onPress={handleOpenFilterModal}
      >
        <Feather name="filter" size={24} color={activeFilters ? "white" : "black"} />
      </TouchableOpacity>

      <MarkerBottomSheet
        isVisible={isModalVisible}
        marker={selectedMarker}
        onClose={handleCloseModal}
        onPostAt={handlePostAt}
        onPostPress={handlePostPress}
        onUserPress={handleUserPress}
        onShowLocation={handleShowLocation}
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
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
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
  simpleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 7,
  },
  bigScore: {
    color: 'white',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  verifyDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  distanceTag: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -10 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 20,
  },
  distanceSmall: {
    fontSize: 7,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  userLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  userLocationInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
});
