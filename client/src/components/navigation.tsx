import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SearchBar } from "@/components/search-bar";
import { AuthButton } from "@/components/auth-button";
import { AuthStatusIndicator } from "@/components/auth-status-indicator";
import { AltSeasonWidget } from "@/components/alt-season-widget";
import { FearGreedWidget } from "@/components/fear-greed-widget";
import { MarketCapWidget } from "@/components/market-cap-widget";
import { VolumeWidget } from "@/components/volume-widget";
import { DominanceWidget } from "@/components/dominance-widget";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, TrendingUp, User, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
  { path: "/markets", label: "Markets", icon: "fas fa-coins" },
  { path: "/watchlist", label: "Watchlist", icon: "fas fa-star" },
  { path: "/portfolio", label: "Portfolio", icon: "fas fa-wallet" },
  { path: "/analytics", label: "Analytics", icon: "fas fa-chart-bar" },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`nav-link transition-colors ${
            location === item.path
              ? "text-accent-blue font-medium"
              : "text-white hover:text-accent-blue"
          } ${mobile ? "block py-2" : ""}`}
          onClick={() => mobile && setMobileOpen(false)}
          data-testid={`nav-link-${item.label.toLowerCase()}`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2"
              data-testid="logo-link"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-accent-blue to-accent-green rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CryptoLiquid</span>
            </Link>



            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              <NavLinks />
            </div>
          </div>

          {/* Search, Auth, and Mobile Menu */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar - Hidden on small screens */}
            <div className="hidden lg:block">
              <SearchBar />
            </div>
            
            {/* User Status & Auth */}
            <div className="flex items-center space-x-2">
              {/* Always show status for both logged in and guest users */}
              {!loading && (
                <div className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  user ? 'bg-green-500/10 border border-green-500/20' : 'bg-blue-500/10 border border-blue-500/20'
                }`}>
                  {user ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">
                        {user.displayName?.split(' ')[0] || 'User'}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-blue-400 font-medium">Guest</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Show auth status on mobile for all users */}
              <div className="md:hidden">
                <AuthStatusIndicator />
              </div>
              <AuthButton />
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:text-accent-blue"
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="glass-card border-gray-700 w-64"
                data-testid="mobile-menu-content"
              >
                <div className="flex flex-col space-y-4 mt-8">
                  {/* User Status in Mobile Menu */}
                  <div className="pb-4 border-b border-gray-600/50">
                    {user ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-blue to-accent-green flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{user.displayName || 'User'}</div>
                          <div className="text-xs text-green-400">Logged In</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-300" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Guest User</div>
                          <div className="text-xs text-blue-400">Full Access Available</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile Search */}
                  <div className="sm:hidden mb-4">
                    <SearchBar />
                  </div>
                  
                  {/* Mobile Market Widgets */}
                  <div className="lg:hidden mb-4 space-y-3">
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Market Indices</div>
                    <div className="flex flex-col space-y-2">
                      <AltSeasonWidget />
                      <FearGreedWidget />
                    </div>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Navigation</div>
                    <NavLinks mobile />
                  </div>
                  
                  {/* Guest Message */}
                  {!user && (
                    <div className="pt-4 border-t border-gray-600/50">
                      <div className="text-xs text-gray-400 text-center">
                        Sign in to access personalized features like watchlists and portfolios
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
