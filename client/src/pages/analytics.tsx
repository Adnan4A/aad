import { useState } from "react";
import { BarChart3, TrendingUp, Activity, Zap, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";
import { DashboardCharts } from "@/components/dashboard-charts";
import { LiquidChart } from "@/components/liquid-chart";
import { useCoins, useGlobalStats } from "@/hooks/use-crypto-data";
import { calculateRSI, formatCurrency, formatNumber } from "@/lib/api";
import type { RSIData } from "@/lib/types";

export default function Analytics() {
  const { data: coins, isLoading } = useCoins();
  const { data: globalStats } = useGlobalStats();

  // Calculate RSI data for top coins with safety checks
  const rsiData: RSIData[] = coins?.slice(0, 10).map(coin => {
    const rsi = coin?.current_price ? calculateRSI([coin.current_price]) : 50;
    let trend: RSIData['trend'] = 'neutral';
    
    if (rsi > 70) trend = 'overbought';
    else if (rsi < 30) trend = 'oversold';
    
    return {
      symbol: coin?.symbol?.toUpperCase() || 'N/A',
      name: coin?.name || 'Unknown',
      image: coin?.image || '',
      rsi,
      trend,
    };
  }).filter(Boolean) || [];

  const getRSIBarColor = (rsi: number) => {
    if (rsi > 70) return "bg-red-500";
    if (rsi < 30) return "bg-green-500";
    return "bg-yellow-500";
  };

  const getTrendColor = (trend: RSIData['trend']) => {
    switch (trend) {
      case 'overbought': return 'text-red-400';
      case 'oversold': return 'text-green-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen gradient-bg pt-16" data-testid="analytics-page">
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold" data-testid="analytics-title">
                Market Analytics
              </h1>
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-600 text-white hover:bg-white/10 ml-auto">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
            </div>
            <p className="text-gray-400" data-testid="analytics-subtitle">
              Advanced cryptocurrency market analysis and indicators
            </p>
          </div>

          {/* Interactive Chart Section */}
          <div className="mb-8">
            <DashboardCharts />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* RSI Indicators */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center" data-testid="rsi-indicators-title">
                <Activity className="text-accent-blue mr-2" />
                RSI Indicators
              </h2>
              
              <div className="space-y-4" data-testid="rsi-indicators-list">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 glass-card rounded-lg"
                      data-testid={`rsi-skeleton-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full skeleton"></div>
                        <div className="w-12 h-4 skeleton rounded"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-2 skeleton rounded"></div>
                        <div className="w-12 h-4 skeleton rounded"></div>
                      </div>
                    </div>
                  ))
                ) : rsiData.length > 0 ? (
                  rsiData.map((item) => (
                    <div
                      key={item.symbol}
                      className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-primary-700 transition-colors"
                      data-testid={`rsi-item-${item.symbol.toLowerCase()}`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-full"
                          data-testid={`rsi-image-${item.symbol.toLowerCase()}`}
                        />
                        <div>
                          <span className="font-medium" data-testid={`rsi-symbol-${item.symbol.toLowerCase()}`}>
                            {item.symbol}
                          </span>
                          <div className={`text-xs ${getTrendColor(item.trend)}`} data-testid={`rsi-trend-${item.symbol.toLowerCase()}`}>
                            {item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-700 rounded-full h-2" data-testid={`rsi-bar-${item.symbol.toLowerCase()}`}>
                          <div
                            className={`h-2 rounded-full ${getRSIBarColor(item.rsi)}`}
                            style={{ width: `${Math.min(item.rsi, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right" data-testid={`rsi-value-${item.symbol.toLowerCase()}`}>
                          {item.rsi.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400" data-testid="rsi-no-data">
                    No RSI data available
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Market Sentiment */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center" data-testid="market-sentiment-title">
                <TrendingUp className="text-accent-green mr-2" />
                Market Sentiment
              </h2>
              
              <div className="space-y-6" data-testid="market-sentiment-content">
                {/* Sentiment Distribution */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" data-testid="sentiment-distribution-title">
                    Sentiment Distribution
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Very Bullish", value: 15, color: "bg-green-500" },
                      { label: "Bullish", value: 25, color: "bg-green-400" },
                      { label: "Neutral", value: 30, color: "bg-yellow-500" },
                      { label: "Bearish", value: 20, color: "bg-orange-500" },
                      { label: "Very Bearish", value: 10, color: "bg-red-500" },
                    ].map((sentiment) => (
                      <div key={sentiment.label} className="flex items-center justify-between" data-testid={`sentiment-${sentiment.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        <span className="text-sm text-gray-300">{sentiment.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${sentiment.color}`}
                              style={{ width: `${sentiment.value}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{sentiment.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fear & Greed Index */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" data-testid="fear-greed-index-title">
                    Fear & Greed Index
                  </h3>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-green-500 mb-3">
                      <span className="text-2xl font-bold text-white">45</span>
                    </div>
                    <p className="text-sm text-yellow-400">Neutral</p>
                  </div>
                </div>

                {/* Market Overview with Real Data */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4" data-testid="market-overview-title">
                    Market Overview
                  </h3>
                  <div className="h-64">
                    <LiquidChart
                      coinId="bitcoin"
                      coinName="Bitcoin Market Overview"
                      currentPrice={coins?.[0]?.current_price || 0}
                      priceChange24h={coins?.[0]?.price_change_percentage_24h || 0}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Volume Analysis with Real Data */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center" data-testid="volume-analysis-title">
                <BarChart3 className="text-accent-blue mr-2" />
                Volume Analysis
              </h2>
              
              <div className="h-64">
                <LiquidChart
                  coinId="ethereum"
                  coinName="Ethereum Volume Analysis"
                  currentPrice={coins?.[1]?.current_price || 0}
                  priceChange24h={coins?.[1]?.price_change_percentage_24h || 0}
                />
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4" data-testid="volume-stats">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Global 24h Volume</p>
                  <p className="text-lg font-semibold" data-testid="avg-daily-volume">
                    {globalStats ? formatCurrency(globalStats.totalVolume) : '$0'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Volume Change</p>
                  <p className={`text-lg font-semibold ${(globalStats?.volumeChange24h || 0) > 0 ? 'text-green-400' : 'text-red-400'}`} data-testid="volume-change">
                    {globalStats?.volumeChange24h ? `${globalStats.volumeChange24h > 0 ? '+' : ''}${globalStats.volumeChange24h.toFixed(2)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Advanced Metrics */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center" data-testid="advanced-metrics-title">
                <Zap className="text-accent-yellow mr-2" />
                Advanced Metrics
              </h2>
              
              <div className="space-y-6" data-testid="advanced-metrics-content">
                {/* Market Dominance */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" data-testid="market-dominance-title">
                    Market Dominance
                  </h3>
                  <div className="space-y-3">
                    {coins?.slice(0, 3).map((coin, index) => {
                      const colors = ["bg-orange-500", "bg-blue-500", "bg-purple-500"];
                      const dominance = (coin.market_cap / (globalStats?.totalMarketCap || 1)) * 100;
                      return {
                        name: coin.name,
                        symbol: coin.symbol.toUpperCase(),
                        dominance: Number(dominance.toFixed(1)),
                        color: colors[index] || "bg-gray-500"
                      };
                    }).map((coin) => (
                      <div key={coin.symbol} className="flex items-center justify-between" data-testid={`dominance-${coin.symbol.toLowerCase()}`}>
                        <span className="text-sm font-medium">{coin.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${coin.color}`}
                              style={{ width: `${coin.dominance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{coin.dominance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Indicators */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" data-testid="key-indicators-title">
                    Key Indicators
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 glass-card rounded-lg" data-testid="total-mcap-indicator">
                      <p className="text-xs text-gray-400 mb-1">Total MCap</p>
                      <p className="text-sm font-semibold">
                        {globalStats ? formatCurrency(globalStats.totalMarketCap) : '$0'}
                      </p>
                    </div>
                    <div className="text-center p-3 glass-card rounded-lg" data-testid="total-volume-indicator">
                      <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                      <p className="text-sm font-semibold">
                        {globalStats ? formatCurrency(globalStats.totalVolume) : '$0'}
                      </p>
                    </div>
                    <div className="text-center p-3 glass-card rounded-lg" data-testid="active-cryptos-indicator">
                      <p className="text-xs text-gray-400 mb-1">Active Cryptos</p>
                      <p className="text-sm font-semibold">
                        {globalStats ? globalStats.activeCryptos.toLocaleString() : '0'}
                      </p>
                    </div>
                    <div className="text-center p-3 glass-card rounded-lg" data-testid="btc-dominance-indicator">
                      <p className="text-xs text-gray-400 mb-1">BTC Dominance</p>
                      <p className="text-sm font-semibold">
                        {globalStats ? `${globalStats.btcDominance.toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}
