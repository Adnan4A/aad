import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { addToWatchlist, removeFromWatchlist, getUserWatchlist } from "@/lib/firebase";
import { useToast } from "./use-toast";

export function useWatchlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading, refetch } = useQuery({
    queryKey: ["watchlist", user?.uid],
    queryFn: () => getUserWatchlist(user!.uid),
    enabled: !!user,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    retry: (failureCount, error) => {
      // Don't retry if Firebase is unavailable - fallback will handle it
      return failureCount < 2 && !(error as any)?.code?.includes('unavailable');
    }
  });

  const addMutation = useMutation({
    mutationFn: (coinId: string) => addToWatchlist(user!.uid, coinId),
    onSuccess: () => {
      // Immediately invalidate and refetch the watchlist
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.uid] });
      refetch();
      toast({
        title: "Added to Watchlist",
        description: "Coin successfully added to your watchlist",
      });
    },
    onError: (error) => {
      console.error('Watchlist add error:', error);
      // Since we have localStorage fallback, the operation still works
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.uid] });
      refetch();
      toast({
        title: "Added to Watchlist",
        description: "Coin added to your watchlist (will sync when online)",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (coinId: string) => removeFromWatchlist(user!.uid, coinId),
    onSuccess: () => {
      // Immediately invalidate and refetch the watchlist
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.uid] });
      refetch();
      toast({
        title: "Removed from Watchlist",
        description: "Coin successfully removed from your watchlist",
      });
    },
    onError: (error) => {
      console.error('Watchlist remove error:', error);
      // Since we have localStorage fallback, the operation still works
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.uid] });
      refetch();
      toast({
        title: "Removed from Watchlist",
        description: "Coin removed from your watchlist (will sync when online)",
      });
    },
  });

  const isInWatchlist = (coinId: string) => watchlist.includes(coinId);

  const toggleWatchlist = (coinId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your watchlist",
        variant: "destructive",
      });
      return;
    }

    if (isInWatchlist(coinId)) {
      removeMutation.mutate(coinId);
    } else {
      addMutation.mutate(coinId);
    }
  };

  return {
    watchlist,
    isLoading,
    isInWatchlist,
    toggleWatchlist,
    addToWatchlist: addMutation.mutate,
    removeFromWatchlist: removeMutation.mutate,
  };
}