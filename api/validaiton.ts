import { apiCall } from '@/utils/ApiCalls';

export const validateUsername = async (username: string): Promise<boolean> => {
  return await apiCall.get(`/validation/username/${username}`);
};
export const validateEmail = async (email: string): Promise<boolean> => {
  return await apiCall.get(`/validation/email/${email}`);
};


