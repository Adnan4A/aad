import { useState, useEffect } from "react";
import { Clock, TrendingUp, Globe } from "lucide-react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface MarketStatus {
  name: string;
  timezone: string;
  is_open: boolean;
  next_bell: string;
  local_time: string;
  flag: string;
}

interface MarketHoursData {
  markets: MarketStatus[];
  timestamp: number;
}

export function MarketHoursWidget() {
  const [marketData, setMarketData] = useState<MarketHoursData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketHours = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/market-hours');
      if (!response.ok) {
        throw new Error('Failed to fetch market hours');
      }
      const data = await response.json();
      setMarketData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching market hours:', err);
      setError('Failed to load market hours');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketHours();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketHours, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !marketData) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-accent-blue" />
          <h3 className="text-sm font-semibold">Market Hours</h3>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-3 skeleton rounded"></div>
                <div className="w-12 h-3 skeleton rounded"></div>
              </div>
              <div className="w-6 h-6 skeleton rounded-full"></div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold">Market Hours</h3>
        </div>
        <p className="text-xs text-red-400">Unable to load market status</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4" data-testid="market-hours-widget">
      <div className="flex items-center space-x-2 mb-3">
        <Clock className="w-4 h-4 text-accent-blue" />
        <h3 className="text-sm font-semibold">Global Markets</h3>
        <Globe className="w-3 h-3 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        {marketData?.markets.slice(0, 3).map((market, index) => {
          const marketTime = new Date(market.local_time);
          const timeString = marketTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: market.timezone
          });

          return (
            <div
              key={market.name}
              className="flex items-center justify-between hover:bg-white/5 rounded-lg p-1 transition-all duration-200"
              data-testid={`market-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{market.flag}</span>
                <div>
                  <div className="text-xs font-medium text-white/90">
                    {market.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {timeString}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    market.is_open ? "bg-green-400 animate-pulse" : "bg-red-400"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    market.is_open ? "text-green-400" : "text-red-400"
                  )}
                >
                  {market.is_open ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {marketData && (
        <div className="mt-3 pt-2 border-t border-white/10">
          <div className="text-xs text-gray-400 text-center">
            Updated {new Date(marketData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </GlassCard>
  );
}