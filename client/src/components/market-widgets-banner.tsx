import { useGlobalStats } from '@/hooks/use-crypto-data';
import { useQuery } from '@tanstack/react-query';

export function MarketWidgetsBanner() {
  const { data: globalStats } = useGlobalStats();
  
  // Alt Season Index
  const { data: altSeasonData } = useQuery({
    queryKey: ['/api/alt-season-index'],
    queryFn: () => fetch('/api/alt-season-index').then(res => res.json()),
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 20000, // Consider stale after 20 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fear & Greed Index
  const { data: fearGreedData } = useQuery({
    queryKey: ['/api/fear-greed-index'],
    queryFn: () => fetch('/api/fear-greed-index').then(res => res.json()),
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 20000, // Consider stale after 20 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Market Hours
  const { data: marketHoursData } = useQuery({
    queryKey: ['/api/market-hours'],
    queryFn: () => fetch('/api/market-hours').then(res => res.json()),
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 20000, // Consider stale after 20 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (!globalStats) {
    return (
      <div className="w-full liquid-bg border-b border-white/10 z-40 relative">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-center items-center">
            <div className="animate-pulse text-white/50 text-xs">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="w-full liquid-bg border-b border-white/10 z-40 relative -mb-1" data-testid="market-widgets-banner">
      <div className="w-full px-4 py-2">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-xs">
          {/* Market Cap */}
          <div className="flex items-center space-x-1 text-white">
            <span className="text-gray-400">Market Cap:</span>
            <span className="font-semibold">{globalStats ? formatCurrency(globalStats.totalMarketCap) : '$0'}</span>
            <span className={`${(globalStats?.marketCapChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(globalStats?.marketCapChange24h || 0)}
            </span>
          </div>

          {/* 24h Volume */}
          <div className="flex items-center space-x-1 text-white">
            <span className="text-gray-400">Volume:</span>
            <span className="font-semibold">{globalStats ? formatCurrency(globalStats.totalVolume) : '$0'}</span>
          </div>

          {/* BTC Dominance */}
          <div className="flex items-center space-x-1 text-white">
            <span className="text-gray-400">BTC:</span>
            <span className="font-semibold">{(globalStats?.btcDominance || 0).toFixed(1)}%</span>
          </div>

          {/* ETH Dominance */}
          <div className="flex items-center space-x-1 text-white">
            <span className="text-gray-400">ETH:</span>
            <span className="font-semibold">{(globalStats?.ethDominance || 0).toFixed(1)}%</span>
          </div>

          {/* Active Cryptos */}
          <div className="flex items-center space-x-1 text-white">
            <span className="text-gray-400">Coins:</span>
            <span className="font-semibold">{(globalStats?.activeCryptos || 0).toLocaleString()}</span>
          </div>

          {/* Alt Season Index */}
          {altSeasonData && typeof altSeasonData === 'object' && 'value' in altSeasonData && (
            <div className="flex items-center space-x-1 text-white">
              <span className="text-gray-400">Alt Season:</span>
              <span className="font-semibold">{(altSeasonData as { value: number }).value}</span>
              <span className="text-xs text-gray-300">({(altSeasonData as { status: string }).status})</span>
            </div>
          )}

          {/* Fear & Greed Index */}
          {fearGreedData && typeof fearGreedData === 'object' && 'value' in fearGreedData && (
            <div className="flex items-center space-x-1 text-white">
              <span className="text-gray-400">F&G:</span>
              <span className="font-semibold">{(fearGreedData as { value: number }).value}</span>
              <span className="text-xs text-gray-300">({(fearGreedData as { status: string }).status})</span>
            </div>
          )}

          {/* Market Hours - Only show first 3 markets with compact display */}
          {marketHoursData && marketHoursData.markets && (
            <div className="flex items-center space-x-2 text-white border-l border-white/20 pl-4">
              <span className="text-gray-400 hidden sm:inline">Markets:</span>
              <div className="flex items-center space-x-2">
                {marketHoursData.markets.slice(0, 3).map((market: any, index: number) => (
                  <div key={market.name} className="flex items-center space-x-1">
                    <span className="text-sm">{market.flag}</span>
                    <span className="text-xs font-medium">{market.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${market.is_open ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    {index < 2 && <span className="text-gray-500 mx-1">•</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}