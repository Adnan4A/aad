import { useState } from "react";
import { EnhancedLiveTicker } from "@/components/enhanced-live-ticker";
import { LivePriceBanner } from "@/components/live-price-banner";
import { CoinModal } from "@/components/coin-modal";
import { TrendingSection } from "@/components/trending-section";
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useForceRefresh } from '@/hooks/use-force-refresh';

export default function Dashboard() {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { forceRefresh, isRefreshing } = useForceRefresh();

  const handleCoinClick = (coinId: string) => {
    setSelectedCoinId(coinId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCoinId(null);
    setIsModalOpen(false);
  };

  const handleGlobalRefresh = () => {
    forceRefresh();
  };


  return (
    <div className="min-h-screen gradient-bg" data-testid="dashboard-page">
      
      {/* Live Price Banner */}
      <LivePriceBanner onCoinClick={handleCoinClick} />

      {/* Hero Section */}
      <section className="py-8" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent glow-text floating" data-testid="hero-title">
              Real-Time Crypto Dashboard
            </h1>
            <p className="text-lg text-gray-300 fade-in" data-testid="hero-subtitle">
              Track live cryptocurrency prices and market movements
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Live Price Ticker - Centered */}
      <section className="py-6" data-testid="live-ticker-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white mb-2">Live Market Updates</h2>
            <p className="text-gray-400 text-sm">Real-time price movements and market trends</p>
          </div>
          <EnhancedLiveTicker onCoinClick={handleCoinClick} />
        </div>
      </section>

      {/* Global Refresh Section */}
      <section className="py-6" data-testid="refresh-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Button
              onClick={handleGlobalRefresh}
              disabled={isRefreshing}
              className="glass-card bg-white/10 hover:bg-white/20 border-white/20 text-white px-8 py-3"
              data-testid="global-refresh-button"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
            </Button>
            <p className="text-gray-400 text-sm mt-2">Update all coin prices and charts instantly</p>
          </div>
        </div>
      </section>

      {/* Trending Section - Market Highlights */}
      <TrendingSection onCoinClick={handleCoinClick} />

      {/* Footer */}
      <footer className="mt-16 bg-gray-900/30 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-blue to-accent-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-white">CryptoLiquid</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">Real-time cryptocurrency market data and insights</p>
            <div className="text-xs text-gray-500">
              <p>Market data provided by CoinGecko API</p>
              <p className="mt-1">© 2025 CryptoLiquid. Built with modern web technologies.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Coin Detail Modal */}
      <CoinModal
        coinId={selectedCoinId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      
    </div>
  );
}
