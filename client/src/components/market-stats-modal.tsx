import { useState } from "react";
import { TrendingUp, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GlassCard } from "./glass-card";
import { useGlobalStats } from "@/hooks/use-crypto-data";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/api";

interface MarketStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'market-cap' | 'volume';
}

export function MarketStatsModal({ isOpen, onClose, type }: MarketStatsModalProps) {
  const { data: globalStats, isLoading } = useGlobalStats();

  if (!isOpen) return null;

  const isMarketCap = type === 'market-cap';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card border-gray-700" data-testid="market-stats-modal">
        <DialogDescription className="sr-only">
          Detailed information about global {isMarketCap ? 'market capitalization' : 'trading volume'} statistics.
        </DialogDescription>
        
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold flex items-center">
            {isMarketCap ? (
              <TrendingUp className="text-accent-blue mr-2" />
            ) : (
              <BarChart3 className="text-accent-green mr-2" />
            )}
            {isMarketCap ? 'Global Market Capitalization' : 'Global Trading Volume'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            data-testid="modal-close-button"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="glass-card p-4 rounded-lg">
                  <div className="w-32 h-4 skeleton rounded mb-2"></div>
                  <div className="w-24 h-6 skeleton rounded"></div>
                </div>
              ))}
            </div>
          ) : globalStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isMarketCap ? (
                <>
                  <GlassCard className="p-4">
                    <div className="text-sm text-gray-400 mb-1">Total Market Cap</div>
                    <div className="text-2xl font-bold text-accent-blue">
                      {formatCurrency(globalStats.totalMarketCap)}
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <div className="text-sm text-gray-400 mb-1">24h Change</div>
                    <div className={`text-2xl font-bold ${globalStats.marketCapChange24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercentage(globalStats.marketCapChange24h)}
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <div className="text-sm text-gray-400 mb-1">Active Cryptocurrencies</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {formatNumber(globalStats.activeCryptos)}
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <div className="text-sm text-gray-400 mb-1">Market Dominance</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bitcoin</span>
                        <span className="font-semibold">~40%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ethereum</span>
                        <span className="font-semibold">~15%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Others</span>
                        <span className="font-semibold">~45%</span>
                      </div>
                    </div>
                  </GlassCard>
                </>
              ) : (
                <>
                  <GlassCard className="p-4">
                    <div className="text-sm text-gray-400 mb-1">Total Volume 24h</div>
                    <div className="text-2xl font-bold text-accent-green">
                      {formatCurrency(globalStats.totalVolume)}
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <div className="text-sm text-gray-400 mb-1">Volume Change 24h</div>
                    <div className={`text-2xl font-bold ${globalStats.volumeChange24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercentage(globalStats.volumeChange24h)}
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4 md:col-span-2">
                    <div className="text-sm text-gray-400 mb-3">Volume Distribution</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Spot Trading</span>
                        <span className="text-sm font-semibold">~65%</span>
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden ml-2">
                          <div className="w-3/5 h-full bg-accent-green rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Derivatives</span>
                        <span className="text-sm font-semibold">~35%</span>
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden ml-2">
                          <div className="w-1/3 h-full bg-accent-blue rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Failed to load market statistics
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}