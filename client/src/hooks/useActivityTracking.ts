import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Declare global activity tracking cache
declare global {
  interface Window {
    activityCache?: Set<string>;
    activityTimeouts?: Map<string, NodeJS.Timeout>;
  }
}

// Generate a unique session ID for this browser session
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

let sessionId = sessionStorage.getItem('app_session_id');
if (!sessionId) {
  sessionId = generateSessionId();
  sessionStorage.setItem('app_session_id', sessionId);
}

export const useActivityTracking = () => {
  const { user } = useAuth();
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Helper function to prevent duplicate tracking
  const shouldTrackActivity = (activityKey: string): boolean => {
    if (!window.activityCache) {
      window.activityCache = new Set();
    }
    
    if (window.activityCache.has(activityKey)) {
      return false; // Duplicate, don't track
    }
    
    // Add to cache and set timeout to clear it
    window.activityCache.add(activityKey);
    setTimeout(() => {
      window.activityCache?.delete(activityKey);
    }, 5000); // 5 second cache
    
    return true;
  };
  
  // Track page view
  const trackPageView = async (pageUrl: string, referrer?: string) => {
    if (!user?.uid || !sessionId) return;
    
    const activityKey = `page_view_${user.uid}_${pageUrl}_${sessionId}`;
    if (!shouldTrackActivity(activityKey)) {
      return; // Skip duplicate
    }
    
    try {
      await fetch('/api/track/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          sessionId,
          pageUrl,
          referrer: referrer || document.referrer,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  };

  // Track coin view
  const trackCoinView = async (coinId: string, coinName: string, timeSpent?: number) => {
    if (!user?.uid || !sessionId) return;
    
    const activityKey = `coin_view_${user.uid}_${coinId}_${sessionId}`;
    if (!shouldTrackActivity(activityKey)) {
      return; // Skip duplicate
    }
    
    try {
      await fetch('/api/track/coin-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          sessionId,
          coinId,
          coinName,
          timeSpent,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to track coin view:', error);
    }
  };

  // Track chart view
  const trackChartView = async (coinId: string, coinName: string, timeframe: string) => {
    if (!user?.uid || !sessionId) return;
    
    const activityKey = `chart_view_${user.uid}_${coinId}_${timeframe}_${sessionId}`;
    if (!shouldTrackActivity(activityKey)) {
      return; // Skip duplicate
    }
    
    try {
      await fetch('/api/track/chart-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          sessionId,
          coinId,
          coinName,
          timeframe,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to track chart view:', error);
    }
  };

  // Start session tracking
  const startSession = async () => {
    if (!user?.uid || !sessionId) return;
    
    try {
      await fetch('/api/track/session-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          sessionId,
          userAgent: navigator.userAgent,
          ipAddress: 'unknown', // We can't get real IP from frontend
        }),
      });
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  // End session tracking
  const endSession = async () => {
    if (!sessionId) return;
    
    const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
    
    try {
      await fetch('/api/track/session-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          duration,
        }),
      });
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  // Auto-track page views when route changes
  useEffect(() => {
    if (user?.uid) {
      trackPageView(window.location.pathname);
      startSession();
    }
  }, [user?.uid, window.location.pathname]);

  // Track session end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, []);

  return {
    trackPageView,
    trackCoinView,
    trackChartView,
    startSession,
    endSession,
    sessionId,
  };
};