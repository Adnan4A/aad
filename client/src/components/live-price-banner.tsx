import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Star, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLivePrices } from "@/hooks/use-crypto-data";
import { useWatchlist } from "@/hooks/use-watchlist";
import { formatCurrency, formatPercentage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LivePriceBannerProps {
  onCoinClick?: (coinId: string) => void;
}

export function LivePriceBanner({ onCoinClick }: LivePriceBannerProps) {
  const { data: livePrices, isLoading, refetch } = useLivePrices();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatingPrices, setAnimatingPrices] = useState<Set<string>>(new Set());

  // Update current time and refresh data every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      refetch(); // Refresh data every second
    }, 1000);
    return () => clearInterval(timer);
  }, [refetch]);

  // Enhanced price change tracking with better animation logic
  const [previousPrices, setPreviousPrices] = useState<Map<string, number>>(new Map());
  
  useEffect(() => {
    if (!livePrices) return;
    
    const newAnimations = new Set<string>();
    const currentPrices = new Map<string, number>();
    
    livePrices.forEach((coin) => {
      const prevPrice = previousPrices.get(coin.id);
      currentPrices.set(coin.id, coin.current_price);
      
      // Only animate if price actually changed
      if (prevPrice !== undefined && prevPrice !== coin.current_price) {
        newAnimations.add(coin.id);
      }
    });
    
    setPreviousPrices(currentPrices);
    setAnimatingPrices(newAnimations);
    
    // Clear animations after 1.5 seconds
    if (newAnimations.size > 0) {
      const timer = setTimeout(() => {
        setAnimatingPrices(new Set());
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [livePrices?.map(coin => `${coin.id}:${coin.current_price}`).join('|')]);

  const getPriceChangeIcon = (change: number, isAnimating: boolean) => {
    if (change > 0) {
      return (
        <TrendingUp 
          className={cn(
            "w-3 h-3 text-green-400",
            isAnimating && "animate-bounce"
          )} 
        />
      );
    } else if (change < 0) {
      return (
        <TrendingDown 
          className={cn(
            "w-3 h-3 text-red-400",
            isAnimating && "animate-bounce"
          )} 
        />
      );
    }
    return null;
  };

  return (
    <div className="liquid-bg border-b border-white/10 sticky top-0 z-40 w-full -mt-1" data-testid="live-price-banner">
      <div className="w-full">
        <div className="flex items-center px-4 py-3">

          {/* Live prices - sliding animation */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center space-x-4 animate-slide">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-2 min-w-max">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full skeleton"></div>
                    <div className="w-12 sm:w-16 h-3 sm:h-4 skeleton rounded"></div>
                  </div>
                ))
              ) : livePrices && livePrices.length > 0 ? (
                [...livePrices.slice(0, 10), ...livePrices.slice(0, 10)].map((coin, index) => {
                  const isAnimating = animatingPrices.has(coin.id);
                  
                  return (
                    <div
                      key={`${coin.id}-${index}`}
                      className={cn(
                        "flex items-center space-x-2 min-w-max cursor-pointer group transition-all duration-500 hover:bg-white/10 rounded-lg px-2 py-1",
                        isAnimating && coin.price_change_percentage_24h > 0 && "bg-green-500/20 border border-green-400/30 shadow-lg shadow-green-400/20",
                        isAnimating && coin.price_change_percentage_24h < 0 && "bg-red-500/20 border border-red-400/30 shadow-lg shadow-red-400/20"
                      )}
                      onClick={() => onCoinClick?.(coin.id)}
                      data-testid={`banner-coin-${coin.id}-${index}`}
                    >
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-white/90 whitespace-nowrap">
                        {coin.symbol.toUpperCase()}
                      </span>
                      <span 
                        className={cn(
                          "text-xs sm:text-sm font-bold transition-all duration-500 whitespace-nowrap",
                          isAnimating && coin.price_change_percentage_24h > 0 && "text-green-400 scale-110 drop-shadow-lg",
                          isAnimating && coin.price_change_percentage_24h < 0 && "text-red-400 scale-110 drop-shadow-lg",
                          !isAnimating && "text-white"
                        )}
                      >
                        ${typeof coin.current_price === 'number' ? coin.current_price.toLocaleString('en-US', {
                          minimumFractionDigits: coin.current_price >= 1 ? 2 : 6,
                          maximumFractionDigits: coin.current_price >= 1 ? 2 : 6
                        }) : '0.00'}
                      </span>
                    </div>
                  );
                })
              ) : null}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}