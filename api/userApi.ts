import { UserDetail } from "@/types/User";
import { SuccessResponse } from "@/types/Response";
import { apiCall } from "@/utils/ApiCalls";
import { useQuery } from "@tanstack/react-query";

export const useGetUser = (userId: number) => {
    const { data, isLoading, error } = useQuery({
      queryKey: ['user'],
      queryFn: async () => {
        return apiCall.get<SuccessResponse<UserDetail>>(`/users/${userId}/profile`);
      },
      enabled: !!userId,
    });
    return { data, isLoading, error };
  };