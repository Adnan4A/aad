import { useState } from "react";
import { Globe, TrendingUp, TrendingDown, DollarSign, Users, Activity, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";
import { useGlobalStats, useCoins } from "@/hooks/use-crypto-data";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function GlobalInsights() {
  const { data: globalStats, isLoading: statsLoading } = useGlobalStats();
  const { data: coins, isLoading: coinsLoading } = useCoins(1, 100);
  const [selectedMetric, setSelectedMetric] = useState('market_cap');

  const metrics = [
    { key: 'market_cap', label: 'Market Cap', icon: DollarSign },
    { key: 'volume', label: 'Volume', icon: Activity },
    { key: 'change', label: '24h Change', icon: TrendingUp },
  ];

  const getMarketSentiment = () => {
    if (!coins) return { sentiment: 'neutral', score: 50 };
    
    const gainers = coins.filter(c => c.price_change_percentage_24h > 0).length;
    const losers = coins.filter(c => c.price_change_percentage_24h < 0).length;
    const total = coins.length;
    
    const bullishPercent = (gainers / total) * 100;
    
    if (bullishPercent > 60) return { sentiment: 'bullish', score: Math.round(bullishPercent) };
    if (bullishPercent < 40) return { sentiment: 'bearish', score: Math.round(bullishPercent) };
    return { sentiment: 'neutral', score: Math.round(bullishPercent) };
  };

  const marketSentiment = getMarketSentiment();

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-green-400/20 border-green-400/30';
      case 'bearish': return 'bg-red-400/20 border-red-400/30';
      default: return 'bg-yellow-400/20 border-yellow-400/30';
    }
  };

  return (
    <div className="min-h-screen gradient-bg pt-16" data-testid="global-insights-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">
              Global Market Insights
            </h1>
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-600 text-white hover:bg-white/10">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
          <p className="text-gray-300 text-lg">
            Comprehensive overview of the global cryptocurrency market
          </p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-accent-blue to-purple-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total Market Cap</div>
                {statsLoading ? (
                  <div className="w-20 h-6 skeleton rounded"></div>
                ) : (
                  <div className="text-xl font-bold text-white">
                    {globalStats ? formatCurrency(globalStats.totalMarketCap) : 'N/A'}
                  </div>
                )}
              </div>
            </div>
            {!statsLoading && globalStats && (
              <div className="flex items-center">
                <div className={cn(
                  "text-sm font-semibold",
                  globalStats.marketCapChange24h > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatPercentage(globalStats.marketCapChange24h)} (24h)
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-accent-green to-yellow-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">24h Volume</div>
                {statsLoading ? (
                  <div className="w-20 h-6 skeleton rounded"></div>
                ) : (
                  <div className="text-xl font-bold text-white">
                    {globalStats ? formatCurrency(globalStats.totalVolume) : 'N/A'}
                  </div>
                )}
              </div>
            </div>
            {!statsLoading && globalStats && (
              <div className="flex items-center">
                <div className={cn(
                  "text-sm font-semibold",
                  globalStats.volumeChange24h > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatPercentage(globalStats.volumeChange24h)} (24h)
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Active Coins</div>
                {statsLoading ? (
                  <div className="w-20 h-6 skeleton rounded"></div>
                ) : (
                  <div className="text-xl font-bold text-white">
                    {globalStats ? formatNumber(globalStats.activeCryptos) : 'N/A'}
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-400">Tracked globally</div>
          </GlassCard>

          <GlassCard className={cn("p-6 border", getSentimentBg(marketSentiment.sentiment))}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Market Sentiment</div>
                <div className={cn("text-xl font-bold capitalize", getSentimentColor(marketSentiment.sentiment))}>
                  {marketSentiment.sentiment}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {marketSentiment.score}% bullish signals
            </div>
          </GlassCard>
        </div>

        {/* Market Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Gainers */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
              Top Gainers (24h)
            </h3>
            {coinsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full skeleton"></div>
                      <div className="w-20 h-4 skeleton rounded"></div>
                    </div>
                    <div className="w-16 h-4 skeleton rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {coins?.filter(c => c.price_change_percentage_24h > 0)
                  .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                  .slice(0, 5)
                  .map((coin) => (
                    <div key={coin.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                      <div className="flex items-center space-x-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-semibold text-white">{coin.symbol.toUpperCase()}</div>
                          <div className="text-sm text-gray-400">{coin.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-400">
                          {formatPercentage(coin.price_change_percentage_24h)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatCurrency(coin.current_price)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </GlassCard>

          {/* Top Losers */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 text-red-400 mr-2" />
              Top Losers (24h)
            </h3>
            {coinsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full skeleton"></div>
                      <div className="w-20 h-4 skeleton rounded"></div>
                    </div>
                    <div className="w-16 h-4 skeleton rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {coins?.filter(c => c.price_change_percentage_24h < 0)
                  .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
                  .slice(0, 5)
                  .map((coin) => (
                    <div key={coin.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                      <div className="flex items-center space-x-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-semibold text-white">{coin.symbol.toUpperCase()}</div>
                          <div className="text-sm text-gray-400">{coin.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-400">
                          {formatPercentage(coin.price_change_percentage_24h)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatCurrency(coin.current_price)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Market Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <Activity className="w-5 h-5 text-accent-blue mr-2" />
            Market Cap Distribution
          </h3>
          {coinsLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {coins?.slice(0, 10).map((coin, index) => {
                const percentage = (coin.market_cap / (globalStats?.totalMarketCap || 1)) * 100;
                return (
                  <div key={coin.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-400">#{index + 1}</span>
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <span className="font-semibold text-white">{coin.name}</span>
                        <span className="text-sm text-gray-400">({coin.symbol.toUpperCase()})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">{percentage.toFixed(2)}%</div>
                        <div className="text-xs text-gray-400">{formatCurrency(coin.market_cap)}</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-blue to-accent-green h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}