import { useQuery } from "@tanstack/react-query";
import { CryptoAPI } from "@/lib/api";
import type { GlobalStats, Crypto, CoinDetail, HistoricalData } from "@shared/schema";

export function useGlobalStats() {
  return useQuery<GlobalStats>({
    queryKey: ["/api/global-stats"],
    queryFn: () => CryptoAPI.getGlobalStats(),
    refetchInterval: 1000, // 1 second real-time updates
    staleTime: 0, // Always consider data stale for instant updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useCoins(page = 1, perPage = 100) {
  return useQuery<Crypto[]>({
    queryKey: ["/api/coins"], // Simplified key for cache sharing
    queryFn: () => CryptoAPI.getCoins(page, perPage),
    refetchInterval: 1000, // 1 second real-time updates
    staleTime: 0, // Always consider data stale for instant updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useCoinDetail(coinId: string | null) {
  return useQuery<CoinDetail>({
    queryKey: ["/api/coins/detail", coinId], // Different key to avoid conflicts
    queryFn: () => CryptoAPI.getCoinDetail(coinId!),
    enabled: !!coinId,
    refetchInterval: 1000, // 1 second real-time updates
    staleTime: 0, // Always consider data stale for instant updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useHistoricalData(coinId: string | null, days: number, interval?: string) {
  const getApiInterval = (days: number) => {
    if (days <= 0.04) return 'hourly'; // 1 hour or less
    if (days <= 0.17) return 'hourly'; // 4 hours or less
    if (days <= 1) return 'hourly'; // 1 day
    if (days <= 7) return 'daily'; // 7 days
    return 'daily'; // 30 days and more
  };

  const apiInterval = interval || getApiInterval(days);
  
  return useQuery<HistoricalData>({
    queryKey: ["/api/coins", coinId, "history", days, apiInterval],
    queryFn: () => CryptoAPI.getHistoricalData(coinId!, days, apiInterval),
    enabled: !!coinId,
    staleTime: 0, // Always consider data stale for instant updates
    refetchInterval: 30000, // Refetch every 30 seconds for historical data (less frequent for performance)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useSearchCoins(query: string) {
  return useQuery({
    queryKey: ["/api/search", query],
    queryFn: () => CryptoAPI.searchCoins(query),
    enabled: query.length >= 2,
    staleTime: 300000, // Search results can be cached longer
  });
}

// Custom hooks for derived data
export function useTopPerformers() {
  const { data: coins, ...rest } = useCoins();
  
  const topPerformers = coins
    ?.filter(coin => coin.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 10);

  return { data: topPerformers, ...rest };
}

export function useUnderPerformers() {
  const { data: coins, ...rest } = useCoins();
  
  const underPerformers = coins
    ?.filter(coin => coin.price_change_percentage_24h < 0)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 10);

  return { data: underPerformers, ...rest };
}

export function useLivePrices() {
  const { data: coins, ...rest } = useCoins();
  return { data: coins?.slice(0, 20), ...rest }; // Show top 20 coins for comprehensive live tracking
}

// Enhanced live prices for banner with faster updates
export function useFastLivePrices() {
  return useQuery<Crypto[]>({
    queryKey: ["/api/coins/live"],
    queryFn: () => CryptoAPI.getCoins(1, 10),
    refetchInterval: 1000, // Refetch every 1 second for live banner
    staleTime: 0, // Always consider data stale for instant updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
