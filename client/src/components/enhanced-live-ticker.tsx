import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Star, Eye, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./glass-card";
import { useLivePrices } from "@/hooks/use-crypto-data";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/api";
import { cn } from "@/lib/utils";

interface EnhancedLiveTickerProps {
  onCoinClick?: (coinId: string) => void;
}

interface PriceUpdate {
  coinId: string;
  newPrice: number;
  oldPrice: number;
  timestamp: number;
}

export function EnhancedLiveTicker({ onCoinClick }: EnhancedLiveTickerProps) {
  const { data: livePrices, isLoading, refetch } = useLivePrices();
  const { isInWatchlist, toggleWatchlist, watchlist } = useWatchlist();
  const { user } = useAuth();
  const [priceUpdates, setPriceUpdates] = useState<Map<string, PriceUpdate>>(new Map());
  const [animatingCoins, setAnimatingCoins] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced real-time price tracking with improved animations
  useEffect(() => {
    if (!livePrices) return;

    const timeouts: NodeJS.Timeout[] = [];

    livePrices.forEach((coin) => {
      const existingUpdate = priceUpdates.get(coin.id);
      if (existingUpdate && existingUpdate.newPrice !== coin.current_price) {
        const update: PriceUpdate = {
          coinId: coin.id,
          newPrice: coin.current_price,
          oldPrice: existingUpdate.newPrice,
          timestamp: Date.now(),
        };
        
        setPriceUpdates(prev => new Map(prev.set(coin.id, update)));
        setAnimatingCoins(prev => new Set(prev.add(coin.id)));
        
        // Remove animation after 2 seconds for better visibility
        const timeout = setTimeout(() => {
          setAnimatingCoins(prev => {
            const newSet = new Set(prev);
            newSet.delete(coin.id);
            return newSet;
          });
        }, 2000);
        
        timeouts.push(timeout);
      } else if (!existingUpdate) {
        setPriceUpdates(prev => new Map(prev.set(coin.id, {
          coinId: coin.id,
          newPrice: coin.current_price,
          oldPrice: coin.current_price,
          timestamp: Date.now(),
        })));
      }
    });

    // Cleanup function to clear all timeouts
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [livePrices]);

  const getPriceChangeIcon = (change: number, isAnimating: boolean) => {
    if (change > 0) {
      return (
        <TrendingUp 
          className={cn(
            "w-4 h-4 text-green-400",
            isAnimating && "animate-bounce"
          )} 
        />
      );
    } else if (change < 0) {
      return (
        <TrendingDown 
          className={cn(
            "w-4 h-4 text-red-400",
            isAnimating && "animate-bounce"
          )} 
        />
      );
    }
    return null;
  };

  const getPriceUpdateAnimation = (coinId: string) => {
    const update = priceUpdates.get(coinId);
    if (!update || !animatingCoins.has(coinId)) return "";
    
    const isIncrease = update.newPrice > update.oldPrice;
    return isIncrease 
      ? "ring-2 ring-green-400/50 shadow-lg shadow-green-400/30 bg-green-500/10 border-green-400/40" 
      : "ring-2 ring-red-400/50 shadow-lg shadow-red-400/30 bg-red-500/10 border-red-400/40";
  };

  // Filter coins to show only watchlist coins for logged-in users
  const coinsToShow = user && watchlist.length > 0 
    ? livePrices?.filter(coin => watchlist.includes(coin.id)) || []
    : livePrices?.slice(0, 12) || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return (
    <section className="py-8" data-testid="enhanced-live-ticker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center" data-testid="live-ticker-title">
              <Eye className="text-accent-blue mr-2" />
              {user && watchlist.length > 0 ? 'My Watchlist' : 'Live Price Tracker'}
            </h2>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-white hover:bg-white/10"
                data-testid="refresh-button"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
              <div className="text-sm text-gray-400">
                {user && watchlist.length > 0 ? `${watchlist.length} coins tracked` : 'Updates every second'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="live-ticker-grid">
            {isLoading ? (
              // Enhanced loading skeletons
              Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="glass-card rounded-lg p-4 border hover-glow"
                  data-testid={`live-ticker-skeleton-${index}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full skeleton"></div>
                      <div>
                        <div className="w-16 h-4 skeleton rounded mb-1"></div>
                        <div className="w-12 h-3 skeleton rounded"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 skeleton rounded"></div>
                      <div className="w-6 h-6 skeleton rounded"></div>
                    </div>
                  </div>
                  <div>
                    <div className="w-24 h-7 skeleton rounded mb-2"></div>
                    <div className="w-16 h-4 skeleton rounded mb-1"></div>
                    <div className="w-20 h-3 skeleton rounded"></div>
                  </div>
                </div>
              ))
            ) : coinsToShow.length > 0 ? (
              coinsToShow.map((coin) => {
                const isAnimating = animatingCoins.has(coin.id);
                const priceChangeIcon = getPriceChangeIcon(coin.price_change_percentage_24h, isAnimating);
                
                return (
                  <div
                    key={coin.id}
                    className={cn(
                      "coin-card-enhanced glass-card rounded-lg p-4 cursor-pointer transition-all duration-500 border",
                      getPriceUpdateAnimation(coin.id),
                      "group relative overflow-hidden"
                    )}
                    onClick={() => onCoinClick?.(coin.id)}
                    data-testid={`live-ticker-coin-${coin.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-10 h-10 rounded-full"
                          data-testid={`live-ticker-coin-image-${coin.id}`}
                        />
                        <div>
                          <p className="font-medium text-sm" data-testid={`live-ticker-coin-name-${coin.id}`}>
                            {coin.name}
                          </p>
                          <p className="text-xs text-gray-400 uppercase" data-testid={`live-ticker-coin-symbol-${coin.id}`}>
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-6 h-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(coin.id);
                          }}
                          data-testid={`watchlist-toggle-${coin.id}`}
                        >
                          <Star
                            className={cn(
                              "w-4 h-4",
                              isInWatchlist(coin.id) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-400"
                            )}
                          />
                        </Button>
                        {priceChangeIcon}
                      </div>
                    </div>
                    
                    <div>
                      <p 
                        className={cn(
                          "text-xl font-bold mb-1 transition-all duration-500",
                          isAnimating && coin.price_change_percentage_24h > 0 && "text-green-400 scale-105",
                          isAnimating && coin.price_change_percentage_24h < 0 && "text-red-400 scale-105",
                          !isAnimating && "group-hover:text-accent-blue"
                        )}
                        data-testid={`live-ticker-coin-price-${coin.id}`}
                      >
                        {formatCurrency(coin.current_price)}
                      </p>
                      {/* Price range indicators */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-400">
                          <span className="text-green-400">H: {formatCurrency(coin.high_24h)}</span>
                          <span className="mx-1 text-gray-500">|</span>
                          <span className="text-red-400">L: {formatCurrency(coin.low_24h)}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-300">#{coin.market_cap_rank}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-sm font-medium transition-all duration-300",
                            coin.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400",
                            isAnimating && "animate-pulse font-bold"
                          )}
                          data-testid={`live-ticker-coin-change-${coin.id}`}
                        >
                          {formatPercentage(coin.price_change_percentage_24h)}
                        </p>
                        <div className="text-xs text-gray-400 text-right">
                          <div>MCap: {formatCurrency(coin.market_cap)}</div>
                          <div>Vol: {formatCurrency(coin.total_volume)}</div>
                        </div>
                      </div>
                      
                      {/* Supply information */}
                      <div className="mt-2 pt-2 border-t border-gray-700/50">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Circulating:</span>
                          <span>{formatNumber(coin.circulating_supply)}</span>
                        </div>
                        {coin.max_supply && (
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Max Supply:</span>
                            <span>{formatNumber(coin.max_supply)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick action buttons */}
                    <div className="mt-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7 bg-primary-800/50 border-gray-600 hover:bg-accent-blue hover:border-accent-blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCoinClick?.(coin.id);
                        }}
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7 bg-primary-800/50 border-gray-600 hover:bg-green-500 hover:border-green-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Could trigger buy/trade action
                        }}
                      >
                        Trade
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : user && watchlist.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400" data-testid="live-ticker-no-watchlist">
                <div className="flex flex-col items-center space-y-4">
                  <Star className="w-12 h-12 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-300">No coins in your watchlist</h3>
                  <p className="text-sm max-w-md text-center">Add coins to your watchlist to track them here. Click the star icon on any coin to add it to your watchlist.</p>
                </div>
              </div>
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400" data-testid="live-ticker-no-data">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                  <p>Loading live price data...</p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}