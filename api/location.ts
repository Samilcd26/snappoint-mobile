import { apiCall } from '@/utils/ApiCalls';
import type { BasePlace, PlaceDetails } from '@/types/place';

export interface Place {
  id: number;
  latitude: number;
  longitude: number;
  pointValue: number;
  isVerified: boolean;
}

export const updateCurrentLocation = async (latitude: number, longitude: number) => {
  const response = await apiCall.post('/users/location', {
    latitude,
    longitude,
  });
  return response;
};

export const getNearbyPlaces = async (latitude: number, longitude: number, zoomLevel: number, radius: number) => {
  try {
    const data= await apiCall.get<Place[]>(`/places/nearby?latitude=${latitude}&longitude=${longitude}&zoomLevel=${zoomLevel}&radius=${radius}`);
    console.log('AssssssearbyPlaces:', data);
    
    // Transform the response to match BasePlace interface
    return data.map(place => ({
      ID: place.id,
      name: '',
      description: '',
      latitude: place.latitude,
      longitude: place.longitude,
      pointValue: place.pointValue,
      placeImage: ''
    }));
  } catch (error) {
    console.error('Error in getNearbyPlaces:', error);
    return [];
  }
};

export const getPlaceDetailsForMarker = async (placeId: number): Promise<PlaceDetails> => { 
  try {
    const response = await apiCall.get<PlaceDetails>(`/places/${placeId}/marker`);
    console.log("API Response in getPlaceDetailsForMarker:",response);
    
    return response;
  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    throw error;
  }
};
