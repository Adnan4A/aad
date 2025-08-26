import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { getUserProfile } from "@/lib/firebase";

export function useUserProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => {
      if (!user?.uid) {
        throw new Error("No user ID available");
      }
      return getUserProfile(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}