import { 
  type GlobalStats, 
  type Crypto, 
  type CoinDetail, 
  type HistoricalData, 
  type UserActivity,
  type UserSession,
  type HiddenCoin,
  type AdminActivity,
  type SiteConfig
} from "@shared/schema";

export interface IStorage {
  // Cache for API responses to avoid rate limiting
  getCachedGlobalStats(): Promise<GlobalStats | undefined>;
  setCachedGlobalStats(data: GlobalStats): Promise<void>;
  getCachedCoins(): Promise<Crypto[] | undefined>;
  setCachedCoins(data: Crypto[]): Promise<void>;
  getCachedCoinDetail(coinId: string): Promise<CoinDetail | undefined>;
  setCachedCoinDetail(coinId: string, data: CoinDetail): Promise<void>;
  getCachedHistoricalData(cacheKey: string): Promise<HistoricalData | undefined>;
  setCachedHistoricalData(cacheKey: string, data: HistoricalData, ttl?: number): Promise<void>;
  
  // Admin functionality
  getHiddenCoins(): Promise<string[]>;
  getHiddenCoin(coinId: string): Promise<HiddenCoin | undefined>;
  toggleCoinVisibility(coinId: string, hidden: boolean, adminId: string, adminName: string): Promise<void>;
  getSiteConfig(): Promise<SiteConfig | undefined>;
  updateSiteConfig(config: Partial<SiteConfig>, adminId: string, adminName: string): Promise<void>;
  
  // User activity tracking
  trackUserActivity(activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void>;
  startUserSession(sessionData: Omit<UserSession, 'id'>): Promise<string>;
  updateUserSession(sessionId: string, updates: Partial<UserSession>): Promise<void>;
  endUserSession(sessionId: string, endTime: string, duration: number): Promise<void>;
  getUserActivities(userId: string, limit?: number): Promise<UserActivity[]>;
  getUserSessions(userId: string, limit?: number): Promise<UserSession[]>;
  getAllUserActivities(limit?: number): Promise<UserActivity[]>;
  
  // Admin activity logging
  logAdminActivity(activity: Omit<AdminActivity, 'id'>): Promise<void>;
  getAdminActivities(limit?: number): Promise<AdminActivity[]>;
  
  // User management
  getUserById(userId: string): Promise<{ email: string; displayName: string; photoURL?: string } | null>;
}

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase.js';

// Declare global activity signatures cache
declare global {
  var activitySignatures: Set<string> | undefined;
}

export class FirebaseStorage implements IStorage {
  // In-memory cache for API responses
  private globalStatsCache: { data: GlobalStats; timestamp: number } | undefined;
  private coinsCache: { data: Crypto[]; timestamp: number } | undefined;
  private coinDetailCache: Map<string, { data: CoinDetail; timestamp: number }> = new Map();
  private historicalDataCache: Map<string, { data: HistoricalData; timestamp: number }> = new Map();
  
  private readonly CACHE_TTL = 60000; // 1 minute cache

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  // Cache methods (in-memory for API responses)
  async getCachedGlobalStats(): Promise<GlobalStats | undefined> {
    if (this.globalStatsCache && this.isCacheValid(this.globalStatsCache.timestamp)) {
      return this.globalStatsCache.data;
    }
    return undefined;
  }

  async setCachedGlobalStats(data: GlobalStats): Promise<void> {
    this.globalStatsCache = { data, timestamp: Date.now() };
  }

  async getCachedCoins(): Promise<Crypto[] | undefined> {
    if (this.coinsCache && this.isCacheValid(this.coinsCache.timestamp)) {
      return this.coinsCache.data;
    }
    return undefined;
  }

  async setCachedCoins(data: Crypto[]): Promise<void> {
    this.coinsCache = { data, timestamp: Date.now() };
  }

  async getCachedCoinDetail(coinId: string): Promise<CoinDetail | undefined> {
    const cached = this.coinDetailCache.get(coinId);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return undefined;
  }

  async setCachedCoinDetail(coinId: string, data: CoinDetail): Promise<void> {
    this.coinDetailCache.set(coinId, { data, timestamp: Date.now() });
  }

  async getCachedHistoricalData(cacheKey: string): Promise<HistoricalData | undefined> {
    const cached = this.historicalDataCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return undefined;
  }

  async setCachedHistoricalData(cacheKey: string, data: HistoricalData, ttl?: number): Promise<void> {
    this.historicalDataCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  // Admin functionality using Firebase
  async getHiddenCoins(): Promise<string[]> {
    try {
      const q = query(collection(db, 'hiddenCoins'), where('isHidden', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().coinId);
    } catch (error) {
      console.error('Error getting hidden coins:', error);
      return [];
    }
  }

  async getHiddenCoin(coinId: string): Promise<HiddenCoin | undefined> {
    try {
      const docRef = doc(db, 'hiddenCoins', coinId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as HiddenCoin : undefined;
    } catch (error) {
      console.error('Error getting hidden coin:', error);
      return undefined;
    }
  }

  async toggleCoinVisibility(coinId: string, hidden: boolean, adminId: string, adminName: string): Promise<void> {
    try {
      const hiddenCoinRef = doc(db, 'hiddenCoins', coinId);
      
      if (hidden) {
        // Hide the coin
        const hiddenCoin: HiddenCoin = {
          id: coinId,
          coinId,
          coinName: coinId, // Will be updated with actual name from API
          coinSymbol: coinId, // Will be updated with actual symbol from API
          isHidden: true,
          hiddenBy: adminId,
          hiddenByName: adminName,
          hiddenAt: new Date().toISOString(),
        };
        await setDoc(hiddenCoinRef, hiddenCoin);
      } else {
        // Show the coin (delete from hidden collection)
        await deleteDoc(hiddenCoinRef);
      }

      // Log admin activity
      await this.logAdminActivity({
        adminId,
        adminName,
        action: hidden ? 'coin_hide' : 'coin_show',
        target: coinId,
        targetType: 'coin',
        details: `${hidden ? 'Hidden' : 'Shown'} coin ${coinId}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error toggling coin visibility:', error);
      throw error;
    }
  }

  async getSiteConfig(): Promise<SiteConfig | undefined> {
    try {
      const docRef = doc(db, 'siteConfig', 'main');
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as SiteConfig : undefined;
    } catch (error) {
      console.error('Error getting site config:', error);
      return undefined;
    }
  }

  async updateSiteConfig(config: Partial<SiteConfig>, adminId: string, adminName: string): Promise<void> {
    try {
      const configRef = doc(db, 'siteConfig', 'main');
      const updates = {
        ...config,
        lastUpdated: new Date().toISOString(),
        updatedBy: adminId,
        updatedByName: adminName,
      };
      await updateDoc(configRef, updates);

      // Log admin activity
      await this.logAdminActivity({
        adminId,
        adminName,
        action: 'settings_change',
        target: 'site_config',
        targetType: 'settings',
        details: `Updated site configuration`,
        timestamp: new Date().toISOString(),
        metadata: config,
      });
    } catch (error) {
      console.error('Error updating site config:', error);
      throw error;
    }
  }

  // User activity tracking with deduplication
  async trackUserActivity(activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void> {
    try {
      // Remove undefined values to prevent Firestore errors
      const cleanActivity = Object.fromEntries(
        Object.entries(activity).filter(([_, v]) => v !== undefined)
      );
      
      // Create a deduplication key based on user, action, and recent timestamp
      const currentTime = new Date();
      const timeWindow = 5000; // 5 seconds window for deduplication
      const dedupKey = `${cleanActivity.userId}_${cleanActivity.action}_${cleanActivity.type || ''}_${Math.floor(currentTime.getTime() / timeWindow)}`;
      
      // Simplified duplicate check using in-memory cache to avoid Firebase index issues
      const activitySignature = `${cleanActivity.userId}_${cleanActivity.action}_${cleanActivity.details || cleanActivity.pageUrl || cleanActivity.coinId || ''}_${Math.floor(currentTime.getTime() / timeWindow)}`;
      
      // Use a simple in-memory cache for duplicate detection
      if (!globalThis.activitySignatures) {
        globalThis.activitySignatures = new Set();
      }
      
      if (globalThis.activitySignatures.has(activitySignature)) {
        console.log(`Skipping duplicate activity: ${cleanActivity.action} for user ${cleanActivity.userId}`);
        return;
      }
      
      // Add to cache and clean up old entries periodically
      globalThis.activitySignatures.add(activitySignature);
      
      // Clean up old signatures every 100 activities
      if (globalThis.activitySignatures.size > 100) {
        globalThis.activitySignatures.clear();
      }
      
      const activityData = {
        ...cleanActivity,
        createdAt: currentTime.toISOString(),
        dedupKey, // Store for potential future reference
      };
      
      await addDoc(collection(db, 'userActivities'), activityData);
      console.log(`Tracked activity: ${cleanActivity.action} for user ${cleanActivity.userId}`);
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  async startUserSession(sessionData: Omit<UserSession, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'userSessions'), sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error starting user session:', error);
      throw error;
    }
  }

  async updateUserSession(sessionId: string, updates: Partial<UserSession>): Promise<void> {
    try {
      const sessionRef = doc(db, 'userSessions', sessionId);
      await updateDoc(sessionRef, updates);
    } catch (error) {
      console.error('Error updating user session:', error);
    }
  }

  async endUserSession(sessionId: string, endTime: string, duration: number): Promise<void> {
    try {
      const sessionRef = doc(db, 'userSessions', sessionId);
      await updateDoc(sessionRef, {
        endTime,
        duration,
        isActive: false,
      });
    } catch (error) {
      console.error('Error ending user session:', error);
    }
  }

  async getUserActivities(userId: string, limitCount = 50): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, 'userActivities'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserActivity);
    } catch (error) {
      console.error('Error getting user activities:', error);
      return [];
    }
  }

  async getUserSessions(userId: string, limitCount = 20): Promise<UserSession[]> {
    try {
      const q = query(
        collection(db, 'userSessions'),
        where('userId', '==', userId),
        orderBy('startTime', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserSession);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async getAllUserActivities(limitCount = 100): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, 'userActivities'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserActivity);
    } catch (error) {
      console.error('Error getting all user activities:', error);
      return [];
    }
  }

  // Admin activity logging
  async logAdminActivity(activity: Omit<AdminActivity, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'adminActivities'), activity);
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  async getAdminActivities(limitCount = 100): Promise<AdminActivity[]> {
    try {
      const q = query(
        collection(db, 'adminActivities'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AdminActivity);
    } catch (error) {
      console.error('Error getting admin activities:', error);
      return [];
    }
  }

  async getUserById(userId: string): Promise<{ email: string; displayName: string; photoURL?: string } | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          email: userData.email || 'Unknown User',
          displayName: userData.displayName || 'Unknown',
          photoURL: userData.photoURL || null
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
}

export const storage = new FirebaseStorage();
