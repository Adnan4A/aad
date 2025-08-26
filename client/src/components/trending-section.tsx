import { useState } from "react";
import { useCoins } from "@/hooks/use-crypto-data";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/api";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";

interface TrendingSectionProps {
  onCoinClick: (coinId: string) => void;
}

export function TrendingSection({ onCoinClick }: TrendingSectionProps) {
  const [activeTab, setActiveTab] = useState<'trending' | 'gainers' | 'losers'>('trending');
  const [currentPage, setCurrentPage] = useState(0);
  const { data: coins, isLoading, error } = useCoins();
  const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();
  
  const ITEMS_PER_PAGE = 6;

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-8 skeleton rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 border border-gray-700 rounded-lg space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 skeleton rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-20 h-4 skeleton rounded"></div>
                    <div className="w-16 h-3 skeleton rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-24 h-5 skeleton rounded"></div>
                  <div className="w-16 h-4 skeleton rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error || !coins) {
    return (
      <GlassCard className="p-6">
        <div className="text-center text-gray-400">
          <p>Unable to load trending data</p>
        </div>
      </GlassCard>
    );
  }

  const getAllTrendingCoins = () => {
    switch (activeTab) {
      case 'trending':
        // Sort by volume and market cap for trending
        return [...coins]
          .sort((a, b) => (b.total_volume * (1/b.market_cap_rank || 1)) - (a.total_volume * (1/a.market_cap_rank || 1)));
      case 'gainers':
        return [...coins]
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      case 'losers':
        return [...coins]
          .filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
      default:
        return coins;
    }
  };

  const allTrendingCoins = getAllTrendingCoins();
  const totalPages = Math.ceil(allTrendingCoins.length / ITEMS_PER_PAGE);
  const trendingCoins = allTrendingCoins.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab: 'trending' | 'gainers' | 'losers') => {
    setActiveTab(tab);
    setCurrentPage(0); // Reset to first page when changing tabs
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Enhanced pagination logic
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <section className="py-8 lg:py-12" data-testid="trending-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
          {/* Enhanced Header */}
          <div className="p-6 lg:p-8 border-b border-white/10">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Market Highlights
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Discover trending cryptocurrencies, top performers, and market movers in real-time
                </p>
              </div>
              
              {/* Enhanced Tab Navigation */}
              <div className="flex justify-center pt-4">
                <div className="glass-card bg-white/5 border border-white/20 rounded-2xl p-1.5 backdrop-blur-[25px]">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('trending')}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all duration-300 relative overflow-hidden",
                        activeTab === 'trending'
                          ? "bg-gradient-to-r from-accent-blue to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      )}
                      data-testid="trending-tab"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <span>🔥</span>
                        <span>Trending</span>
                      </span>
                      {activeTab === 'trending' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('gainers')}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all duration-300 relative overflow-hidden",
                        activeTab === 'gainers'
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 transform scale-105"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      )}
                      data-testid="gainers-tab"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Top Gainers</span>
                      </span>
                      {activeTab === 'gainers' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 animate-pulse" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('losers')}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all duration-300 relative overflow-hidden",
                        activeTab === 'losers'
                          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 transform scale-105"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      )}
                      data-testid="losers-tab"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <TrendingDown className="w-4 h-4" />
                        <span>Top Losers</span>
                      </span>
                      {activeTab === 'losers' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 animate-pulse" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Coins Grid */}
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {trendingCoins.map((coin, index) => (
                <div
                  key={coin.id}
                  className="group relative glass-card bg-white/5 backdrop-blur-[25px] border border-white/20 rounded-2xl p-5 lg:p-6 hover:border-accent-blue/40 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-blue/20 overflow-hidden"
                  onClick={() => onCoinClick(coin.id)}
                  data-testid={`trending-coin-${coin.id}`}
                >
                  {/* Rank indicator */}
                  <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-r from-accent-blue to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg z-10">
                    {currentPage * ITEMS_PER_PAGE + index + 1}
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-12 h-12 lg:w-14 lg:h-14 rounded-full ring-2 ring-white/10 group-hover:ring-accent-blue/30 transition-all duration-300"
                          data-testid={`trending-coin-image-${coin.id}`}
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base lg:text-lg truncate group-hover:text-accent-blue transition-colors duration-300" data-testid={`trending-coin-name-${coin.id}`}>
                          {coin.name}
                        </h3>
                        <p className="text-sm text-gray-400 uppercase font-medium" data-testid={`trending-coin-symbol-${coin.id}`}>
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-9 h-9 p-0 rounded-full hover:bg-white/10 transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(coin.id);
                      }}
                      data-testid={`trending-watchlist-${coin.id}`}
                    >
                      <Star
                        className={cn(
                          "w-5 h-5 transition-all duration-300",
                          isInWatchlist(coin.id) 
                            ? "fill-yellow-400 text-yellow-400 scale-110" 
                            : "text-gray-400 hover:text-yellow-400 hover:scale-110"
                        )}
                      />
                    </Button>
                  </div>

                  {/* Price and Change */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl lg:text-2xl font-bold text-white group-hover:text-accent-blue transition-colors duration-300" data-testid={`trending-coin-price-${coin.id}`}>
                        {formatCurrency(coin.current_price)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-3 py-1 text-sm font-medium border-2 transition-all duration-300",
                          coin.price_change_percentage_24h >= 0
                            ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/40 shadow-green-500/20"
                            : "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border-red-500/40 shadow-red-500/20"
                        )}
                        data-testid={`trending-coin-change-${coin.id}`}
                      >
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </Badge>
                    </div>
                    
                    {/* Market Stats */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Market Cap</span>
                        <span className="text-sm font-semibold text-gray-200" data-testid={`trending-coin-mcap-${coin.id}`}>
                          {formatCurrency(coin.market_cap)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Volume 24h</span>
                        <span className="text-sm font-semibold text-gray-200" data-testid={`trending-coin-volume-${coin.id}`}>
                          {formatCurrency(coin.total_volume)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Rank</span>
                        <span className="text-sm font-semibold text-gray-200">
                          #{coin.market_cap_rank}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent-blue/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Professional Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-white/10 pt-8">
                <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                  {/* Info */}
                  <div className="text-sm text-gray-400 flex items-center space-x-2">
                    <span>Showing</span>
                    <span className="font-semibold text-white">
                      {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, allTrendingCoins.length)}
                    </span>
                    <span>of</span>
                    <span className="font-semibold text-white">{allTrendingCoins.length}</span>
                    <span>results</span>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex items-center space-x-2">
                    {/* First Page */}
                    {currentPage > 2 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(0)}
                          className="glass-card bg-white/5 border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          First
                        </Button>
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </>
                    )}

                    {/* Previous */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 0}
                      className="glass-card bg-white/5 border-white/20 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
                      data-testid="trending-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {getVisiblePages().map((page, i) => (
                        <div key={i}>
                          {page === '...' ? (
                            <div className="px-3 py-2 text-gray-500">...</div>
                          ) : (
                            <Button
                              variant={currentPage === (page as number) - 1 ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage((page as number) - 1)}
                              className={cn(
                                "w-10 h-10 p-0 transition-all duration-300",
                                currentPage === (page as number) - 1
                                  ? "bg-gradient-to-r from-accent-blue to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-110"
                                  : "glass-card bg-white/5 border-white/20 text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105"
                              )}
                              data-testid={`trending-page-${page}`}
                            >
                              {page}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Next */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage === totalPages - 1}
                      className="glass-card bg-white/5 border-white/20 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
                      data-testid="trending-next-page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    {/* Last Page */}
                    {currentPage < totalPages - 3 && (
                      <>
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages - 1)}
                          className="glass-card bg-white/5 border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}