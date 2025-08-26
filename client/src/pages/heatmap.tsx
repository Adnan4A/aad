import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart3, Filter, ArrowUpDown, Home, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";
import { useCoins } from "@/hooks/use-crypto-data";
import { formatCurrency, formatPercentage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface HeatmapCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h: number;
  price_change_percentage_7d: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
}

export default function Heatmap() {
  const { data: coins, isLoading, refetch } = useCoins(1, 100);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('24h');
  const [sortBy, setSortBy] = useState('market_cap');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

  const timeFrames = [
    { key: '1h', label: '1 Hour' },
    { key: '24h', label: '24 Hours' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' }
  ];

  const getHeatmapColor = (change: number) => {
    if (change > 10) return 'bg-green-500';
    if (change > 5) return 'bg-green-400';
    if (change > 2) return 'bg-green-300';
    if (change > 0) return 'bg-green-200';
    if (change > -2) return 'bg-red-200';
    if (change > -5) return 'bg-red-300';
    if (change > -10) return 'bg-red-400';
    return 'bg-red-500';
  };

  const getPriceChangeByTimeFrame = (coin: any) => {
    switch (selectedTimeFrame) {
      case '1h':
        return coin.price_change_percentage_1h || 0;
      case '24h':
        return coin.price_change_percentage_24h || 0;
      case '7d':
        return coin.price_change_percentage_7d || 0;
      default:
        return coin.price_change_percentage_24h || 0;
    }
  };

  const getSortedCoins = () => {
    if (!coins) return [];
    
    let sortedCoins = [...coins];
    
    switch (sortBy) {
      case 'market_cap':
        sortedCoins.sort((a, b) => b.market_cap - a.market_cap);
        break;
      case 'volume':
        sortedCoins.sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
        break;
      case 'price':
        sortedCoins.sort((a, b) => b.current_price - a.current_price);
        break;
      case 'change':
        sortedCoins.sort((a, b) => getPriceChangeByTimeFrame(b) - getPriceChangeByTimeFrame(a));
        break;
      default:
        break;
    }
    
    return sortedCoins;
  };

  const getTextColor = (change: number) => {
    if (Math.abs(change) > 5) return 'text-white';
    return 'text-gray-900';
  };

  const getBoxSize = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio > 0.5) return 'w-32 h-24';
    if (ratio > 0.2) return 'w-28 h-20';
    if (ratio > 0.1) return 'w-24 h-16';
    if (ratio > 0.05) return 'w-20 h-14';
    return 'w-16 h-12';
  };

  const sortedCoins = getSortedCoins();
  const maxValue = sortedCoins.length > 0 ? (() => {
    switch (sortBy) {
      case 'market_cap':
        return Math.max(...sortedCoins.map(c => c.market_cap));
      case 'volume':
        return Math.max(...sortedCoins.map(c => c.total_volume || 0));
      case 'price':
        return Math.max(...sortedCoins.map(c => c.current_price));
      default:
        return Math.max(...sortedCoins.map(c => c.market_cap));
    }
  })() : 0;

  return (
    <div className="min-h-screen gradient-bg pt-16" data-testid="heatmap-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">
              Market Heatmap
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  refetch();
                  setLastUpdate(new Date());
                }}
                className="flex items-center space-x-2 text-white hover:bg-white/10"
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-600 text-white hover:bg-white/10">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-300 text-lg">
              Visualize cryptocurrency market performance at a glance
            </p>
            <div className="text-sm text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Controls */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Time Frame:</span>
              </div>
              <div className="flex space-x-2">
                {timeFrames.map((frame) => (
                  <Button
                    key={frame.key}
                    variant={selectedTimeFrame === frame.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTimeFrame(frame.key)}
                    className={cn(
                      "text-xs",
                      selectedTimeFrame === frame.key 
                        ? "bg-accent-blue text-white" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {frame.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Size by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-primary-800 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-accent-blue"
              >
                <option value="market_cap">Market Cap</option>
                <option value="volume">Volume</option>
                <option value="price">Price</option>
                <option value="change">Price Change</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Legend */}
        <GlassCard className="p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Performance:</span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-400">-10%+</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-red-300 rounded"></div>
                  <span className="text-xs text-gray-400">-5%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span className="text-xs text-gray-400">0%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-green-200 rounded"></div>
                  <span className="text-xs text-gray-400">0%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-green-300 rounded"></div>
                  <span className="text-xs text-gray-400">+5%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-400">+10%+</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Size represents market capitalization
            </div>
          </div>
        </GlassCard>

        {/* Heatmap */}
        <GlassCard className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {sortedCoins.slice(0, 100).map((coin) => {
                const priceChange = getPriceChangeByTimeFrame(coin);
                const sizeValue = sortBy === 'market_cap' ? coin.market_cap 
                                : sortBy === 'volume' ? (coin.total_volume || 0)
                                : sortBy === 'price' ? coin.current_price
                                : coin.market_cap;
                
                return (
                  <div
                    key={coin.id}
                    className={cn(
                      "rounded-lg p-3 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg flex flex-col justify-between",
                      getHeatmapColor(priceChange),
                      getBoxSize(sizeValue, maxValue),
                      getTextColor(priceChange)
                    )}
                    data-testid={`heatmap-coin-${coin.id}`}
                  >
                    <div>
                      <div className="font-bold text-xs uppercase truncate">
                        {coin.symbol}
                      </div>
                      <div className="text-xs truncate opacity-80">
                        #{coin.market_cap_rank}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-semibold">
                        {formatCurrency(coin.current_price)}
                      </div>
                      <div className="text-xs font-bold">
                        {formatPercentage(priceChange)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Market Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <GlassCard className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
              <span className="text-lg font-bold text-green-400">
                {sortedCoins.filter(c => getPriceChangeByTimeFrame(c) > 0).length || 0}
              </span>
            </div>
            <div className="text-sm text-gray-400">Gainers ({selectedTimeFrame})</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="w-6 h-6 text-red-400 mr-2" />
              <span className="text-lg font-bold text-red-400">
                {sortedCoins.filter(c => getPriceChangeByTimeFrame(c) < 0).length || 0}
              </span>
            </div>
            <div className="text-sm text-gray-400">Losers ({selectedTimeFrame})</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6 text-accent-blue mr-2" />
              <span className="text-lg font-bold text-accent-blue">
                {sortedCoins.length || 0}
              </span>
            </div>
            <div className="text-sm text-gray-400">Total Coins</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}