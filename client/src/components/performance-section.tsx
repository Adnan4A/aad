import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { useTopPerformers, useUnderPerformers } from "@/hooks/use-crypto-data";
import { useWatchlist } from "@/hooks/use-watchlist";
import { formatCurrency, formatPercentage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Crypto } from "@shared/schema";

interface PerformanceCardProps {
  title: string;
  icon: React.ReactNode;
  coins: Crypto[] | undefined;
  isLoading: boolean;
  isPositive: boolean;
  onCoinClick?: (coinId: string) => void;
}

function PerformanceCard({
  title,
  icon,
  coins,
  isLoading,
  isPositive,
  onCoinClick,
}: PerformanceCardProps) {
  const { watchlist, toggleWatchlist } = useWatchlist();
  
  const isInWatchlist = (id: string) => watchlist.includes(id);
  return (
    <GlassCard className="p-6" data-testid={`performance-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center" data-testid={`performance-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {icon}
          {title}
        </h2>
        <span className="text-sm text-gray-400" data-testid={`performance-timeframe-${title.toLowerCase().replace(/\s+/g, '-')}`}>24h</span>
      </div>

      <div className="space-y-3" data-testid={`performance-list-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        {isLoading ? (
          // Enhanced loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 glass-card rounded-lg hover-glow"
              data-testid={`performance-skeleton-${index}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full skeleton"></div>
                <div>
                  <div className="w-16 h-4 skeleton rounded mb-1"></div>
                  <div className="w-12 h-3 skeleton rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-4 skeleton rounded mb-1"></div>
                <div className="w-12 h-3 skeleton rounded"></div>
              </div>
            </div>
          ))
        ) : coins && coins.length > 0 ? (
          coins.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center justify-between p-3 glass-card rounded-lg hover-glow cursor-pointer group transition-all duration-300"
              onClick={() => onCoinClick?.(coin.id)}
              data-testid={`performance-coin-${coin.id}`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full transition-transform duration-300 group-hover:scale-110"
                  data-testid={`performance-coin-image-${coin.id}`}
                />
                <div>
                  <p className="font-medium transition-colors duration-300 group-hover:text-accent-blue" data-testid={`performance-coin-name-${coin.id}`}>
                    {coin.name}
                  </p>
                  <p className="text-sm text-gray-400 uppercase" data-testid={`performance-coin-symbol-${coin.id}`}>
                    {coin.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold transition-colors duration-300 group-hover:text-accent-blue" data-testid={`performance-coin-price-${coin.id}`}>
                    {formatCurrency(coin.current_price)}
                  </p>
                  <p
                    className={`text-sm font-medium transition-all duration-300 ${
                      isPositive ? "price-up group-hover:text-green-300" : "price-down group-hover:text-red-300"
                    }`}
                    data-testid={`performance-coin-change-${coin.id}`}
                  >
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(coin.id);
                  }}
                  data-testid={`performance-watchlist-toggle-${coin.id}`}
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
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400" data-testid={`performance-no-data-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            No data available
          </div>
        )}
      </div>
    </GlassCard>
  );
}

interface PerformanceSectionProps {
  onCoinClick?: (coinId: string) => void;
}

export function PerformanceSection({ onCoinClick }: PerformanceSectionProps) {
  const {
    data: topPerformers,
    isLoading: loadingTop,
  } = useTopPerformers();
  
  const {
    data: underPerformers,
    isLoading: loadingUnder,
  } = useUnderPerformers();

  return (
    <section className="py-8" data-testid="performance-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PerformanceCard
            title="Top 10 Performers"
            icon={<TrendingUp className="text-accent-green mr-2" />}
            coins={topPerformers}
            isLoading={loadingTop}
            isPositive={true}
            onCoinClick={onCoinClick}
          />
          
          <PerformanceCard
            title="Underperformers"
            icon={<TrendingDown className="text-accent-red mr-2" />}
            coins={underPerformers}
            isLoading={loadingUnder}
            isPositive={false}
            onCoinClick={onCoinClick}
          />
        </div>
      </div>
    </section>
  );
}
