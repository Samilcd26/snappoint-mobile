import { apiCall } from "@/utils/ApiCalls";
import { useQuery } from "@tanstack/react-query";
import { LeaderboardResponse } from "@/types/Leaderboard";


export const useGetLeaderboard = (
  type: 'global' | 'weekly' | 'monthly' |  'nearby',
  page: number = 1,
  pageSize: number = 10,
  categoryId: string | null,
  latitude: number | null,
  longitude: number | null,
  maxDistance: number = 50
) => {
  const params: Record<string, string | number> = {
    type,
    page,
    pageSize,
    maxDistance
  };

  if (categoryId) params.categoryId = categoryId;
  if (latitude) params.latitude = latitude;
  if (longitude) params.longitude = longitude;

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard', params],
    queryFn: () => apiCall.get<LeaderboardResponse>('/leaderboard', { params }),
  });

  return { data, isLoading, error };
};