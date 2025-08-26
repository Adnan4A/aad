import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Star, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "./glass-card";
import { CoinModal } from "./coin-modal";
import { useCoins } from "@/hooks/use-crypto-data";
import { useWatchlist } from "@/hooks/use-watchlist";
import { formatCurrency, formatNumber, formatPercentage, calculateRSI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useActivityTracking } from "@/hooks/useActivityTracking";
// MiniChart removed for performance
import type { Crypto } from "@shared/schema";

type SortOption = "market_cap" | "price" | "volume" | "change";

const ITEMS_PER_PAGE = 20;

export default function EnhancedMarkets() {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("market_cap");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: coins, isLoading } = useCoins(1, 500); // Fetch more coins for pagination
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { trackCoinView } = useActivityTracking();

  const handleCoinClick = (coinId: string, coinName?: string) => {
    setSelectedCoinId(coinId);
    setIsModalOpen(true);
    
    // Track coin view automatically
    if (coinName) {
      trackCoinView(coinId, coinName);
    }
  };

  const closeModal = () => {
    setSelectedCoinId(null);
    setIsModalOpen(false);
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return "bg-red-500 text-white";
    if (rsi < 30) return "bg-green-500 text-white";
    return "bg-yellow-500 text-black";
  };

  // Sort and filter coins
  const processedCoins = coins
    ?.filter((coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.current_price - a.current_price;
        case "volume":
          return b.total_volume - a.total_volume;
        case "change":
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        case "market_cap":
        default:
          return (b.market_cap || 0) - (a.market_cap || 0);
      }
    });

  // Pagination logic
  const totalPages = Math.ceil((processedCoins?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCoins = processedCoins?.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="glass-card border-gray-600"
        data-testid="pagination-prev"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={
            currentPage === i
              ? "bg-accent-blue text-white"
              : "glass-card border-gray-600"
          }
          data-testid={`pagination-${i}`}
        >
          {i}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="glass-card border-gray-600"
        data-testid="pagination-next"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    );

    return buttons;
  };

  return (
    <div className="min-h-screen gradient-bg pt-16" data-testid="enhanced-markets-page">
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold" data-testid="markets-title">
                Cryptocurrency Markets
              </h1>
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-600 text-white hover:bg-white/10">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
            </div>
            <p className="text-gray-400" data-testid="markets-subtitle">
              Real-time market data for all cryptocurrencies with advanced filtering
            </p>
          </div>

          <GlassCard className="overflow-hidden">
            {/* Header with controls */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                <h2 className="text-xl font-bold" data-testid="market-overview-title">
                  Market Overview ({processedCoins?.length || 0} coins)
                </h2>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search coins..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                      className="glass-card pl-10 w-64 border-gray-600"
                      data-testid="markets-search"
                    />
                  </div>
                  
                  {/* Sort selector */}
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="glass-card w-48 border-gray-600" data-testid="markets-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-gray-700">
                      <SelectItem value="market_cap">Sort by Market Cap</SelectItem>
                      <SelectItem value="price">Sort by Price</SelectItem>
                      <SelectItem value="volume">Sort by Volume</SelectItem>
                      <SelectItem value="change">Sort by Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Markets Table */}
            <div className="overflow-x-auto" data-testid="markets-table">
              <table className="w-full">
                <thead className="bg-primary-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">1h %</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">24h %</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">7d %</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-400 uppercase tracking-wider">Chart</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Market Cap</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Supply</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">RSI</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-400 uppercase tracking-wider">Watch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                      <tr key={index} className="hover:bg-primary-700" data-testid={`markets-skeleton-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="w-8 h-4 skeleton rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full skeleton"></div>
                            <div>
                              <div className="w-20 h-4 skeleton rounded mb-1"></div>
                              <div className="w-16 h-3 skeleton rounded"></div>
                            </div>
                          </div>
                        </td>
                        {Array.from({ length: 9 }).map((_, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="w-20 h-4 skeleton rounded ml-auto"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : currentCoins && currentCoins.length > 0 ? (
                    currentCoins.map((coin, index) => {
                      const rsi = calculateRSI(coin.sparkline_in_7d?.price);
                      const globalRank = startIndex + index + 1;
                      
                      return (
                        <tr
                          key={coin.id}
                          className="transition-all duration-300 hover:bg-white/10 cursor-pointer hover:scale-[1.01] hover:shadow-lg backdrop-blur-sm"
                          onClick={() => handleCoinClick(coin.id)}
                          data-testid={`markets-row-${coin.id}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-testid={`markets-rank-${coin.id}`}>
                            {coin.market_cap_rank || globalRank}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <img
                                src={coin.image}
                                alt={coin.name}
                                className="w-10 h-10 rounded-full"
                                data-testid={`markets-image-${coin.id}`}
                              />
                              <div>
                                <div className="text-sm font-medium text-white" data-testid={`markets-name-${coin.id}`}>
                                  {coin.name}
                                </div>
                                <div className="text-sm text-gray-400 uppercase" data-testid={`markets-symbol-${coin.id}`}>
                                  {coin.symbol}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-white" data-testid={`markets-price-${coin.id}`}>
                              {formatCurrency(coin.current_price)}
                            </div>
                            <div className="text-xs text-gray-400">
                              ${coin.current_price.toFixed(8)}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${(coin.price_change_percentage_1h || 0) > 0 ? "text-green-400" : "text-red-400"}`} data-testid={`markets-change-1h-${coin.id}`}>
                            {coin.price_change_percentage_1h ? formatPercentage(coin.price_change_percentage_1h) : "N/A"}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${coin.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400"}`} data-testid={`markets-change-24h-${coin.id}`}>
                            <div className="flex items-center justify-end space-x-1">
                              {coin.price_change_percentage_24h > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span>{formatPercentage(coin.price_change_percentage_24h)}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${coin.price_change_percentage_7d ? (coin.price_change_percentage_7d > 0 ? "text-green-400" : "text-red-400") : "text-gray-400"}`} data-testid={`markets-change-7d-${coin.id}`}>
                            {coin.price_change_percentage_7d ? formatPercentage(coin.price_change_percentage_7d) : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="w-20 h-10 mx-auto bg-slate-800/30 border border-slate-700 rounded flex items-center justify-center">
                              <span className="text-xs text-slate-500 cursor-pointer hover:text-accent-blue" onClick={() => handleCoinClick(coin.id)}>View Chart</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white" data-testid={`markets-mcap-${coin.id}`}>
                            {formatCurrency(coin.market_cap)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white" data-testid={`markets-volume-${coin.id}`}>
                            {formatCurrency(coin.total_volume)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white" data-testid={`markets-supply-${coin.id}`}>
                            <div>{formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}</div>
                            {coin.max_supply && (
                              <div className="text-xs text-gray-400">
                                Max: {formatNumber(coin.max_supply)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getRSIColor(rsi)}`}
                              data-testid={`markets-rsi-${coin.id}`}
                            >
                              {rsi.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0"
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
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-6 py-8 text-center text-gray-400" data-testid="markets-no-data">
                        {searchQuery ? "No coins found matching your search" : "No market data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400" data-testid="pagination-info">
                    Showing {startIndex + 1} to {Math.min(endIndex, processedCoins?.length || 0)} of {processedCoins?.length || 0} results
                  </div>
                  
                  <div className="flex items-center space-x-2" data-testid="pagination-controls">
                    {renderPaginationButtons()}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* Coin Detail Modal */}
      <CoinModal
        coinId={selectedCoinId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}