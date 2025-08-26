import { useState } from "react";
import { Wallet, Plus, Link as LinkIcon, TrendingUp, PieChart, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";

export default function Portfolio() {
  const [portfolioValue] = useState(0);
  const [holdings] = useState([]);

  return (
    <div className="min-h-screen gradient-bg pt-16" data-testid="portfolio-page">
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold" data-testid="portfolio-title">
                Portfolio Tracker
              </h1>
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2 border-gray-600 text-white hover:bg-white/10">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
            </div>
            <p className="text-gray-400" data-testid="portfolio-subtitle">
              Track your cryptocurrency investments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Portfolio Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Performance Chart */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-4" data-testid="portfolio-performance-title">
                  Portfolio Performance
                </h2>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg" data-testid="portfolio-chart-placeholder">
                  <div className="text-center text-gray-400">
                    <PieChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Portfolio chart will appear here</p>
                    <p className="text-sm">Add holdings to see your portfolio visualization</p>
                  </div>
                </div>
              </GlassCard>

              {/* Holdings Table */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" data-testid="holdings-title">Your Holdings</h2>
                  <Button
                    className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                    data-testid="add-holding-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holding
                  </Button>
                </div>

                {holdings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400" data-testid="empty-portfolio">
                    <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium mb-2">Your portfolio is empty</h3>
                    <p className="mb-6">
                      Start tracking your cryptocurrency investments by adding your holdings or connecting your wallet
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                        data-testid="add-holding-cta"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Manual Holding
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-600 text-white hover:bg-gray-700"
                        data-testid="connect-wallet-cta"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto" data-testid="holdings-table">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 text-sm font-medium text-gray-400">Asset</th>
                          <th className="text-right py-3 text-sm font-medium text-gray-400">Holdings</th>
                          <th className="text-right py-3 text-sm font-medium text-gray-400">Price</th>
                          <th className="text-right py-3 text-sm font-medium text-gray-400">Value</th>
                          <th className="text-right py-3 text-sm font-medium text-gray-400">24h Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {/* Holdings will be mapped here when available */}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Portfolio Summary */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4" data-testid="portfolio-value-title">
                  Portfolio Value
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Total Value</p>
                    <p className="text-3xl font-bold" data-testid="total-portfolio-value">
                      ${portfolioValue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">24h Change</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xl font-semibold text-gray-300" data-testid="portfolio-24h-change">
                        $0.00 (0.00%)
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">7d Change</p>
                    <p className="text-lg font-semibold text-gray-300" data-testid="portfolio-7d-change">
                      $0.00 (0.00%)
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4" data-testid="quick-actions-title">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white"
                    data-testid="add-holding-sidebar"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holding
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-white hover:bg-gray-700"
                    data-testid="connect-wallet-sidebar"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-white hover:bg-gray-700"
                    data-testid="export-data"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </GlassCard>

              {/* Portfolio Allocation */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4" data-testid="allocation-title">
                  Asset Allocation
                </h3>
                <div className="text-center py-8 text-gray-400" data-testid="allocation-empty">
                  <PieChart className="w-12 h-12 mx-auto mb-2" />
                  <p>No holdings to display</p>
                  <p className="text-sm">Add assets to see allocation breakdown</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
