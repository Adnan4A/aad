import { useState, useEffect } from "react";
import { User, LogOut, Menu, X, BarChart3, TrendingUp, Globe, DollarSign, Activity, Coins, Star, PieChart, Wallet, Home, Newspaper, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard } from "./glass-card";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useGlobalStats } from "@/hooks/use-crypto-data";
import { logout, isUserAdmin } from "@/lib/firebase";
import { AuthButton } from "@/components/auth-button";
import { formatCurrency, formatPercentage } from "@/lib/api";
import { cn } from "@/lib/utils";


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { data: globalStats, isLoading: statsLoading } = useGlobalStats();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
      }
    };
    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      setIsMobileNavOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Navigation items
  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/markets", label: "Markets", icon: Coins },
    { path: "/news", label: "News", icon: Newspaper },
    { path: "/watchlist", label: "Watchlist", icon: Star },
    { path: "/analytics", label: "Analytics", icon: PieChart },
    { path: "/heatmap", label: "Heatmap", icon: BarChart3 },
    { path: "/global", label: "Global", icon: Globe },
    ...(isAdmin ? [{ path: "/admin", label: "Admin", icon: Shield }] : [])
  ];

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 liquid-bg border-b border-white/10 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Clickable Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-accent-blue to-accent-green rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CryptoLiquid</span>
          </Link>

          {/* Main Navigation Links - visible on large screens */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    location === item.path
                      ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu and Auth */}
          <div className="flex items-center space-x-3">
            {/* Mobile Navigation Button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-50 relative"
              aria-label="Toggle menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Auth Section */}
            <div className="relative">
              {user ? (
                <div className="hidden lg:block">
                <Button
                  variant="ghost"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
                  data-testid="user-menu-button"
                >
                  <Avatar className="w-10 h-10 border-2 border-white/20">
                    <AvatarImage 
                      src={userProfile?.photoURL || undefined} 
                      alt={displayName} 
                    />
                    <AvatarFallback className="bg-gradient-to-r from-accent-blue to-accent-green text-white text-sm font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold">{displayName}</span>
                    <span className="text-xs text-gray-300">{user.email}</span>
                  </div>
                  <Menu className="w-5 h-5" />
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-12 w-80 md:w-96 lg:w-80 xl:w-96 max-w-[90vw] liquid-bg border border-white/10 rounded-lg shadow-2xl z-50 max-h-[80vh] overflow-y-auto liquid-scrollbar">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                        <Avatar className="w-12 h-12 border-2 border-white/20">
                          <AvatarImage 
                            src={userProfile?.photoURL || undefined} 
                            alt={displayName} 
                          />
                          <AvatarFallback className="bg-gradient-to-r from-accent-blue to-accent-green text-white text-lg font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-base font-semibold text-white">{displayName}</div>
                          <div className="text-sm text-gray-300">{user.email}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Mobile Navigation for small screens */}
                        <div className="lg:hidden">
                          <div className="text-sm text-gray-300 uppercase tracking-wide font-medium mb-3">Navigation</div>
                          <div className="space-y-1">
                            {navItems.map((item) => {
                              const IconComponent = item.icon;
                              return (
                                <Link
                                  key={item.path}
                                  href={item.path}
                                  className="flex items-center space-x-3 text-base text-white hover:text-accent-blue transition-colors p-3 rounded-lg hover:bg-white/10"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <IconComponent className="w-5 h-5" />
                                  <span>{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                        

                        
                        <div className="pt-4 border-t border-white/10">
                          <div className="text-sm text-gray-300 uppercase tracking-wide font-medium mb-3">Account</div>
                          <div className="space-y-1 mb-4">
                            <Link
                              href="/profile"
                              className="flex items-center space-x-3 text-base text-white hover:text-accent-blue transition-colors p-3 rounded-lg hover:bg-white/10"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <User className="w-5 h-5" />
                              <span>Profile Settings</span>
                            </Link>
                            {isAdmin && (
                              <Link
                                href="/admin"
                                className="flex items-center space-x-3 text-base text-white hover:text-purple-400 transition-colors p-3 rounded-lg hover:bg-purple-500/10 border border-purple-500/30"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <Shield className="w-5 h-5 text-purple-400" />
                                <span>Admin Dashboard</span>
                              </Link>
                            )}
                          </div>
                          <div className="text-sm text-gray-300 uppercase tracking-wide font-medium mb-3">Account Status</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-200">Status:</span>
                              <span className="text-sm font-semibold text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-200">Plan:</span>
                              <span className={`text-sm font-semibold ${isAdmin ? 'text-purple-400' : 'text-accent-blue'}`}>
                                {isAdmin ? 'Admin' : 'Free'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-600/50">
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="w-full flex items-center justify-center space-x-2 text-red-400 hover:bg-red-400/20 hover:text-red-300 p-3 text-base font-medium"
                          data-testid="sign-out-button"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <AuthButton />
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileNavOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-40 border-t border-white/10 liquid-bg backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <div className="px-4 py-4 space-y-2">
            {/* User section for mobile when logged in */}
            {user && (
              <>
                <div className="flex items-center space-x-3 px-3 py-3 border-b border-white/10 mb-2">
                  <Avatar className="w-10 h-10 border-2 border-white/20">
                    <AvatarImage 
                      src={userProfile?.photoURL || undefined} 
                      alt={displayName} 
                    />
                    <AvatarFallback className="bg-gradient-to-r from-accent-blue to-accent-green text-white text-sm font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold text-white">{displayName}</div>
                    <div className="text-xs text-gray-300">{user.email}</div>
                  </div>
                </div>
              </>
            )}
            
            {/* Navigation items */}
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                    location === item.path
                      ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* User actions for mobile when logged in */}
            {user && (
              <>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileNavOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click overlay to close menus */}
      {(isMenuOpen || isMobileNavOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsMenuOpen(false);
            setIsMobileNavOpen(false);
          }}
        />
      )}
    </header>
  );
}