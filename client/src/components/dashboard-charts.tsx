import { useState } from "react";
import { Calendar, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./glass-card";
import { LiquidChart } from "./liquid-chart";
import { useCoins } from "@/hooks/use-crypto-data";

const timeframes = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
];

export function DashboardCharts() {
  const [selectedTimeframe, setSelectedTimeframe] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const { data: coins } = useCoins();

  const topCoins = coins?.slice(0, 8) || [];

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-accent-blue" />
            <h2 className="text-xl font-semibold text-white">Market Charts</h2>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe.days}
                  variant={selectedTimeframe === timeframe.days ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe.days)}
                  className={`text-xs ${
                    selectedTimeframe === timeframe.days
                      ? "bg-accent-blue text-white"
                      : "text-gray-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {timeframe.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Coin Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {topCoins.map((coin) => (
            <Button
              key={coin.id}
              variant={selectedCoin === coin.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCoin(coin.id)}
              className={`flex items-center space-x-2 ${
                selectedCoin === coin.id
                  ? "bg-accent-blue/20 border-accent-blue text-accent-blue"
                  : "border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
              }`}
            >
              <img
                src={coin.image}
                alt={coin.name}
                className="w-4 h-4 rounded-full"
              />
              <span className="font-medium">{coin.symbol.toUpperCase()}</span>
              <div className="flex items-center space-x-1">
                {coin.price_change_percentage_24h > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                )}
                <span className={`text-xs ${
                  coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {Math.abs(coin.price_change_percentage_24h).toFixed(1)}%
                </span>
              </div>
            </Button>
          ))}
        </div>

        {/* Liquid Glass Chart */}
        <div className="mt-6">
          <LiquidChart
            coinId={selectedCoin}
            coinName={topCoins.find(coin => coin.id === selectedCoin)?.name || 'Cryptocurrency'}
            currentPrice={topCoins.find(coin => coin.id === selectedCoin)?.current_price || 0}
            priceChange24h={topCoins.find(coin => coin.id === selectedCoin)?.price_change_percentage_24h || 0}
          />
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Price Increase</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Price Decrease</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Current Price</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}