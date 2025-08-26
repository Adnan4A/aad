import { Zap, Star } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { useLivePrices } from "@/hooks/use-crypto-data";
import { useWatchlist } from "@/hooks/use-watchlist";
import { formatCurrency, formatPercentage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LiveTickerProps {
  onCoinClick?: (coinId: string) => void;
}

export function LiveTicker({ onCoinClick }: LiveTickerProps) {
  const { data: livePrices, isLoading } = useLivePrices();
  const { watchlist, toggleWatchlist } = useWatchlist();
  
  const isInWatchlist = (id: string) => watchlist.includes(id);

  return (
    <section className="py-8" data-testid="live-ticker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center" data-testid="live-ticker-title">
            <Zap className="text-accent-yellow mr-2" />
            Live Price Tracker
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="live-ticker-grid">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="glass-card rounded-lg p-4"
                  data-testid={`live-ticker-skeleton-${index}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-full skeleton"></div>
                    <div className="w-8 h-3 skeleton rounded"></div>
                  </div>
                  <div>
                    <div className="w-16 h-4 skeleton rounded mb-1"></div>
                    <div className="w-20 h-5 skeleton rounded mb-1"></div>
                    <div className="w-12 h-3 skeleton rounded"></div>
                  </div>
                </div>
              ))
            ) : livePrices && livePrices.length > 0 ? (
              livePrices.map((coin) => (
                <div
                  key={coin.id}
                  className="glass-card rounded-lg p-4 hover-glow cursor-pointer"
                  onClick={() => onCoinClick?.(coin.id)}
                  data-testid={`live-ticker-coin-${coin.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="crypto-icon"
                      data-testid={`live-ticker-coin-image-${coin.id}`}
                    />
                    <div className="flex items-center space-x-2">
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
                      <span className="text-xs font-medium text-gray-400 uppercase" data-testid={`live-ticker-coin-symbol-${coin.id}`}>
                        {coin.symbol}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-1" data-testid={`live-ticker-coin-name-${coin.id}`}>
                      {coin.name}
                    </p>
                    <p className="text-lg font-bold mb-1" data-testid={`live-ticker-coin-price-${coin.id}`}>
                      {formatCurrency(coin.current_price)}
                    </p>
                    <p
                      className={`text-sm ${coin.price_change_percentage_24h > 0 ? "price-up" : "price-down"}`}
                      data-testid={`live-ticker-coin-change-${coin.id}`}
                    >
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400" data-testid="live-ticker-no-data">
                No live price data available
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
