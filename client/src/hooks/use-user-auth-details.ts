import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { getUserAuthDetails } from '@/lib/firebase';

export function useUserAuthDetails() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["userAuthDetails", user?.uid],
    queryFn: () => {
      if (!user?.uid) {
        throw new Error("No user ID available");
      }
      return getUserAuthDetails(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes to check verification status
  });
}