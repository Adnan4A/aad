import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthChange, createUserProfile, syncWatchlistWithFirebase, auth, getUserAuthDetails } from "@/lib/firebase";

// Declare global timeout property
declare global {
  interface Window {
    authChangeTimeout?: NodeJS.Timeout;
  }
}

// Auth state persistence
const AUTH_CACHE_KEY = 'cryptoliquid_auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AuthCache {
  user: User | null;
  timestamp: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    // Try to get cached auth state on initialization
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        const authCache: AuthCache = JSON.parse(cached);
        if (Date.now() - authCache.timestamp < CACHE_DURATION) {
          return authCache.user;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached auth state:', error);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initAuth = async () => {
      // Quick check if we already have a current user
      if (auth.currentUser) {
        // Check if user is suspended before setting them as active
        try {
          const { isUserActive, logout } = await import('@/lib/firebase');
          const userActive = await isUserActive(auth.currentUser.uid);
          
          if (!userActive) {
            console.log('Existing user account is suspended, logging out');
            await logout();
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error checking user active status on init:', error);
        }
        
        setUser(auth.currentUser);
        setLoading(false);
        // Create profile in background without blocking UI
        if (!profileCreated) {
          createUserProfile(auth.currentUser).finally(() => setProfileCreated(true));
        }
      }

      // No redirect handling needed for email/password auth

      // Set up auth state listener
      unsubscribe = onAuthChange(async (user) => {
        console.log("Auth state changed:", user?.email || "no user");
        
        const previousUser = JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || 'null')?.user;
        
        // Track login/logout events with debouncing
        if (previousUser?.uid !== user?.uid) {
          // Clear any existing timeout to prevent duplicate tracking
          if (window.authChangeTimeout) {
            clearTimeout(window.authChangeTimeout);
          }
          
          // Debounce auth state changes to prevent rapid firing
          window.authChangeTimeout = setTimeout(async () => {
            if (user && !previousUser) {
              // User logged in
              try {
                await fetch('/api/track/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.uid,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                  })
                });
              } catch (error) {
                console.error('Failed to track login:', error);
              }
            } else if (!user && previousUser) {
              // User logged out
              try {
                await fetch('/api/track/logout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: previousUser.uid,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                  })
                });
              } catch (error) {
                console.error('Failed to track logout:', error);
              }
            }
          }, 1000); // 1 second debounce
        }
        
        setUser(user);
        setLoading(false);
        
        // Cache the auth state
        try {
          const authCache: AuthCache = {
            user,
            timestamp: Date.now()
          };
          localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(authCache));
        } catch (error) {
          console.warn('Failed to cache auth state:', error);
        }
        
        // Reload page when auth state changes (sign in/out)
        if (previousUser?.uid !== user?.uid) {
          // Small delay to ensure state is properly updated
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
        
        // Create/update profile in background for new users only
        if (user && !profileCreated) {
          createUserProfile(user)
            .then(async () => {
              setProfileCreated(true);
              
              // Check if user is suspended after profile is created/updated
              const { isUserActive, logout } = await import('@/lib/firebase');
              const userActive = await isUserActive(user.uid);
              
              if (!userActive) {
                console.log('User account is suspended, logging out');
                await logout();
                // Show error message through toast if available
                try {
                  const { toast } = await import('@/hooks/use-toast');
                  toast({
                    title: "Account Suspended",
                    description: "Your account has been suspended. Please contact support for assistance.",
                    variant: "destructive"
                  });
                } catch (toastError) {
                  // Fallback if toast is not available
                  alert("Your account has been suspended. Please contact support for assistance.");
                }
                return;
              }
              
              // Also sync any offline watchlist changes
              try {
                await syncWatchlistWithFirebase(user.uid);
              } catch (error) {
                console.error("Error syncing watchlist:", error);
              }
            })
            .catch((error) => {
              console.error("Error creating user profile:", error);
              setProfileCreated(true); // Don't retry infinitely
            });
        }
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Remove profileCreated from dependencies to prevent unnecessary re-runs

  // Clear cache on logout
  useEffect(() => {
    if (!user) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      setProfileCreated(false);
    }
  }, [user]);
  
  // Enhanced logout function with page reload
  const logoutWithReload = async () => {
    try {
      const { logout } = await import('@/lib/firebase');
      await logout();
      // Clear all auth cache
      localStorage.removeItem(AUTH_CACHE_KEY);
      // Reload page after logout
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return { user, loading, logoutWithReload };
}