import { apiCall } from "@/utils/ApiCalls";
import { useQuery } from "@tanstack/react-query";
import { Marker, MarkerResponse } from "@/types/Marker";
import { PostDetail } from "@/types/post.types";
import { PlaceDetailResponse } from "@/types/Place";


export const useGetMarkers = (
  latitude: number,
  longitude: number,
  zoomLevel: number,
  radius: number,
  hideVisited?: boolean,
  category?: string,
  maxPlaces?: number
) => {
  const params: Record<string, string | number | boolean> = {
    latitude,
    longitude,
    zoomLevel,
    radius,
  };

  if (hideVisited !== undefined) params.hideVisited = hideVisited;
  if (category) params.category = category;
  if (maxPlaces !== undefined) params.maxPlaces = maxPlaces;

  const { data, isLoading, error } = useQuery({
    queryKey: ['markers', params], // daha sade ve anlamlı
    queryFn: () =>
      apiCall.get<MarkerResponse>('/places/nearby', { params }).then(res => res),
    staleTime: 1000 * 10, // 10 saniye boyunca cache fresh kalır
  });
console.log({data});
  
  return { data, isLoading, error };
};








export const useGetPlaceById = (placeId: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['place', placeId],
        queryFn: () => apiCall.get<PlaceDetailResponse>(`/places/${placeId}/profile`),
    });

    
    return { data, isLoading, error };
};





  