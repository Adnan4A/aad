import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";

// Middleware to check if user is admin
const requireAdmin = async (req: Request, res: Response, next: any) => {
  try {
    const adminId = req.body.adminId || req.query.adminId;
    if (!adminId) {
      return res.status(401).json({ error: 'Admin ID required' });
    }
    
    // Here you would check if the user is actually an admin
    // For now, we'll assume the frontend handles admin verification
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin verification failed' });
  }
};

export function registerAdminRoutes(app: Express) {
  // Admin Routes
  
  // Toggle coin visibility (hide/show coins from website)
  app.post('/api/admin/toggle-coin-visibility', requireAdmin, async (req, res) => {
    try {
      const { coinId, hidden, adminId, adminName } = req.body;
      
      if (!coinId || typeof hidden !== 'boolean' || !adminId || !adminName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await storage.toggleCoinVisibility(coinId, hidden, adminId, adminName);
      
      res.json({ 
        success: true, 
        message: `Coin ${coinId} ${hidden ? 'hidden' : 'shown'} successfully` 
      });
    } catch (error) {
      console.error('Error toggling coin visibility:', error);
      res.status(500).json({ error: 'Failed to toggle coin visibility' });
    }
  });

  // Get hidden coins list
  app.get('/api/admin/hidden-coins', async (req, res) => {
    try {
      const hiddenCoins = await storage.getHiddenCoins();
      res.json({ hiddenCoins });
    } catch (error) {
      console.error('Error getting hidden coins:', error);
      res.status(500).json({ error: 'Failed to get hidden coins' });
    }
  });

  // Get site configuration
  app.get('/api/admin/site-config', requireAdmin, async (req, res) => {
    try {
      const config = await storage.getSiteConfig();
      res.json({ config });
    } catch (error) {
      console.error('Error getting site config:', error);
      res.status(500).json({ error: 'Failed to get site configuration' });
    }
  });

  // Update site configuration
  app.post('/api/admin/site-config', requireAdmin, async (req, res) => {
    try {
      const { config, adminId, adminName } = req.body;
      
      if (!config || !adminId || !adminName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await storage.updateSiteConfig(config, adminId, adminName);
      
      res.json({ 
        success: true, 
        message: 'Site configuration updated successfully' 
      });
    } catch (error) {
      console.error('Error updating site config:', error);
      res.status(500).json({ error: 'Failed to update site configuration' });
    }
  });

  // Get admin activities
  app.get('/api/admin/activities', requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const activities = await storage.getAdminActivities(limit);
      res.json({ activities });
    } catch (error) {
      console.error('Error getting admin activities:', error);
      res.status(500).json({ error: 'Failed to get admin activities' });
    }
  });

  // Get user activities (for specific user)
  app.get('/api/admin/user-activities/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const activities = await storage.getUserActivities(userId, limit);
      const sessions = await storage.getUserSessions(userId, 10);
      
      res.json({ activities, sessions });
    } catch (error) {
      console.error('Error getting user activities:', error);
      res.status(500).json({ error: 'Failed to get user activities' });
    }
  });

  // Get all user activities (for admin dashboard) - exclude admin activities
  app.get('/api/admin/all-user-activities', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const activities = await storage.getAllUserActivities(limit);
      
      // Filter out admin activities and only keep regular user activities
      const userOnlyActivities = activities.filter(activity => {
        // Exclude admin-related actions
        const adminActions = ['coin_hide', 'coin_show', 'settings_change', 'admin_login', 'admin_action'];
        return !adminActions.includes(activity.action) && 
               !activity.userId?.includes('admin') &&
               activity.userId !== 'jXiA7imTXIMS4pJ82gZWZBuTW9f2'; // Exclude known admin user ID
      });
      
      // Enhance activities with user details
      const enhancedActivities = await Promise.all(
        userOnlyActivities.map(async (activity) => {
          const userDetails = await storage.getUserById(activity.userId);
          return {
            ...activity,
            userEmail: userDetails?.email || 'Unknown User',
            userName: userDetails?.displayName || 'Unknown',
            userPhotoURL: userDetails?.photoURL || null,
            details: activity.description || activity.pageUrl || activity.coinId || 'No details',
            timeSpent: activity.timeSpent || null,
            browserInfo: activity.userAgent || 'Unknown Browser'
          };
        })
      );
      
      res.json({ activities: enhancedActivities });
    } catch (error) {
      console.error('Error getting all user activities:', error);
      res.status(500).json({ error: 'Failed to get user activities' });
    }
  });

  // User Activity Tracking Routes (for frontend to call)
  
  // Track page view
  app.post('/api/track/page-view', async (req, res) => {
    try {
      const { userId, sessionId, pageUrl, referrer, userAgent } = req.body;
      
      if (!userId || !sessionId || !pageUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await storage.trackUserActivity({
        userId,
        sessionId,
        type: 'page_view',
        action: 'page_visited',
        description: `Visited page: ${pageUrl}`,
        pageUrl,
        referrer,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking page view:', error);
      res.status(500).json({ error: 'Failed to track page view' });
    }
  });

  // Track coin view
  app.post('/api/track/coin-view', async (req, res) => {
    try {
      const { userId, sessionId, coinId, coinName, timeSpent, userAgent } = req.body;
      
      if (!userId || !sessionId || !coinId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await storage.trackUserActivity({
        userId,
        sessionId,
        type: 'coin_view',
        action: 'coin_viewed',
        description: `Viewed coin: ${coinName || coinId}`,
        coinId,
        timeSpent,
        userAgent,
        timestamp: new Date().toISOString(),
        metadata: { coinName }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking coin view:', error);
      res.status(500).json({ error: 'Failed to track coin view' });
    }
  });

  // Track chart view
  app.post('/api/track/chart-view', async (req, res) => {
    try {
      const { userId, sessionId, coinId, coinName, timeframe, userAgent } = req.body;
      
      if (!userId || !sessionId || !coinId || !timeframe) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await storage.trackUserActivity({
        userId,
        sessionId,
        type: 'chart_view',
        action: 'chart_viewed',
        description: `Viewed ${timeframe} chart for ${coinName || coinId}`,
        coinId,
        userAgent,
        timestamp: new Date().toISOString(),
        metadata: { coinName, timeframe }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking chart view:', error);
      res.status(500).json({ error: 'Failed to track chart view' });
    }
  });

  // Start user session
  app.post('/api/track/session-start', async (req, res) => {
    try {
      const { userId, sessionId, userAgent, ipAddress } = req.body;
      
      if (!userId || !sessionId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const sessionDbId = await storage.startUserSession({
        userId,
        sessionId,
        startTime: new Date().toISOString(),
        userAgent,
        ipAddress,
        isActive: true,
        pagesVisited: [],
        coinsViewed: [],
        chartsViewed: [],
      });

      res.json({ success: true, sessionDbId });
    } catch (error) {
      console.error('Error starting user session:', error);
      res.status(500).json({ error: 'Failed to start user session' });
    }
  });

  // End user session
  app.post('/api/track/session-end', async (req, res) => {
    try {
      const { sessionId, duration } = req.body;
      
      if (!sessionId || typeof duration !== 'number') {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await storage.endUserSession(sessionId, new Date().toISOString(), duration);

      res.json({ success: true });
    } catch (error) {
      console.error('Error ending user session:', error);
      res.status(500).json({ error: 'Failed to end user session' });
    }
  });

  // Update session with page/coin data
  app.post('/api/track/session-update', async (req, res) => {
    try {
      const { sessionId, pagesVisited, coinsViewed, chartsViewed } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }

      const updates: any = {};
      if (pagesVisited) updates.pagesVisited = pagesVisited;
      if (coinsViewed) updates.coinsViewed = coinsViewed;
      if (chartsViewed) updates.chartsViewed = chartsViewed;

      await storage.updateUserSession(sessionId, updates);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating user session:', error);
      res.status(500).json({ error: 'Failed to update user session' });
    }
  });

  // Track login
  app.post('/api/track/login', async (req, res) => {
    try {
      const { userId, userAgent, timestamp } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      await storage.trackUserActivity({
        userId,
        sessionId: Date.now().toString(), // Generate temp session ID for login event
        type: 'login',
        action: 'login',
        description: 'User logged in',
        userAgent,
        timestamp: timestamp || new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking login:', error);
      res.status(500).json({ error: 'Failed to track login' });
    }
  });

  // Track logout
  app.post('/api/track/logout', async (req, res) => {
    try {
      const { userId, userAgent, timestamp } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      await storage.trackUserActivity({
        userId,
        sessionId: Date.now().toString(), // Generate temp session ID for logout event
        type: 'logout',
        action: 'logout',
        description: 'User logged out',
        userAgent,
        timestamp: timestamp || new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking logout:', error);
      res.status(500).json({ error: 'Failed to track logout' });
    }
  });
}