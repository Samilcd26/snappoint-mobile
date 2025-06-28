import { apiCall } from "@/utils/ApiCalls";
import { useQuery } from "@tanstack/react-query";
import { Marker, MarkerResponse } from "@/types/Marker";
import { PostDetail } from "@/types/post.types";
import { PlaceDetailResponse, PostGridResponse, ValidatePostLocationResponse } from "@/types/Place";


export const useGetMarkers = (
  latitude: number,
  longitude: number,
  zoomLevel: number,
  radius: number,
  hideVisited?: boolean,
  category?: string,
  maxPlaces?: number,
  enabled: boolean = true // Yeni enabled parametresi
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
    enabled: enabled && latitude !== 0 && longitude !== 0, // Sadece enabled=true ve geçerli koordinatlar varsa çalıştır
  });
console.log({data});
  
  return { data, isLoading, error };
};








export const useGetPlaceById = (placeId: number | undefined) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['place', placeId],
        queryFn: () => apiCall.get<PlaceDetailResponse>(`/places/${placeId}/profile`),
        enabled: !!placeId
    });

    
    return { data, isLoading, error };
};


export const useGetPlacePosts = (placeId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['placePosts', placeId],
    queryFn: () => apiCall.get<PostGridResponse>(`/places/${placeId}/posts/grid`),
  });
  return { data, isLoading, error };
};




  
export const useValidatePostLocation = (placeId: number, latitude: number, longitude: number, enabled: boolean = false) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['validatePostLocation', placeId, latitude, longitude],
    queryFn: () => apiCall.get<ValidatePostLocationResponse>(`/places/${placeId}/validate-location?latitude=${latitude}&longitude=${longitude}`),
    enabled: enabled && placeId > 0 && latitude !== 0 && longitude !== 0,
  });
  return { data, isLoading, error };
};