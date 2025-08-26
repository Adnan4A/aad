import { useState, useEffect } from "react";
import { Star, TrendingUp, TrendingDown, Heart, Home } from "lucide-react";
import { GlassCard } from "./glass-card";
import { CoinModal } from "./coin-modal";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CryptoAPI, formatCurrency, formatPercentage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Crypto } from "@shared/schema";

export function WatchlistPage() {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localWatchlist, setLocalWatchlist] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { watchlist, isLoading: watchlistLoading, toggleWatchlist } = useWatchlist();

  // Fallback: read directly from localStorage when Firebase is down
  useEffect(() => {
    if (user) {
      try {
        const stored = localStorage.getItem(`crypto_watchlist_${user.uid}`);
        if (stored) {
          const localData = JSON.parse(stored);
          setLocalWatchlist(localData);
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
    }
  }, [user]);

  // Use either Firebase watchlist or localStorage fallback
  const currentWatchlist = watchlist && watchlist.length > 0 ? watchlist : localWatchlist;

  // Fetch coin data for watchlist items
  const { data: watchlistCoins, isLoading: coinsLoading } = useQuery({
    queryKey: ["watchlist-coins", currentWatchlist],
    queryFn: async () => {
      if (currentWatchlist.length === 0) return [];
      
      // Fetch all coins and filter by watchlist
      const allCoins = await CryptoAPI.getCoins(1, 500);
      return allCoins.filter((coin: Crypto) => currentWatchlist.includes(coin.id));
    },
    enabled: currentWatchlist.length > 0,
  });

  const handleCoinClick = (coinId: string) => {
    setSelectedCoinId(coinId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCoinId(null);
    setIsModalOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen gradient-bg pt-16" data-testid="watchlist-page">
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold" data-testid="watchlist-title">
                  My Watchlist
                </h1>
                <Link href="/">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-600 text-white hover:bg-white/10">
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                </Link>
              </div>
              <p className="text-gray-400" data-testid="watchlist-subtitle">
                Track your favorite cryptocurrencies
              </p>
            </div>

            <GlassCard className="p-12 text-center">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold mb-4">Sign in to create your watchlist</h3>
              <p className="text-gray-400 mb-6">
                Keep track of your favorite cryptocurrencies and get personalized insights
              </p>
              <Link href="/auth">
                <Button
                  className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                  data-testid="sign-in-watchlist"
                >
                  Sign In to Continue
                </Button>
              </Link>
            </GlassCard>
          </div>
        </section>
      </div>
    );
  }

  const isLoading = watchlistLoading || coinsLoading;

  return (
    <div className="min-h-screen gradient-bg pt-16" data-testid="watchlist-page">
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold" data-testid="watchlist-title">
                My Watchlist
              </h1>
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-600 text-white hover:bg-white/10">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
            </div>
            <p className="text-gray-400" data-testid="watchlist-subtitle">
              Track your favorite cryptocurrencies ({currentWatchlist.length} coins)
              {localWatchlist.length > 0 && !watchlist?.length && (
                <span className="text-xs text-yellow-400 ml-2">(Offline mode)</span>
              )}
            </p>
          </div>

          <GlassCard className="overflow-hidden">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 glass-card rounded-lg"
                      data-testid={`watchlist-skeleton-${index}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full skeleton"></div>
                        <div>
                          <div className="w-24 h-5 skeleton rounded mb-2"></div>
                          <div className="w-16 h-4 skeleton rounded"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-20 h-5 skeleton rounded mb-2"></div>
                        <div className="w-16 h-4 skeleton rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : watchlistCoins && watchlistCoins.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="watchlist-grid">
                  {watchlistCoins.map((coin: Crypto) => (
                    <div
                      key={coin.id}
                      className="glass-card rounded-lg p-4 hover-glow cursor-pointer transition-all"
                      onClick={() => handleCoinClick(coin.id)}
                      data-testid={`watchlist-coin-${coin.id}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-12 h-12 rounded-full"
                            data-testid={`watchlist-coin-image-${coin.id}`}
                          />
                          <div>
                            <h3 className="font-bold text-lg" data-testid={`watchlist-coin-name-${coin.id}`}>
                              {coin.name}
                            </h3>
                            <p className="text-gray-400 uppercase text-sm" data-testid={`watchlist-coin-symbol-${coin.id}`}>
                              {coin.symbol}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(coin.id);
                          }}
                          data-testid={`remove-watchlist-${coin.id}`}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Current Price</p>
                          <p className="text-xl font-bold" data-testid={`watchlist-coin-price-${coin.id}`}>
                            {formatCurrency(coin.current_price)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">24h Change</p>
                          <div 
                            className={`flex items-center text-lg font-semibold ${
                              coin.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400"
                            }`}
                            data-testid={`watchlist-coin-change-${coin.id}`}
                          >
                            {coin.price_change_percentage_24h > 0 ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            {formatPercentage(coin.price_change_percentage_24h)}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Market Cap</p>
                          <p className="text-lg font-medium" data-testid={`watchlist-coin-mcap-${coin.id}`}>
                            {formatCurrency(coin.market_cap)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Rank</p>
                          <p className="text-lg font-medium" data-testid={`watchlist-coin-rank-${coin.id}`}>
                            #{coin.market_cap_rank}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center" data-testid="watchlist-empty">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold mb-4">Your watchlist is empty</h3>
                <p className="text-gray-400 mb-6">
                  Start adding coins to your watchlist by clicking the star icon on any cryptocurrency
                </p>
                <Button
                  onClick={() => window.location.href = '/markets'}
                  className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                  data-testid="browse-markets"
                >
                  Browse Markets
                </Button>
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