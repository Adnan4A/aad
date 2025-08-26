import { useEffect, useRef } from "react";
import { ArrowLeft, Star, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GlassCard } from "./glass-card";
import { LiquidChart } from "./liquid-chart";
import { useCoinDetail, useHistoricalData } from "@/hooks/use-crypto-data";
import { formatCurrency, formatNumber, formatPercentage, calculateRSI } from "@/lib/api";

interface CoinModalProps {
  coinId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CoinModal({ coinId, isOpen, onClose }: CoinModalProps) {
  const { data: coinDetail, isLoading } = useCoinDetail(coinId);
  const { data: historicalData } = useHistoricalData(coinId, 30); // Get 30 days for RSI calculation
  const { watchlist, toggleWatchlist } = useWatchlist();
  
  const isInWatchlist = (id: string) => watchlist.includes(id);

  if (!coinId || !isOpen) return null;

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return "bg-red-500 text-white";
    if (rsi < 30) return "bg-green-500 text-white";
    return "bg-yellow-500 text-black";
  };

  // Calculate real RSI using historical price data
  const realRSI = historicalData ? calculateRSI(historicalData.prices.map(([_, price]) => price)) : 50;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-gray-700" data-testid="coin-modal">
        <DialogHeader className="sr-only">
          <DialogTitle>{coinDetail?.name || 'Cryptocurrency'} Details</DialogTitle>
          <DialogDescription>
            Detailed information about {coinDetail?.name || 'cryptocurrency'} including price charts, market data, and technical indicators.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full skeleton"></div>
                <div>
                  <div className="w-32 h-6 skeleton rounded mb-2"></div>
                  <div className="w-16 h-4 skeleton rounded"></div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                data-testid="close-modal"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card rounded-lg p-4">
                  <div className="w-20 h-4 skeleton rounded mb-2"></div>
                  <div className="w-24 h-6 skeleton rounded"></div>
                </div>
              ))}
            </div>
            
            <div className="h-64 skeleton rounded-lg"></div>
          </div>
        ) : coinDetail ? (
          <div className="p-6">
            <DialogHeader className="flex flex-row justify-between items-start mb-6">
              <DialogTitle asChild>
                <div className="flex items-center space-x-4">
                  <img
                    src={coinDetail.image.large}
                    alt={coinDetail.name}
                    className="w-12 h-12 rounded-full"
                    data-testid="modal-coin-image"
                  />
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="modal-coin-name">
                      {coinDetail.name}
                    </h2>
                    <p className="text-gray-400 uppercase text-sm" data-testid="modal-coin-symbol">
                      {coinDetail.symbol}
                    </p>
                  </div>
                </div>
              </DialogTitle>
              <div className="flex items-center space-x-2">
                {coinId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(coinId);
                    }}
                    data-testid={`modal-watchlist-toggle-${coinId}`}
                  >
                    <Star
                      className={cn(
                        "w-5 h-5",
                        isInWatchlist(coinId) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-400"
                      )}
                    />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                  data-testid="close-modal"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <GlassCard className="p-4">
                <p className="text-sm text-gray-400 mb-1">Current Price</p>
                <p className="text-2xl font-bold" data-testid="modal-current-price">
                  {formatCurrency(coinDetail.market_data.current_price.usd)}
                </p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                <p className="text-xl font-semibold" data-testid="modal-market-cap">
                  {formatCurrency(coinDetail.market_data.market_cap.usd)}
                </p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-sm text-gray-400 mb-1">24h Volume</p>
                <p className="text-xl font-semibold" data-testid="modal-volume">
                  {formatCurrency(coinDetail.market_data.total_volume.usd)}
                </p>
              </GlassCard>
            </div>

            {/* Liquid Glass Chart */}
            <div className="mb-6">
              <LiquidChart
                coinId={coinId}
                coinName={coinDetail.name}
                currentPrice={coinDetail.market_data.current_price.usd}
                priceChange24h={coinDetail.market_data.price_change_percentage_24h}
              />
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" data-testid="market-data-title">Market Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h High</span>
                    <span data-testid="modal-high-24h">
                      {formatCurrency(coinDetail.market_data.high_24h.usd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Low</span>
                    <span data-testid="modal-low-24h">
                      {formatCurrency(coinDetail.market_data.low_24h.usd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Circulating Supply</span>
                    <span data-testid="modal-circulating-supply">
                      {formatNumber(coinDetail.market_data.circulating_supply)} {coinDetail.symbol.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Supply</span>
                    <span data-testid="modal-total-supply">
                      {coinDetail.market_data.total_supply 
                        ? `${formatNumber(coinDetail.market_data.total_supply)} ${coinDetail.symbol.toUpperCase()}`
                        : "N/A"
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4" data-testid="technical-indicators-title">Technical Indicators</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">RSI (14)</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getRSIColor(realRSI)}`}
                      data-testid="modal-rsi"
                    >
                      {realRSI.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Rank</span>
                    <span data-testid="modal-rank">#{coinDetail.market_cap_rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">All Time High</span>
                    <span data-testid="modal-ath">
                      {formatCurrency(coinDetail.market_data.ath.usd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ATH Date</span>
                    <span data-testid="modal-ath-date">
                      {new Date(coinDetail.market_data.ath_date.usd).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-400" data-testid="modal-error">Failed to load coin details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
