import { useAuth } from '@/contexts/auth';

export const useUserProfile = () => {
  const { profile } = useAuth();
  return { userProfile: profile };
};
