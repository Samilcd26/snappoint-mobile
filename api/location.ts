import { apiCall } from '@/utils/ApiCalls';



export const updateCurrentLocation = async (latitude: number, longitude: number) => {
  const response = await apiCall.post('/users/location', {
    latitude,
    longitude,
  });
  return response;
};

export const getNearbyPlaces = async () => {
  const response = await apiCall.get(`/places/nearby`);
  return response;
};
