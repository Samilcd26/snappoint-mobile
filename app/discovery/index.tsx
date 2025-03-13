import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getNearbyPlaces, getPlaceDetailsForMarker } from '@/api/location';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import debounce from 'lodash/debounce';
import type { BasePlace, PlaceDetails } from '@/types/place';
import { darkMapStyle } from '@/styles/mapDarkTheme';
import PlaceBottomSheet from '@/components/PlaceBottomSheet';
import { Portal } from '@gorhom/portal';

export default function DiscoveryScreen() {
  const [zoomLevel, setZoomLevel] = useState(15);
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const { data: nearbyPlaces, isLoading: isLoadingPlaces } = useQuery({
    queryKey: ['nearbyPlaces'],
    queryFn: async () => {
      try {
        const response = await getNearbyPlaces(region.latitude, region.longitude, zoomLevel, 5000);
        console.log('API Response in getNearbyPlaces:', response);
        
        return response;
      } catch (error) {
        console.error('Error in queryFn:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 20,
    refetchInterval: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: placeDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['placeDetails', selectedPlaceId],
    queryFn: async () => {
      if (!selectedPlaceId) return null;
      return getPlaceDetailsForMarker(selectedPlaceId);
    },
    enabled: !!selectedPlaceId,
    select: (data) => data || null,
  });

  const debouncedRegionChange = useCallback(
    debounce((newRegion: any) => {
      setRegion(newRegion);
      const latitudeDelta = newRegion.latitudeDelta;
      const newZoomLevel = Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
      setZoomLevel(newZoomLevel);
    }, 1000),
    []
  );

  const handleMarkerPress = useCallback((placeId: number) => {
    setSelectedPlaceId(placeId);
  }, []);

  const markers = useMemo(() => {
    if (!Array.isArray(nearbyPlaces)) return [];
    
    return nearbyPlaces.map((place: BasePlace) => (
      <Marker
        key={place.ID}
        coordinate={{
          latitude: place.latitude,
          longitude: place.longitude,
        }}
        onPress={() => handleMarkerPress(place.ID)}
      >
        <View className="items-center">
          <View className="p-2 rounded-full border-2 border-white bg-blue-600">
            <Text className="text-white font-bold text-sm">{place.pointValue}</Text>
          </View>
        </View>
      </Marker>
    ));
  }, [nearbyPlaces, handleMarkerPress]);

  return (
    <View className="flex-1 bg-gray-900">
      
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        customMapStyle={darkMapStyle}
        initialRegion={region}
        onRegionChangeComplete={debouncedRegionChange}
      >
        {markers}
      </MapView>
      {(isLoadingPlaces || isLoadingDetails) && (
        <View className="absolute top-5 left-0 right-0 items-center">
          <Text className="bg-gray-900/70 text-white px-4 py-2 rounded-lg">
            {isLoadingDetails ? 'Mekan detayları yükleniyor...' : 'Yerler yükleniyor...'}
          </Text>
        </View>
      )}
      <Portal>
        <PlaceBottomSheet 
          key={selectedPlaceId || 'null'}
          placeDetails={placeDetails || null}
          isLoading={isLoadingDetails}
          onClose={() => setSelectedPlaceId(null)}
        />
      </Portal>
    </View>
  );
}