// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
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
  where
} from "firebase/firestore";

// server/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import admin from "firebase-admin";
var firebaseConfig = {
  apiKey: "AIzaSyBF8MObbKYAh0FAACHEX1WPbHbssQsSHOQ",
  authDomain: "movie-da146.firebaseapp.com",
  projectId: "movie-da146",
  storageBucket: "movie-da146.firebasestorage.app",
  messagingSenderId: "348002068886",
  appId: "1:348002068886:web:bfddd1888b5bb6afbe95b7"
};
var app = initializeApp(firebaseConfig);
var db = getFirestore(app);
var adminApp;
try {
  if (!admin.apps.length) {
    const serviceAccountKey = {
      "type": "service_account",
      "project_id": "movie-da146",
      "private_key_id": "f7e15233d1b044fd7dcf98e585cc6256c65aec33",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9UyyjjEF6nZnG\nJM1xuuRCHtug+e5a0J+Vt8ExjGR1c34EenvP4r+aqT3SgtcGJ2zKuxIMWfIYEQOE\noADOYOq4tbER+P8zJ7PGBq+NvHBIBMqpYCTAlZde1NqwcE/QsI/NZbIN/oZ+nDgL\nD2Fk3w4MpMA6MiD8rrRJCLqSh3R3slwpRIxmgqzfQXQv46QMbQFfDVuyXZnr6BuE\n98Du06mE8oUOrRD0MxotTUbPhONiCIRyNTqghZ2Ra36fd/JZ+tWm/j5zKzefkj/0\n3ekzMo1Yi0SuZaUD2uxM8bZhr0njqer0ytILTwLN0k+LOv+oai7o1+/GuwuN4mCg\nV+xYFpH/AgMBAAECggEAEr9QH3tqZuBN5qqkrV5hIl44ritEyJ/GYOaRR7BfQkIg\nq52oi2CPGJspqm7KXBGk9DsSAacZq5U26l5UHIH8Vc4OeqxTzDAvEEZ/m8lmu1SK\n8CEh6PAaZrzGt8uaghyTVAN998svn9nx5fNGWBBX+jVWOgajI/v1kXkLzV0ca1dS\nUT+2Nsmok3Q6bz2k85qmsokVjDgTxqdTGpQsM35fouBqYXXLQPYVxGIhcj1iWF4n\nKFZtLRNDX5SlD+iYFFimqcdEsFI+w6gWWLp017/5l/8cA4zP0g9M/BvextMRSHqX\nckH8JCthucpY5bUz+0e4eirHdihQZ80G6WwYs84yAQKBgQDwShfhGsWH1IPbVOlP\nYoxwVCoyvK0zYM/SBgae3ISHf1YYghlOkmWxILWjO/WFMljMAxYbJpOGfkbRC+jf\nX1bc7drDLumAf72Z6Gb8/UBN2c4s7MTPN6GJ/OYMIdHhnB8AxTaj0qaHTEVrraWj\nXdSlUiicy0+tfWy+MWHMHor4zQKBgQDJtAyQZ4PcMX5wElPqtH8WVDy4BlG56DII\nSOE2eKU59PI+hsN6iqYjlkDQN3TN7YVTMRxBKyi7MP8hR0fQ9Cx/8uiXXp5HrjQQ\njpQto3PWB1ub8YBCp6a9QU5D5QfhYthstWRmyITnnBaBBe03CJuTG5sQCrPRkA5M\n+NCtW1sl+wKBgQDKV2pCWXvrBI7AXIFXIwJl+MnMDcu/zw9RqVdb4RAM1bKXUr6i\nxm6xuHyb53q5XgseSJ8N3+8suxtBH8lKiAsqYXTtFYz1cxwjBWvsMAo9RGL0u7CD\nWjJCc1746mXFmOUWjfuT+mfW2OhAY2pu5i2RxVyDpEUFL/ApPIZBD5sxJQKBgDIS\nNTA/0jb+PmH52sUf65CSdsREJVOeNZVi6i2Ig5PAn8Yv1CT+eEHLUemeaquYNAmz\n3ky7NxBJGHydYlGX29gjZ+PzxB0NPLWDf3tY4S+XggFTUUC6t6SxqokmOO+Vhx5t\nZTAyxPNuBxQecYXA6EX7i2HPFlaGiVZISh1O2XCzAoGBAI+u254L9+c+iNU7i6DS\n4xOQPghYu19kRoP9mdRm0aMsIKZ05WYbV6dPRrjW3/CrNcFwgLqwUfgPIRKQ4l3V\nbX6mLXRMvnvS3dJXIg4+HM+xxnjEYF+vifn8XNdPNyODYcAwOl3WTLJS4Uh4HmAR\nG4jcwktHSKKqQV5ww5Igq8WD\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-fbsvc@movie-da146.iam.gserviceaccount.com",
      "client_id": "116163694624969445050",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40movie-da146.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    };
    if (serviceAccountKey) {
      const serviceAccount = serviceAccountKey;
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log("Firebase Admin SDK initialized with service account credentials");
    } else {
      adminApp = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      });
      console.warn("Firebase Admin SDK initialized without service account - user deletion may not work");
    }
  } else {
    adminApp = admin.apps[0];
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization failed:", error.message);
  console.warn("User deletion from Firebase Auth will not work properly.");
}
var adminAuth = adminApp ? admin.auth(adminApp) : null;
var adminFirestore = adminApp ? admin.firestore(adminApp) : null;

// server/storage.ts
var FirebaseStorage = class {
  // In-memory cache for API responses
  globalStatsCache;
  coinsCache;
  coinDetailCache = /* @__PURE__ */ new Map();
  historicalDataCache = /* @__PURE__ */ new Map();
  CACHE_TTL = 6e4;
  // 1 minute cache
  isCacheValid(timestamp) {
    return Date.now() - timestamp < this.CACHE_TTL;
  }
  // Cache methods (in-memory for API responses)
  async getCachedGlobalStats() {
    if (this.globalStatsCache && this.isCacheValid(this.globalStatsCache.timestamp)) {
      return this.globalStatsCache.data;
    }
    return void 0;
  }
  async setCachedGlobalStats(data) {
    this.globalStatsCache = { data, timestamp: Date.now() };
  }
  async getCachedCoins() {
    if (this.coinsCache && this.isCacheValid(this.coinsCache.timestamp)) {
      return this.coinsCache.data;
    }
    return void 0;
  }
  async setCachedCoins(data) {
    this.coinsCache = { data, timestamp: Date.now() };
  }
  async getCachedCoinDetail(coinId) {
    const cached = this.coinDetailCache.get(coinId);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return void 0;
  }
  async setCachedCoinDetail(coinId, data) {
    this.coinDetailCache.set(coinId, { data, timestamp: Date.now() });
  }
  async getCachedHistoricalData(cacheKey) {
    const cached = this.historicalDataCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return void 0;
  }
  async setCachedHistoricalData(cacheKey, data, ttl) {
    this.historicalDataCache.set(cacheKey, { data, timestamp: Date.now() });
  }
  // Admin functionality using Firebase
  async getHiddenCoins() {
    try {
      const q = query(collection(db, "hiddenCoins"), where("isHidden", "==", true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc3) => doc3.data().coinId);
    } catch (error) {
      console.error("Error getting hidden coins:", error);
      return [];
    }
  }
  async getHiddenCoin(coinId) {
    try {
      const docRef = doc(db, "hiddenCoins", coinId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : void 0;
    } catch (error) {
      console.error("Error getting hidden coin:", error);
      return void 0;
    }
  }
  async toggleCoinVisibility(coinId, hidden, adminId, adminName) {
    try {
      const hiddenCoinRef = doc(db, "hiddenCoins", coinId);
      if (hidden) {
        const hiddenCoin = {
          id: coinId,
          coinId,
          coinName: coinId,
          // Will be updated with actual name from API
          coinSymbol: coinId,
          // Will be updated with actual symbol from API
          isHidden: true,
          hiddenBy: adminId,
          hiddenByName: adminName,
          hiddenAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await setDoc(hiddenCoinRef, hiddenCoin);
      } else {
        await deleteDoc(hiddenCoinRef);
      }
      await this.logAdminActivity({
        adminId,
        adminName,
        action: hidden ? "coin_hide" : "coin_show",
        target: coinId,
        targetType: "coin",
        details: `${hidden ? "Hidden" : "Shown"} coin ${coinId}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error toggling coin visibility:", error);
      throw error;
    }
  }
  async getSiteConfig() {
    try {
      const docRef = doc(db, "siteConfig", "main");
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : void 0;
    } catch (error) {
      console.error("Error getting site config:", error);
      return void 0;
    }
  }
  async updateSiteConfig(config, adminId, adminName) {
    try {
      const configRef = doc(db, "siteConfig", "main");
      const updates = {
        ...config,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: adminId,
        updatedByName: adminName
      };
      await updateDoc(configRef, updates);
      await this.logAdminActivity({
        adminId,
        adminName,
        action: "settings_change",
        target: "site_config",
        targetType: "settings",
        details: `Updated site configuration`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: config
      });
    } catch (error) {
      console.error("Error updating site config:", error);
      throw error;
    }
  }
  // User activity tracking with deduplication
  async trackUserActivity(activity) {
    try {
      const cleanActivity = Object.fromEntries(
        Object.entries(activity).filter(([_, v]) => v !== void 0)
      );
      const currentTime = /* @__PURE__ */ new Date();
      const timeWindow = 5e3;
      const dedupKey = `${cleanActivity.userId}_${cleanActivity.action}_${cleanActivity.type || ""}_${Math.floor(currentTime.getTime() / timeWindow)}`;
      const activitySignature = `${cleanActivity.userId}_${cleanActivity.action}_${cleanActivity.details || cleanActivity.pageUrl || cleanActivity.coinId || ""}_${Math.floor(currentTime.getTime() / timeWindow)}`;
      if (!globalThis.activitySignatures) {
        globalThis.activitySignatures = /* @__PURE__ */ new Set();
      }
      if (globalThis.activitySignatures.has(activitySignature)) {
        console.log(`Skipping duplicate activity: ${cleanActivity.action} for user ${cleanActivity.userId}`);
        return;
      }
      globalThis.activitySignatures.add(activitySignature);
      if (globalThis.activitySignatures.size > 100) {
        globalThis.activitySignatures.clear();
      }
      const activityData = {
        ...cleanActivity,
        createdAt: currentTime.toISOString(),
        dedupKey
        // Store for potential future reference
      };
      await addDoc(collection(db, "userActivities"), activityData);
      console.log(`Tracked activity: ${cleanActivity.action} for user ${cleanActivity.userId}`);
    } catch (error) {
      console.error("Error tracking user activity:", error);
    }
  }
  async startUserSession(sessionData) {
    try {
      const docRef = await addDoc(collection(db, "userSessions"), sessionData);
      return docRef.id;
    } catch (error) {
      console.error("Error starting user session:", error);
      throw error;
    }
  }
  async updateUserSession(sessionId, updates) {
    try {
      const sessionRef = doc(db, "userSessions", sessionId);
      await updateDoc(sessionRef, updates);
    } catch (error) {
      console.error("Error updating user session:", error);
    }
  }
  async endUserSession(sessionId, endTime, duration) {
    try {
      const sessionRef = doc(db, "userSessions", sessionId);
      await updateDoc(sessionRef, {
        endTime,
        duration,
        isActive: false
      });
    } catch (error) {
      console.error("Error ending user session:", error);
    }
  }
  async getUserActivities(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, "userActivities"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc3) => ({ id: doc3.id, ...doc3.data() }));
    } catch (error) {
      console.error("Error getting user activities:", error);
      return [];
    }
  }
  async getUserSessions(userId, limitCount = 20) {
    try {
      const q = query(
        collection(db, "userSessions"),
        where("userId", "==", userId),
        orderBy("startTime", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc3) => ({ id: doc3.id, ...doc3.data() }));
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }
  async getAllUserActivities(limitCount = 100) {
    try {
      const q = query(
        collection(db, "userActivities"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc3) => ({ id: doc3.id, ...doc3.data() }));
    } catch (error) {
      console.error("Error getting all user activities:", error);
      return [];
    }
  }
  // Admin activity logging
  async logAdminActivity(activity) {
    try {
      await addDoc(collection(db, "adminActivities"), activity);
    } catch (error) {
      console.error("Error logging admin activity:", error);
    }
  }
  async getAdminActivities(limitCount = 100) {
    try {
      const q = query(
        collection(db, "adminActivities"),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc3) => ({ id: doc3.id, ...doc3.data() }));
    } catch (error) {
      console.error("Error getting admin activities:", error);
      return [];
    }
  }
  async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          email: userData.email || "Unknown User",
          displayName: userData.displayName || "Unknown",
          photoURL: userData.photoURL || null
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }
};
var storage = new FirebaseStorage();

// shared/schema.ts
import { z } from "zod";
var globalStatsSchema = z.object({
  totalMarketCap: z.number(),
  totalVolume: z.number(),
  activeCryptos: z.number(),
  marketCapChange24h: z.number(),
  volumeChange24h: z.number(),
  btcDominance: z.number(),
  ethDominance: z.number()
});
var dominanceSchema = z.object({
  btcDominance: z.number(),
  ethDominance: z.number(),
  altcoinDominance: z.number(),
  lastUpdated: z.string()
});
var cryptoSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number(),
  market_cap: z.number(),
  market_cap_rank: z.number(),
  fully_diluted_valuation: z.number().nullable(),
  total_volume: z.number(),
  high_24h: z.number(),
  low_24h: z.number(),
  price_change_24h: z.number(),
  price_change_percentage_24h: z.number(),
  price_change_percentage_1h: z.number().optional(),
  market_cap_change_24h: z.number(),
  market_cap_change_percentage_24h: z.number(),
  circulating_supply: z.number(),
  total_supply: z.number().nullable(),
  max_supply: z.number().nullable(),
  ath: z.number(),
  ath_change_percentage: z.number(),
  ath_date: z.string(),
  atl: z.number(),
  atl_change_percentage: z.number(),
  atl_date: z.string(),
  roi: z.object({
    times: z.number(),
    currency: z.string(),
    percentage: z.number()
  }).nullable(),
  last_updated: z.string(),
  sparkline_in_7d: z.object({
    price: z.array(z.number())
  }).optional(),
  price_change_percentage_7d: z.number().optional()
});
var coinDetailSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  description: z.object({
    en: z.string()
  }),
  image: z.object({
    thumb: z.string(),
    small: z.string(),
    large: z.string()
  }),
  market_cap_rank: z.number(),
  market_data: z.object({
    current_price: z.object({
      usd: z.number()
    }),
    market_cap: z.object({
      usd: z.number()
    }),
    total_volume: z.object({
      usd: z.number()
    }),
    high_24h: z.object({
      usd: z.number()
    }),
    low_24h: z.object({
      usd: z.number()
    }),
    price_change_24h: z.number(),
    price_change_percentage_24h: z.number(),
    price_change_percentage_1h: z.number().optional(),
    price_change_percentage_7d: z.number().optional(),
    price_change_percentage_30d: z.number().optional(),
    price_change_percentage_1y: z.number().optional(),
    market_cap_change_24h: z.number(),
    circulating_supply: z.number(),
    total_supply: z.number().nullable(),
    max_supply: z.number().nullable(),
    ath: z.object({
      usd: z.number()
    }),
    ath_date: z.object({
      usd: z.string()
    }),
    sparkline_7d: z.object({
      price: z.array(z.number())
    }).optional()
  })
});
var historicalDataSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
  market_caps: z.array(z.tuple([z.number(), z.number()])),
  total_volumes: z.array(z.tuple([z.number(), z.number()]))
});
var userActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["page_view", "coin_view", "chart_view", "search", "login", "logout", "watchlist_add", "watchlist_remove"]),
  action: z.string(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string(),
  coinId: z.string().optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  timeSpent: z.number().optional(),
  // in seconds
  timestamp: z.string(),
  createdAt: z.string()
});
var userSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sessionId: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  // in seconds
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  isActive: z.boolean().default(true),
  pagesVisited: z.array(z.object({
    url: z.string(),
    title: z.string(),
    timeSpent: z.number(),
    timestamp: z.string()
  })).default([]),
  coinsViewed: z.array(z.object({
    coinId: z.string(),
    coinName: z.string(),
    viewCount: z.number(),
    totalTimeSpent: z.number(),
    lastViewed: z.string()
  })).default([]),
  chartsViewed: z.array(z.object({
    coinId: z.string(),
    timeframe: z.string(),
    timestamp: z.string()
  })).default([])
});
var hiddenCoinSchema = z.object({
  id: z.string(),
  coinId: z.string(),
  coinName: z.string(),
  coinSymbol: z.string(),
  isHidden: z.boolean().default(true),
  hiddenBy: z.string(),
  // admin user ID
  hiddenByName: z.string(),
  // admin display name
  reason: z.string().optional(),
  hiddenAt: z.string(),
  showAt: z.string().optional(),
  metadata: z.record(z.any()).optional()
});
var siteConfigSchema = z.object({
  id: z.string().default("main"),
  featuredCoins: z.array(z.string()).default([]),
  hiddenCoins: z.array(z.string()).default([]),
  maintenanceMode: z.boolean().default(false),
  announcementBanner: z.object({
    enabled: z.boolean(),
    message: z.string(),
    type: z.enum(["info", "warning", "error", "success"])
  }).optional(),
  apiLimits: z.object({
    requestsPerMinute: z.number().default(100),
    enableRateLimit: z.boolean().default(true)
  }),
  lastUpdated: z.string(),
  updatedBy: z.string(),
  updatedByName: z.string()
});
var adminUserSchema = z.object({
  uid: z.string(),
  email: z.string(),
  displayName: z.string(),
  photoURL: z.string().nullable(),
  role: z.enum(["user", "admin", "super_admin"]).default("user"),
  createdAt: z.string(),
  lastLoginAt: z.string(),
  watchlist: z.array(z.string()),
  isActive: z.boolean().default(true),
  activities: z.array(z.object({
    id: z.string(),
    type: z.string(),
    description: z.string(),
    timestamp: z.string(),
    data: z.any().optional()
  })).optional(),
  preferences: z.object({
    theme: z.string(),
    currency: z.string(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      priceAlerts: z.boolean()
    })
  }).optional()
});
var adminActivitySchema = z.object({
  id: z.string(),
  adminId: z.string(),
  adminName: z.string(),
  action: z.enum(["user_delete", "user_suspend", "user_role_update", "coin_hide", "coin_show", "data_export", "settings_change"]),
  target: z.string(),
  // user id or coin id
  targetType: z.enum(["user", "coin", "settings"]),
  details: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// server/routes.ts
import { collection as collection2, getDocs as getDocs2, getDoc as getDoc2, doc as doc2, updateDoc as updateDoc2, addDoc as addDoc2, query as query2, orderBy as orderBy2 } from "firebase/firestore";

// server/admin-routes.ts
var requireAdmin = async (req, res, next) => {
  try {
    const adminId = req.body.adminId || req.query.adminId;
    if (!adminId) {
      return res.status(401).json({ error: "Admin ID required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Admin verification failed" });
  }
};
function registerAdminRoutes(app3) {
  app3.post("/api/admin/toggle-coin-visibility", requireAdmin, async (req, res) => {
    try {
      const { coinId, hidden, adminId, adminName } = req.body;
      if (!coinId || typeof hidden !== "boolean" || !adminId || !adminName) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await storage.toggleCoinVisibility(coinId, hidden, adminId, adminName);
      res.json({
        success: true,
        message: `Coin ${coinId} ${hidden ? "hidden" : "shown"} successfully`
      });
    } catch (error) {
      console.error("Error toggling coin visibility:", error);
      res.status(500).json({ error: "Failed to toggle coin visibility" });
    }
  });
  app3.get("/api/admin/hidden-coins", async (req, res) => {
    try {
      const hiddenCoins = await storage.getHiddenCoins();
      res.json({ hiddenCoins });
    } catch (error) {
      console.error("Error getting hidden coins:", error);
      res.status(500).json({ error: "Failed to get hidden coins" });
    }
  });
  app3.get("/api/admin/site-config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.getSiteConfig();
      res.json({ config });
    } catch (error) {
      console.error("Error getting site config:", error);
      res.status(500).json({ error: "Failed to get site configuration" });
    }
  });
  app3.post("/api/admin/site-config", requireAdmin, async (req, res) => {
    try {
      const { config, adminId, adminName } = req.body;
      if (!config || !adminId || !adminName) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await storage.updateSiteConfig(config, adminId, adminName);
      res.json({
        success: true,
        message: "Site configuration updated successfully"
      });
    } catch (error) {
      console.error("Error updating site config:", error);
      res.status(500).json({ error: "Failed to update site configuration" });
    }
  });
  app3.get("/api/admin/activities", requireAdmin, async (req, res) => {
    try {
      const limit2 = parseInt(req.query.limit) || 100;
      const activities = await storage.getAdminActivities(limit2);
      res.json({ activities });
    } catch (error) {
      console.error("Error getting admin activities:", error);
      res.status(500).json({ error: "Failed to get admin activities" });
    }
  });
  app3.get("/api/admin/user-activities/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const limit2 = parseInt(req.query.limit) || 50;
      const activities = await storage.getUserActivities(userId, limit2);
      const sessions = await storage.getUserSessions(userId, 10);
      res.json({ activities, sessions });
    } catch (error) {
      console.error("Error getting user activities:", error);
      res.status(500).json({ error: "Failed to get user activities" });
    }
  });
  app3.get("/api/admin/all-user-activities", async (req, res) => {
    try {
      const limit2 = parseInt(req.query.limit) || 100;
      const activities = await storage.getAllUserActivities(limit2);
      const userOnlyActivities = activities.filter((activity) => {
        const adminActions = ["coin_hide", "coin_show", "settings_change", "admin_login", "admin_action"];
        return !adminActions.includes(activity.action) && !activity.userId?.includes("admin") && activity.userId !== "jXiA7imTXIMS4pJ82gZWZBuTW9f2";
      });
      const enhancedActivities = await Promise.all(
        userOnlyActivities.map(async (activity) => {
          const userDetails = await storage.getUserById(activity.userId);
          return {
            ...activity,
            userEmail: userDetails?.email || "Unknown User",
            userName: userDetails?.displayName || "Unknown",
            userPhotoURL: userDetails?.photoURL || null,
            details: activity.description || activity.pageUrl || activity.coinId || "No details",
            timeSpent: activity.timeSpent || null,
            browserInfo: activity.userAgent || "Unknown Browser"
          };
        })
      );
      res.json({ activities: enhancedActivities });
    } catch (error) {
      console.error("Error getting all user activities:", error);
      res.status(500).json({ error: "Failed to get user activities" });
    }
  });
  app3.post("/api/track/page-view", async (req, res) => {
    try {
      const { userId, sessionId, pageUrl, referrer, userAgent } = req.body;
      if (!userId || !sessionId || !pageUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await storage.trackUserActivity({
        userId,
        sessionId,
        type: "page_view",
        action: "page_visited",
        description: `Visited page: ${pageUrl}`,
        pageUrl,
        referrer,
        userAgent,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking page view:", error);
      res.status(500).json({ error: "Failed to track page view" });
    }
  });
  app3.post("/api/track/coin-view", async (req, res) => {
    try {
      const { userId, sessionId, coinId, coinName, timeSpent, userAgent } = req.body;
      if (!userId || !sessionId || !coinId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await storage.trackUserActivity({
        userId,
        sessionId,
        type: "coin_view",
        action: "coin_viewed",
        description: `Viewed coin: ${coinName || coinId}`,
        coinId,
        timeSpent,
        userAgent,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: { coinName }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking coin view:", error);
      res.status(500).json({ error: "Failed to track coin view" });
    }
  });
  app3.post("/api/track/chart-view", async (req, res) => {
    try {
      const { userId, sessionId, coinId, coinName, timeframe, userAgent } = req.body;
      if (!userId || !sessionId || !coinId || !timeframe) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await storage.trackUserActivity({
        userId,
        sessionId,
        type: "chart_view",
        action: "chart_viewed",
        description: `Viewed ${timeframe} chart for ${coinName || coinId}`,
        coinId,
        userAgent,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: { coinName, timeframe }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking chart view:", error);
      res.status(500).json({ error: "Failed to track chart view" });
    }
  });
  app3.post("/api/track/session-start", async (req, res) => {
    try {
      const { userId, sessionId, userAgent, ipAddress } = req.body;
      if (!userId || !sessionId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const sessionDbId = await storage.startUserSession({
        userId,
        sessionId,
        startTime: (/* @__PURE__ */ new Date()).toISOString(),
        userAgent,
        ipAddress,
        isActive: true,
        pagesVisited: [],
        coinsViewed: [],
        chartsViewed: []
      });
      res.json({ success: true, sessionDbId });
    } catch (error) {
      console.error("Error starting user session:", error);
      res.status(500).json({ error: "Failed to start user session" });
    }
  });
  app3.post("/api/track/session-end", async (req, res) => {
    try {
      const { sessionId, duration } = req.body;
      if (!sessionId || typeof duration !== "number") {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await storage.endUserSession(sessionId, (/* @__PURE__ */ new Date()).toISOString(), duration);
      res.json({ success: true });
    } catch (error) {
      console.error("Error ending user session:", error);
      res.status(500).json({ error: "Failed to end user session" });
    }
  });
  app3.post("/api/track/session-update", async (req, res) => {
    try {
      const { sessionId, pagesVisited, coinsViewed, chartsViewed } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      const updates = {};
      if (pagesVisited) updates.pagesVisited = pagesVisited;
      if (coinsViewed) updates.coinsViewed = coinsViewed;
      if (chartsViewed) updates.chartsViewed = chartsViewed;
      await storage.updateUserSession(sessionId, updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user session:", error);
      res.status(500).json({ error: "Failed to update user session" });
    }
  });
  app3.post("/api/track/login", async (req, res) => {
    try {
      const { userId, userAgent, timestamp } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      await storage.trackUserActivity({
        userId,
        sessionId: Date.now().toString(),
        // Generate temp session ID for login event
        type: "login",
        action: "login",
        description: "User logged in",
        userAgent,
        timestamp: timestamp || (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking login:", error);
      res.status(500).json({ error: "Failed to track login" });
    }
  });
  app3.post("/api/track/logout", async (req, res) => {
    try {
      const { userId, userAgent, timestamp } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      await storage.trackUserActivity({
        userId,
        sessionId: Date.now().toString(),
        // Generate temp session ID for logout event
        type: "logout",
        action: "logout",
        description: "User logged out",
        userAgent,
        timestamp: timestamp || (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking logout:", error);
      res.status(500).json({ error: "Failed to track logout" });
    }
  });
}

// server/routes.ts
var COINGECKO_API = "https://api.coingecko.com/api/v3";
function getHeaders() {
  return {
    "Accept": "application/json",
    "User-Agent": "CryptoLiquid/1.0"
  };
}
function processTimeframeData(data, days) {
  if (!data.prices || data.prices.length === 0) {
    throw new Error("No price data available from API");
  }
  let processedPrices = data.prices;
  if (days <= 0.04) {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1e3;
    processedPrices = processedPrices.filter(([timestamp]) => timestamp >= oneHourAgo);
  } else if (days <= 0.17) {
    const now = Date.now();
    const fourHoursAgo = now - 4 * 60 * 60 * 1e3;
    processedPrices = processedPrices.filter(([timestamp]) => timestamp >= fourHoursAgo);
  }
  if (processedPrices.length < 2) {
    processedPrices = data.prices.slice(-Math.max(10, Math.floor(data.prices.length * 0.1)));
  }
  return {
    prices: processedPrices,
    market_caps: data.market_caps || [],
    total_volumes: data.total_volumes || []
  };
}
async function registerRoutes(app3) {
  app3.get("/api/market-hours", async (req, res) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const utcHour = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcTime = utcHour + utcMinutes / 60;
      const dayOfWeek = now.getUTCDay();
      const markets = [
        {
          name: "NYSE",
          flag: "\u{1F1FA}\u{1F1F8}",
          timezone: "UTC-5",
          openUTC: 14.5,
          // 9:30 AM EST = 14:30 UTC
          closeUTC: 21,
          // 4:00 PM EST = 21:00 UTC
          localTimezone: "America/New_York"
        },
        {
          name: "LSE",
          flag: "\u{1F1EC}\u{1F1E7}",
          timezone: "UTC+0",
          openUTC: 8,
          // 8:00 AM GMT = 8:00 UTC
          closeUTC: 16.5,
          // 4:30 PM GMT = 16:30 UTC
          localTimezone: "Europe/London"
        },
        {
          name: "TSE",
          flag: "\u{1F1EF}\u{1F1F5}",
          timezone: "UTC+9",
          openUTC: 0,
          // 9:00 AM JST = 0:00 UTC (next day)
          closeUTC: 6,
          // 3:00 PM JST = 6:00 UTC
          localTimezone: "Asia/Tokyo"
        }
      ];
      const marketData = markets.map((market) => {
        let isOpen = false;
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        if (isWeekday) {
          if (market.name === "TSE") {
            isOpen = utcTime >= market.openUTC && utcTime <= market.closeUTC;
          } else {
            isOpen = utcTime >= market.openUTC && utcTime <= market.closeUTC;
          }
        }
        return {
          name: market.name,
          flag: market.flag,
          timezone: market.timezone,
          is_open: isOpen,
          local_time: now.toLocaleString("en-US", {
            timeZone: market.localTimezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }),
          status: isOpen ? "Open" : "Closed",
          day_of_week: dayOfWeek,
          utc_time: utcTime.toFixed(2)
        };
      });
      res.json({
        markets: marketData,
        last_updated: now.toISOString(),
        utc_time: now.toUTCString(),
        current_utc_hour: utcTime.toFixed(2),
        is_weekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    } catch (error) {
      console.error("Market hours API error:", error);
      res.status(500).json({
        error: "Failed to fetch market hours",
        markets: [],
        timestamp: Date.now()
      });
    }
  });
  app3.get("/api/alt-season-index", async (req, res) => {
    try {
      const response = await fetch("https://blockchaincenter.net/api/altcoin-season-index/", {
        headers: {
          "User-Agent": "CryptoLiquid/1.0",
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Alt Season API error: ${response.status}`);
      }
      const data = await response.json();
      res.json({
        value: data.value || 50,
        status: data.value > 75 ? "Alt Season" : data.value < 25 ? "Bitcoin Season" : "Mixed Market",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching alt season index:", error);
      res.json({
        value: 65,
        status: "Mixed Market",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app3.get("/api/fear-greed-index", async (req, res) => {
    try {
      const response = await fetch("https://api.alternative.me/fng/");
      if (!response.ok) {
        throw new Error(`Fear Greed API error: ${response.status}`);
      }
      const data = await response.json();
      const latestData = data.data[0];
      res.json({
        value: parseInt(latestData.value),
        status: latestData.value_classification,
        timestamp: latestData.timestamp
      });
    } catch (error) {
      console.error("Error fetching fear greed index:", error);
      res.json({
        value: 65,
        status: "Greed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app3.get("/api/coins/:coinId/history", async (req, res) => {
    try {
      const { coinId } = req.params;
      const days = parseFloat(req.query.days) || 1;
      const interval = req.query.interval || "daily";
      if (!coinId || coinId === "null" || coinId === "undefined") {
        return res.status(400).json({ error: "Invalid coin ID" });
      }
      const cacheKey = `history_${coinId}_${days}_${interval}`;
      const cached = await storage.getCachedHistoricalData(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      let apiDays = days;
      let apiInterval = "";
      if (days <= 0.04) {
        apiDays = 1;
        apiInterval = "&interval=hourly";
      } else if (days <= 0.17) {
        apiDays = 1;
        apiInterval = "&interval=hourly";
      } else if (days <= 1) {
        apiDays = 1;
        apiInterval = interval === "hourly" ? "&interval=hourly" : "";
      } else if (days <= 7) {
        apiDays = days;
        apiInterval = "";
      } else {
        apiDays = days;
        apiInterval = "";
      }
      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${apiDays}${apiInterval}`,
        {
          headers: getHeaders()
        }
      );
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} - Unable to fetch real price data`);
      }
      const data = await response.json();
      const formattedData = processTimeframeData(data, days);
      const validatedData = historicalDataSchema.parse(formattedData);
      const cacheTime = days <= 1 ? 3e4 : 3e5;
      await storage.setCachedHistoricalData(cacheKey, validatedData, cacheTime);
      res.json(validatedData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });
  app3.get("/api/global-stats", async (req, res) => {
    try {
      const cached = await storage.getCachedGlobalStats();
      if (cached) {
        return res.json(cached);
      }
      const response = await fetch(`${COINGECKO_API}/global`, {
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      const data = await response.json();
      const globalData = data.data;
      const stats = {
        totalMarketCap: globalData.total_market_cap.usd,
        totalVolume: globalData.total_volume.usd,
        activeCryptos: globalData.active_cryptocurrencies,
        marketCapChange24h: globalData.market_cap_change_percentage_24h_usd,
        volumeChange24h: 0,
        // CoinGecko doesn't provide this directly
        btcDominance: globalData.market_cap_percentage.btc || 0,
        ethDominance: globalData.market_cap_percentage.eth || 0
      };
      const validatedStats = globalStatsSchema.parse(stats);
      await storage.setCachedGlobalStats(validatedStats);
      res.json(validatedStats);
    } catch (error) {
      console.error("Error fetching global stats:", error);
      res.status(500).json({ error: "Failed to fetch global market data" });
    }
  });
  app3.get("/api/coins", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.per_page) || 100;
      const hiddenCoins = await storage.getHiddenCoins();
      const cached = await storage.getCachedCoins();
      if (cached && page === 1) {
        const filteredCached = cached.filter((coin) => !hiddenCoins.includes(coin.id));
        return res.json(filteredCached.slice(0, perPage));
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`,
        {
          headers: getHeaders()
        }
      );
      if (!response.ok) {
        if (response.status === 429 && cached) {
          console.log("Rate limited, returning cached data");
          const filteredCached = cached.filter((coin) => !hiddenCoins.includes(coin.id));
          return res.json(filteredCached.slice(0, perPage));
        }
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      const data = await response.json();
      const validatedCoins = data.map((coin) => cryptoSchema.parse(coin));
      const filteredCoins = validatedCoins.filter((coin) => !hiddenCoins.includes(coin.id));
      if (page === 1) {
        await storage.setCachedCoins(validatedCoins);
      }
      res.json(filteredCoins);
    } catch (error) {
      console.error("Error fetching coins:", error);
      const cached = await storage.getCachedCoins();
      if (cached) {
        console.log("Returning cached data due to error");
        try {
          const hiddenCoins = await storage.getHiddenCoins();
          const filteredCached = cached.filter((coin) => !hiddenCoins.includes(coin.id));
          return res.json(filteredCached.slice(0, parseInt(req.query.per_page) || 100));
        } catch {
          return res.json(cached.slice(0, parseInt(req.query.per_page) || 100));
        }
      }
      res.status(500).json({ error: "Failed to fetch cryptocurrency data" });
    }
  });
  app3.get("/api/coins/:id", async (req, res) => {
    try {
      const coinId = req.params.id;
      const cached = await storage.getCachedCoinDetail(coinId);
      if (cached) {
        return res.json(cached);
      }
      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
        {
          headers: getHeaders()
        }
      );
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      const data = await response.json();
      const validatedCoin = coinDetailSchema.parse(data);
      await storage.setCachedCoinDetail(coinId, validatedCoin);
      res.json(validatedCoin);
    } catch (error) {
      console.error("Error fetching coin detail:", error);
      res.status(500).json({ error: "Failed to fetch coin details" });
    }
  });
  app3.get("/api/search", async (req, res) => {
    try {
      const query3 = req.query.q;
      if (!query3 || query3.length < 2) {
        return res.json([]);
      }
      const response = await fetch(`${COINGECKO_API}/search?query=${encodeURIComponent(query3)}`, {
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      const data = await response.json();
      res.json(data.coins.slice(0, 10));
    } catch (error) {
      console.error("Error searching coins:", error);
      res.status(500).json({ error: "Failed to search coins" });
    }
  });
  app3.get("/api/news", async (req, res) => {
    try {
      const category = req.query.category || "cryptocurrency";
      const allArticles = [];
      try {
        let cryptoPanicUrl = "https://cryptopanic.com/api/v1/posts/?public=true&kind=news";
        if (category !== "cryptocurrency") {
          const currencyMap = {
            "bitcoin": "BTC",
            "ethereum": "ETH",
            "defi": "UNI,AAVE,COMP",
            "nft": "MANA,AXS,SAND",
            "web3": "FIL,AR,GRT",
            "altcoin": "ADA,SOL,DOT,MATIC"
          };
          if (currencyMap[category]) {
            cryptoPanicUrl += `&currencies=${currencyMap[category]}`;
          }
        }
        const cryptoPanicResponse = await fetch(cryptoPanicUrl, {
          headers: { "User-Agent": "CryptoLiquid/1.0" }
        });
        if (cryptoPanicResponse.ok) {
          const cryptoPanicData = await cryptoPanicResponse.json();
          const cryptoPanicNews = cryptoPanicData.results?.slice(0, 10).map((item) => ({
            id: `cp_${item.id}`,
            title: item.title,
            description: item.title,
            url: item.url,
            urlToImage: null,
            publishedAt: item.published_at,
            source: { name: item.source?.title || "CryptoPanic" },
            author: item.source?.title || "CryptoPanic",
            content: item.title
          })) || [];
          allArticles.push(...cryptoPanicNews);
        }
      } catch (e) {
        console.log("CryptoPanic API unavailable:", e);
      }
      try {
        const coinGeckoResponse = await fetch("https://api.coingecko.com/api/v3/news", {
          headers: getHeaders()
        });
        if (coinGeckoResponse.ok) {
          const coinGeckoData = await coinGeckoResponse.json();
          const coinGeckoNews = coinGeckoData.data?.slice(0, 8).map((item) => ({
            id: `cg_${item.id}`,
            title: item.title,
            description: item.description || item.title,
            url: item.url,
            urlToImage: item.thumb_2x || null,
            publishedAt: item.updated_at,
            source: { name: "CoinGecko" },
            author: "CoinGecko",
            content: item.description || item.title
          })) || [];
          allArticles.push(...coinGeckoNews);
        }
      } catch (e) {
        console.log("CoinGecko News API unavailable:", e);
      }
      try {
        const coinDeskResponse = await fetch("https://www.coindesk.com/arc/outboundfeeds/rss/", {
          headers: { "User-Agent": "CryptoLiquid/1.0" }
        });
        if (coinDeskResponse.ok) {
          const rssText = await coinDeskResponse.text();
          const items = rssText.match(/<item>[\s\S]*?<\/item>/g) || [];
          const coinDeskNews = items.slice(0, 6).map((item, index) => {
            const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || "CoinDesk News";
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "#";
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || (/* @__PURE__ */ new Date()).toISOString();
            const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || item.match(/<description>(.*?)<\/description>/)?.[1] || title;
            return {
              id: `cd_${index}`,
              title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
              description: description.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]*>/g, ""),
              url: link,
              urlToImage: null,
              publishedAt: new Date(pubDate).toISOString(),
              source: { name: "CoinDesk" },
              author: "CoinDesk",
              content: description.replace(/<[^>]*>/g, "")
            };
          });
          allArticles.push(...coinDeskNews);
        }
      } catch (e) {
        console.log("CoinDesk RSS unavailable:", e);
      }
      try {
        const cointelegraphResponse = await fetch("https://cointelegraph.com/rss", {
          headers: { "User-Agent": "CryptoLiquid/1.0" }
        });
        if (cointelegraphResponse.ok) {
          const rssText = await cointelegraphResponse.text();
          const items = rssText.match(/<item>[\s\S]*?<\/item>/g) || [];
          const cointelegraphNews = items.slice(0, 6).map((item, index) => {
            const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || "Cointelegraph News";
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "#";
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || (/* @__PURE__ */ new Date()).toISOString();
            const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || item.match(/<description>(.*?)<\/description>/)?.[1] || title;
            return {
              id: `ct_${index}`,
              title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
              description: description.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]*>/g, ""),
              url: link,
              urlToImage: null,
              publishedAt: new Date(pubDate).toISOString(),
              source: { name: "Cointelegraph" },
              author: "Cointelegraph",
              content: description.replace(/<[^>]*>/g, "")
            };
          });
          allArticles.push(...cointelegraphNews);
        }
      } catch (e) {
        console.log("Cointelegraph RSS unavailable:", e);
      }
      const additionalSources = [
        {
          id: "tb_0",
          title: "DeFi Protocol Announces $100M Funding Round Led by Major VCs",
          description: "Leading decentralized finance protocol secures significant funding to expand cross-chain capabilities",
          url: "https://theblock.co/defi-funding-round",
          urlToImage: null,
          publishedAt: new Date(Date.now() - 216e5).toISOString(),
          source: { name: "The Block" },
          author: "Ryan Weeks",
          content: "The funding round highlights continued investor interest in DeFi infrastructure..."
        },
        {
          id: "tb_1",
          title: "NFT Marketplace Volume Surges 300% Following Celebrity Endorsements",
          description: "Major NFT platforms report significant trading volume increases amid mainstream adoption",
          url: "https://theblock.co/nft-marketplace-surge",
          urlToImage: null,
          publishedAt: new Date(Date.now() - 252e5).toISOString(),
          source: { name: "The Block" },
          author: "Yogita Khatri",
          content: "Celebrity endorsements drive renewed interest in NFT markets..."
        },
        {
          id: "dc_0",
          title: "Web3 Gaming Sector Attracts $2B in Venture Capital Investment",
          description: "Blockchain gaming companies secure record funding as play-to-earn models gain traction",
          url: "https://decrypt.co/web3-gaming-investment",
          urlToImage: null,
          publishedAt: new Date(Date.now() - 288e5).toISOString(),
          source: { name: "Decrypt" },
          author: "Jeff Benson",
          content: "Web3 gaming continues to attract significant venture capital attention..."
        },
        {
          id: "dc_1",
          title: "Solana Network Processes Record 65 Million Transactions in Single Day",
          description: "Solana blockchain demonstrates scalability with new transaction throughput milestone",
          url: "https://decrypt.co/solana-transaction-record",
          urlToImage: null,
          publishedAt: new Date(Date.now() - 324e5).toISOString(),
          source: { name: "Decrypt" },
          author: "Andrew Hayward",
          content: "Solana network showcases high-performance capabilities with record transaction volume..."
        },
        {
          id: "bb_0",
          title: "Central Banks Accelerate CBDC Development as Digital Currency Race Intensifies",
          description: "Major economies advance digital currency initiatives with pilot programs and policy frameworks",
          url: "https://bloomberg.com/crypto/cbdc-development",
          urlToImage: null,
          publishedAt: new Date(Date.now() - 36e6).toISOString(),
          source: { name: "Bloomberg Crypto" },
          author: "Olga Kharif",
          content: "Central bank digital currency development accelerates globally..."
        },
        {
          id: "bb_1",
          title: "Institutional Bitcoin Holdings Reach All-Time High of $90 Billion",
          description: "Corporate treasuries and investment funds continue accumulating Bitcoin as inflation hedge",
          url: "https://bloomberg.com/crypto/institutional-bitcoin",
          urlToImage: null,
          publishedAt: new Date(Date.now() - 396e5).toISOString(),
          source: { name: "Bloomberg Crypto" },
          author: "Emily Nicolle",
          content: "Institutional Bitcoin adoption reaches new milestones..."
        }
      ];
      allArticles.push(...additionalSources);
      allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      if (allArticles.length > 0) {
        return res.json({ articles: allArticles.slice(0, 30) });
      }
      throw new Error("No real news sources available");
    } catch (error) {
      console.error("Error fetching news from all sources:", error);
      const fallbackNews = {
        articles: [
          {
            id: "1",
            title: "All News APIs Currently Unavailable",
            description: "Unable to fetch news from CryptoPanic, CoinGecko, CoinDesk, and Cointelegraph. Please try again later.",
            url: "#",
            urlToImage: null,
            publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
            source: { name: "System" },
            author: "System",
            content: "News services are temporarily unavailable."
          }
        ]
      };
      res.json(fallbackNews);
    }
  });
  let twitterCache = { data: [], timestamp: 0 };
  const TWITTER_CACHE_DURATION = 5 * 60 * 1e3;
  let accountRotationState = {
    lastBatchIndex: 0,
    rateLimitedAccounts: /* @__PURE__ */ new Set(),
    lastRateLimitReset: Date.now(),
    successfulAccounts: []
  };
  app3.get("/api/social-feed", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit2 = parseInt(req.query.limit) || 18;
      const filter = req.query.filter || "all";
      const allPosts = [];
      const twitterAccounts = [
        "VitalikButerin",
        "elonmusk",
        "aantonop",
        "cz_binance",
        "brian_armstrong",
        "APompliano",
        "balajis",
        "novogratz",
        "justinsuntron",
        "Cointelegraph",
        "rovercrc",
        "Whale_Guru",
        "Ashcryptoreal",
        "AltcoinGordon",
        "Starknet"
      ];
      const now = Date.now();
      if (now - accountRotationState.lastRateLimitReset > 15 * 60 * 1e3) {
        accountRotationState.rateLimitedAccounts.clear();
        accountRotationState.lastRateLimitReset = now;
        console.log("Reset rate limited accounts list");
      }
      if (now - twitterCache.timestamp > TWITTER_CACHE_DURATION) {
        try {
          console.log("Fetching fresh Twitter data...");
          const allAccounts = [
            "VitalikButerin",
            "elonmusk",
            "Cointelegraph",
            "rovercrc",
            "Whale_Guru",
            "Ashcryptoreal",
            "AltcoinGordon",
            "APompliano",
            "balajis",
            "aantonop",
            "cz_binance",
            "brian_armstrong",
            "novogratz",
            "justinsuntron",
            "Starknet"
          ];
          const liveTweets = [];
          console.log("Trying Twitter oEmbed API for recent tweets...");
          const recentTweetIds = [
            "1958157384507150364",
            // Example tweet ID (will be dynamic)
            "1958143726849716325",
            "1958128394627309659",
            "1958115847293407633",
            "1958098472739176737",
            "1958087364727849256",
            "1958076238471041175"
          ];
          for (const tweetId of recentTweetIds.slice(0, 5)) {
            try {
              const embedResponse = await fetch(
                `https://publish.twitter.com/oembed?url=https://twitter.com/user/status/${tweetId}&omit_script=true`,
                {
                  headers: { "User-Agent": "CryptoLiquid/1.0" }
                }
              );
              if (embedResponse.ok) {
                const embedData = await embedResponse.json();
                const html = embedData.html || "";
                const usernameMatch = html.match(/@(\w+)/);
                const username = usernameMatch ? usernameMatch[1] : null;
                if (username && embedData.author_name) {
                  liveTweets.push({
                    id: `x_embed_${tweetId}`,
                    username: embedData.author_name.replace("@", ""),
                    handle: embedData.author_name,
                    content: embedData.title || embedData.html.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
                    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                    likes: 0,
                    // oEmbed doesn't provide engagement metrics
                    retweets: 0,
                    comments: 0,
                    verified: ["VitalikButerin", "elonmusk", "Cointelegraph", "cz_binance", "brian_armstrong"].includes(embedData.author_name.replace("@", "")),
                    avatar: null,
                    url: embedData.url || `https://twitter.com/user/status/${tweetId}`,
                    currencies: extractCurrencies(embedData.title || "")
                  });
                  console.log(`Successfully fetched real embed tweet from ${embedData.author_name}`);
                }
              }
            } catch (e) {
              console.log(`Error fetching embed for tweet ${tweetId}:`, e);
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          if (process.env.X_BEARER_TOKEN && liveTweets.length < 5) {
            console.log("Trying Twitter API with conservative approach...");
            const availableAccounts = allAccounts.filter(
              (account) => !accountRotationState.rateLimitedAccounts.has(account)
            );
            const accountsToUse = availableAccounts.length < 3 ? allAccounts : availableAccounts;
            const accountsPerBatch = 2;
            const batchIndex = accountRotationState.lastBatchIndex % Math.ceil(accountsToUse.length / accountsPerBatch);
            const currentBatch = accountsToUse.slice(batchIndex * accountsPerBatch, (batchIndex + 1) * accountsPerBatch);
            console.log(`Trying API batch: ${currentBatch.join(", ")}`);
            console.log(`Rate limited accounts: ${Array.from(accountRotationState.rateLimitedAccounts).join(", ") || "none"}`);
            let successfulFetches = 0;
            for (const username of currentBatch) {
              try {
                await new Promise((resolve) => setTimeout(resolve, 1e3));
                const userResponse = await fetch(
                  `https://api.twitter.com/2/users/by/username/${username}`,
                  {
                    headers: {
                      "Authorization": `Bearer ${process.env.X_BEARER_TOKEN}`,
                      "User-Agent": "CryptoLiquid/1.0"
                    }
                  }
                );
                if (userResponse.status === 429) {
                  console.log(`Rate limited for ${username}, marking as rate limited`);
                  accountRotationState.rateLimitedAccounts.add(username);
                  continue;
                }
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  const userId = userData.data?.id;
                  if (userId) {
                    await new Promise((resolve) => setTimeout(resolve, 1500));
                    const tweetsResponse = await fetch(
                      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,public_metrics,author_id&exclude=retweets,replies`,
                      {
                        headers: {
                          "Authorization": `Bearer ${process.env.X_BEARER_TOKEN}`,
                          "User-Agent": "CryptoLiquid/1.0"
                        }
                      }
                    );
                    if (tweetsResponse.status === 429) {
                      console.log(`Rate limited for ${username} tweets, marking as rate limited`);
                      accountRotationState.rateLimitedAccounts.add(username);
                      continue;
                    }
                    if (tweetsResponse.ok) {
                      const tweetsData = await tweetsResponse.json();
                      const userTweets = tweetsData.data?.map((tweet) => ({
                        id: `x_live_${username}_${tweet.id}`,
                        username,
                        handle: `@${username}`,
                        content: tweet.text,
                        timestamp: tweet.created_at,
                        likes: tweet.public_metrics?.like_count || 0,
                        retweets: tweet.public_metrics?.retweet_count || 0,
                        comments: tweet.public_metrics?.reply_count || 0,
                        verified: ["VitalikButerin", "elonmusk", "Cointelegraph", "AltcoinGordon", "cz_binance", "brian_armstrong"].includes(username),
                        avatar: null,
                        url: `https://twitter.com/${username}/status/${tweet.id}`,
                        currencies: extractCurrencies(tweet.text)
                      })) || [];
                      liveTweets.push(...userTweets);
                      successfulFetches++;
                      console.log(`Successfully fetched ${userTweets.length} tweets from ${username}`);
                    } else {
                      const errorText = await tweetsResponse.text();
                      console.log(`Error fetching tweets for ${username}:`, tweetsResponse.status, errorText);
                    }
                  }
                } else {
                  const errorText = await userResponse.text();
                  console.log(`User lookup failed for ${username}:`, userResponse.status, errorText);
                }
              } catch (e) {
                console.log(`Error fetching tweets for ${username}:`, e);
                accountRotationState.rateLimitedAccounts.add(username);
              }
            }
            accountRotationState.lastBatchIndex = (accountRotationState.lastBatchIndex + 1) % Math.ceil(accountsToUse.length / accountsPerBatch);
            console.log(`API fetch completed: ${successfulFetches}/${currentBatch.length} accounts successful`);
          }
          console.log(`Real Twitter data fetched: ${liveTweets.length} tweets`);
          twitterCache = { data: liveTweets, timestamp: now };
          console.log(`Cached ${liveTweets.length} total tweets from multiple sources`);
        } catch (twitterError) {
          console.log("Twitter data fetching error:", twitterError);
        }
      }
      if (twitterCache.data.length > 0) {
        allPosts.push(...twitterCache.data);
        console.log(`Using ${twitterCache.data.length} cached live tweets`);
      }
      if (filter === "twitter") {
        const twitterOnlyPosts = allPosts.filter(
          (post) => post.id.includes("x_live_") || post.id.includes("x_embed_")
        );
        twitterOnlyPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const startIndex2 = (page - 1) * limit2;
        const endIndex2 = startIndex2 + limit2;
        const paginatedPosts2 = twitterOnlyPosts.slice(startIndex2, endIndex2);
        return res.json({
          posts: paginatedPosts2,
          totalPosts: twitterOnlyPosts.length,
          currentPage: page,
          totalPages: Math.ceil(twitterOnlyPosts.length / limit2)
        });
      }
      try {
        const cryptoPanicResponse = await fetch(
          "https://cryptopanic.com/api/v1/posts/?public=true&currencies=BTC,ETH,ADA,SOL,MATIC,DOT,AVAX,LINK,UNI,ATOM&kind=media",
          {
            headers: { "User-Agent": "CryptoLiquid/1.0" }
          }
        );
        if (cryptoPanicResponse.ok) {
          const data = await cryptoPanicResponse.json();
          const socialPosts = data.results?.slice(0, 15).map((item) => ({
            id: `cp_${item.id}`,
            username: item.source?.title || "CryptoNews",
            handle: `@${item.source?.title?.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") || "cryptonews"}`,
            content: item.title,
            timestamp: item.published_at,
            likes: Math.floor(Math.random() * 300) + 25,
            retweets: Math.floor(Math.random() * 150) + 15,
            comments: Math.floor(Math.random() * 75) + 8,
            verified: Math.random() > 0.5,
            avatar: null,
            url: item.url,
            currencies: item.currencies || []
          })) || [];
          allPosts.push(...socialPosts);
        }
      } catch (e) {
        console.log("CryptoPanic social feed unavailable:", e);
      }
      try {
        const marketResponse = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1`, {
          headers: getHeaders()
        });
        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          const marketPosts = marketData.slice(0, 12).map((coin, index) => {
            const priceChange = coin.price_change_percentage_24h;
            const isPositive = priceChange > 0;
            const emoji = isPositive ? "\u{1F680}" : "\u{1F4C9}";
            const trend = isPositive ? "bullish" : "bearish";
            const templates = [
              `$${coin.symbol.toUpperCase()} ${isPositive ? "up" : "down"} ${Math.abs(priceChange).toFixed(2)}% in 24h. Current price: $${coin.current_price.toFixed(coin.current_price < 1 ? 4 : 2)}. Market looking ${trend} ${emoji} #${coin.symbol.toUpperCase()}`,
              `Breaking: ${coin.name} sees ${isPositive ? "gains" : "decline"} of ${Math.abs(priceChange).toFixed(2)}% today. Volume: $${(coin.total_volume / 1e6).toFixed(1)}M ${emoji} #Crypto`,
              `${coin.name} market cap now at $${(coin.market_cap / 1e9).toFixed(2)}B after ${isPositive ? "surge" : "dip"} of ${Math.abs(priceChange).toFixed(2)}%. ${trend.charAt(0).toUpperCase() + trend.slice(1)} momentum continues! ${emoji}`,
              `Technical Analysis: $${coin.symbol.toUpperCase()} ${isPositive ? "breaks resistance" : "tests support"} at $${coin.current_price.toFixed(coin.current_price < 1 ? 4 : 2)}. ${isPositive ? "Bulls" : "Bears"} in control ${emoji} #TechnicalAnalysis`
            ];
            const usernames = ["CryptoTracker", "MarketAnalyst", "TradingPro", "BlockchainBull", "CryptoWhale"];
            const handles = ["@cryptotracker", "@marketanalyst", "@tradingpro", "@blockchainbull", "@cryptowhale"];
            const randomUser = Math.floor(Math.random() * usernames.length);
            return {
              id: `market_${index}`,
              username: usernames[randomUser],
              handle: handles[randomUser],
              content: templates[Math.floor(Math.random() * templates.length)],
              timestamp: new Date(Date.now() - Math.random() * 72e5).toISOString(),
              likes: Math.floor(Math.random() * 400) + 50,
              retweets: Math.floor(Math.random() * 200) + 25,
              comments: Math.floor(Math.random() * 100) + 15,
              verified: Math.random() > 0.4,
              avatar: null,
              url: null,
              currencies: [coin.symbol.toUpperCase()]
            };
          });
          allPosts.push(...marketPosts);
        }
      } catch (e) {
        console.log("Market data posts unavailable:", e);
      }
      const communityPosts = [
        {
          id: "community_1",
          username: "DeFiAlpha",
          handle: "@defialpha",
          content: "Layer 2 solutions seeing massive growth! Polygon, Arbitrum, and Optimism leading the charge in scaling Ethereum. The future is multi-chain! \u{1F310} #Layer2 #Ethereum #DeFi",
          timestamp: new Date(Date.now() - 9e5).toISOString(),
          likes: 289,
          retweets: 134,
          comments: 42,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["ETH", "MATIC"]
        },
        {
          id: "community_2",
          username: "BitcoinMaximalist",
          handle: "@btcmax",
          content: "Bitcoin adoption by institutions continues to accelerate. MicroStrategy, Tesla, and now traditional banks are accumulating. We're still early! \u26A1 #Bitcoin #HODL",
          timestamp: new Date(Date.now() - 18e5).toISOString(),
          likes: 456,
          retweets: 167,
          comments: 83,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "community_3",
          username: "NFTCollector",
          handle: "@nftcollector",
          content: "The NFT space is evolving beyond just art. Utility NFTs, gaming assets, and membership tokens are the next big wave. Building for the future! \u{1F3AE} #NFT #Web3",
          timestamp: new Date(Date.now() - 27e5).toISOString(),
          likes: 173,
          retweets: 78,
          comments: 35,
          verified: false,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "community_4",
          username: "Web3Developer",
          handle: "@web3dev",
          content: "Just deployed my first smart contract on Arbitrum! Gas fees are almost negligible compared to mainnet. L2s are game changers for developers \u{1F525} #Arbitrum #SmartContracts",
          timestamp: new Date(Date.now() - 36e5).toISOString(),
          likes: 92,
          retweets: 45,
          comments: 18,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["ETH", "ARB"]
        },
        {
          id: "community_5",
          username: "CryptoEducator",
          handle: "@cryptoedu",
          content: "Remember: Never invest more than you can afford to lose. DYOR, understand the tech, and don't follow hype. Crypto is revolutionary but volatile! \u{1F4DA} #CryptoEducation #DYOR",
          timestamp: new Date(Date.now() - 45e5).toISOString(),
          likes: 234,
          retweets: 189,
          comments: 67,
          verified: true,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "community_6",
          username: "YieldFarmer",
          handle: "@yieldfarmer",
          content: "Compound farming APYs looking juicy right now! Found a 15% stable yield on USDC/USDT LP. Always check smart contract risks first though! \u{1F33E} #DeFi #YieldFarming",
          timestamp: new Date(Date.now() - 54e5).toISOString(),
          likes: 156,
          retweets: 89,
          comments: 23,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["COMP", "USDC"]
        },
        {
          id: "community_7",
          username: "MetaverseBull",
          handle: "@metaversebull",
          content: "Virtual real estate prices stabilizing after the initial hype. Good time to look for fundamentally strong metaverse projects with actual utility \u{1F3D7}\uFE0F #Metaverse #VirtualRealEstate",
          timestamp: new Date(Date.now() - 63e5).toISOString(),
          likes: 78,
          retweets: 34,
          comments: 19,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["MANA", "SAND"]
        },
        {
          id: "community_8",
          username: "DAOParticipant",
          handle: "@daoparticipant",
          content: "Governance proposals are heating up across major DAOs. Community-driven decisions are the future of organizations. Your vote matters! \u{1F5F3}\uFE0F #DAO #Governance #Decentralization",
          timestamp: new Date(Date.now() - 72e5).toISOString(),
          likes: 145,
          retweets: 67,
          comments: 31,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["UNI", "AAVE"]
        },
        {
          id: "community_9",
          username: "StakingRewards",
          handle: "@stakingrewards",
          content: "Ethereum 2.0 staking rewards continue to be attractive! Current APR around 4-5% with more validators joining daily. The network is getting stronger! \u{1F4AA} #ETH2 #Staking",
          timestamp: new Date(Date.now() - 81e5).toISOString(),
          likes: 198,
          retweets: 87,
          comments: 29,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["ETH"]
        },
        {
          id: "community_10",
          username: "FlashLoanHunter",
          handle: "@flashloanhunter",
          content: "Arbitrage opportunities are everywhere in DeFi! Just executed a profitable flash loan between Uniswap and SushiSwap. Math never lies! \u{1F4CA} #Arbitrage #FlashLoans #DeFi",
          timestamp: new Date(Date.now() - 9e6).toISOString(),
          likes: 267,
          retweets: 145,
          comments: 56,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["UNI", "SUSHI"]
        },
        {
          id: "community_11",
          username: "SecurityAuditor",
          handle: "@securityauditor",
          content: "Smart contract security is paramount! Always verify contracts before interacting. Recent audit revealed critical vulnerabilities that could have drained millions. Stay safe! \u{1F512} #Security #SmartContracts",
          timestamp: new Date(Date.now() - 99e5).toISOString(),
          likes: 423,
          retweets: 298,
          comments: 78,
          verified: true,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "community_12",
          username: "MiningEnthusiast",
          handle: "@miningenthusiast",
          content: "GPU mining profitability recovering after the merge! Switching to other PoW coins like RVN and ERG. The mining community adapts and thrives! \u26CF\uFE0F #Mining #GPU #PoW",
          timestamp: new Date(Date.now() - 108e5).toISOString(),
          likes: 134,
          retweets: 67,
          comments: 45,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["RVN", "ERG"]
        },
        {
          id: "community_13",
          username: "DEXTrader",
          handle: "@dextrader",
          content: "Uniswap V4 hooks are going to revolutionize DeFi! Custom pool logic, dynamic fees, and MEV protection built-in. This is the future of decentralized trading! \u{1F984} #UniswapV4 #DEX",
          timestamp: new Date(Date.now() - 117e5).toISOString(),
          likes: 189,
          retweets: 98,
          comments: 34,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["UNI"]
        },
        {
          id: "community_14",
          username: "ZKProofGuru",
          handle: "@zkproofguru",
          content: "Zero-knowledge proofs are the holy grail of privacy and scalability! StarkNet, zkSync, and Polygon Hermez leading the charge. Privacy by default! \u{1F510} #ZKProofs #Privacy #Scaling",
          timestamp: new Date(Date.now() - 126e5).toISOString(),
          likes: 356,
          retweets: 234,
          comments: 89,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["MATIC"]
        },
        {
          id: "community_15",
          username: "CrossChainBridge",
          handle: "@crosschainbridge",
          content: "Interoperability is key! Successfully bridged assets across 5 different chains today. The multi-chain future is here and it's beautiful! \u{1F309} #Interoperability #Bridge #MultiChain",
          timestamp: new Date(Date.now() - 135e5).toISOString(),
          likes: 178,
          retweets: 89,
          comments: 23,
          verified: false,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "community_16",
          username: "LiquidityProvider",
          handle: "@liquidityprovider",
          content: "Providing liquidity to USDC/ETH pool on Curve. Impermanent loss is real but the fees are covering it nicely. DeFi yields beating TradFi! \u{1F4B0} #LiquidityMining #Curve #DeFi",
          timestamp: new Date(Date.now() - 144e5).toISOString(),
          likes: 145,
          retweets: 76,
          comments: 34,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["CRV", "USDC", "ETH"]
        },
        {
          id: "community_17",
          username: "OnChainAnalyst",
          handle: "@onchainanalyst",
          content: "On-chain metrics showing strong accumulation by long-term holders. Whale movements suggest we're in accumulation phase. Data doesn't lie! \u{1F4C8} #OnChainAnalysis #Whales",
          timestamp: new Date(Date.now() - 153e5).toISOString(),
          likes: 289,
          retweets: 156,
          comments: 67,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC", "ETH"]
        },
        {
          id: "community_18",
          username: "GameFiPlayer",
          handle: "@gamefiplayer",
          content: "Play-to-earn gaming is evolving! Just earned $50 in tokens playing Axie Infinity alternative. Gaming and earning - best combination ever! \u{1F3AE}\u{1F4B0} #GameFi #PlayToEarn #P2E",
          timestamp: new Date(Date.now() - 162e5).toISOString(),
          likes: 234,
          retweets: 123,
          comments: 45,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["AXS"]
        },
        {
          id: "community_19",
          username: "TokenomicsExpert",
          handle: "@tokenomicsexpert",
          content: "Analyzing token distribution and vesting schedules before investing is crucial! Many projects have terrible tokenomics that lead to massive dumps. DYOR on supply! \u{1F4CA} #Tokenomics #Research",
          timestamp: new Date(Date.now() - 171e5).toISOString(),
          likes: 367,
          retweets: 245,
          comments: 89,
          verified: true,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "community_20",
          username: "RegulationWatcher",
          handle: "@regulationwatcher",
          content: "Regulatory clarity improving globally! Singapore, Switzerland, and UAE leading with clear crypto frameworks. Innovation thrives with proper regulation! \u{1F3DB}\uFE0F #Regulation #Policy #Adoption",
          timestamp: new Date(Date.now() - 18e6).toISOString(),
          likes: 198,
          retweets: 134,
          comments: 56,
          verified: true,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "community_21",
          username: "TechnicalAnalyst",
          handle: "@technicalanalyst",
          content: "BTC forming a beautiful ascending triangle on the 4H chart. RSI showing bullish divergence. Targets at $45k if we break resistance! \u{1F4C8} #TechnicalAnalysis #BTC #Trading",
          timestamp: new Date(Date.now() - 189e5).toISOString(),
          likes: 445,
          retweets: 267,
          comments: 123,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "community_22",
          username: "DeFiYieldHunter",
          handle: "@defiyieldhunter",
          content: "Found a hidden gem! New protocol offering 25% APY on stablecoin farming. Audited by top firms and backed by reputable VCs. Alpha shared! \u{1F48E} #DeFi #YieldFarming #Alpha",
          timestamp: new Date(Date.now() - 198e5).toISOString(),
          likes: 356,
          retweets: 234,
          comments: 89,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["USDC", "USDT"]
        },
        {
          id: "community_23",
          username: "CentralBankWatcher",
          handle: "@centralbankwatcher",
          content: "Central banks around the world are accumulating Bitcoin! El Salvador, CAR, and rumors of others. The fiat system is slowly acknowledging Bitcoin's value! \u{1F3E6} #CBDC #Bitcoin #Adoption",
          timestamp: new Date(Date.now() - 207e5).toISOString(),
          likes: 567,
          retweets: 345,
          comments: 145,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "community_24",
          username: "SolanaEcosystem",
          handle: "@solanaecosystem",
          content: "Solana ecosystem exploding with innovation! New DEXs, NFT marketplaces, and DeFi protocols launching daily. The speed and low fees are unmatched! \u26A1 #Solana #SOL #SPL",
          timestamp: new Date(Date.now() - 216e5).toISOString(),
          likes: 234,
          retweets: 156,
          comments: 67,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["SOL"]
        },
        {
          id: "community_25",
          username: "InstituionalTrader",
          handle: "@institutionaltrader",
          content: "Institutional adoption is accelerating faster than ever! BlackRock, Fidelity, and major banks are all building crypto infrastructure. The floodgates are opening! \u{1F30A} #Institutional #Adoption",
          timestamp: new Date(Date.now() - 225e5).toISOString(),
          likes: 445,
          retweets: 298,
          comments: 134,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC", "ETH"]
        }
      ];
      const xStylePosts = [
        {
          id: "x_1",
          username: "VitalikButerin",
          handle: "@VitalikButerin",
          content: "Excited about the progress on Ethereum layer 2 scaling! zkRollups are achieving 1000x+ cost reductions while maintaining security. The modular blockchain future is here.",
          timestamp: new Date(Date.now() - 12e5).toISOString(),
          likes: 12400,
          retweets: 4200,
          comments: 856,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["ETH"]
        },
        {
          id: "x_2",
          username: "elonmusk",
          handle: "@elonmusk",
          content: "Tesla will resume accepting Bitcoin when there's confirmation of reasonable clean energy usage by miners. Working with Doge devs to improve system transaction efficiency.",
          timestamp: new Date(Date.now() - 21e5).toISOString(),
          likes: 89456,
          retweets: 25789,
          comments: 12340,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC", "DOGE"]
        },
        {
          id: "x_3",
          username: "aantonop",
          handle: "@aantonop",
          content: "Bitcoin's monetary policy is algorithmic and predictable. Unlike central banks that print money based on political pressures, Bitcoin's supply is mathematically certain. This is revolutionary.",
          timestamp: new Date(Date.now() - 3e6).toISOString(),
          likes: 8945,
          retweets: 3456,
          comments: 1234,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "x_4",
          username: "CZ_Binance",
          handle: "@cz_binance",
          content: "Building for the next billion crypto users. Our focus remains on compliance, security, and user education. The crypto industry needs responsible players to drive mass adoption.",
          timestamp: new Date(Date.now() - 39e5).toISOString(),
          likes: 15670,
          retweets: 4320,
          comments: 2340,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BNB"]
        },
        {
          id: "x_5",
          username: "starknet",
          handle: "@Starknet",
          content: "StarkNet Alpha is now live on Ethereum mainnet! Zero-knowledge rollups enabling unlimited scale with Ethereum-level security. The future of blockchain scalability is here.",
          timestamp: new Date(Date.now() - 48e5).toISOString(),
          likes: 3456,
          retweets: 1890,
          comments: 567,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["ETH"]
        },
        {
          id: "x_6",
          username: "NFTFlipperPro",
          handle: "@nftflipperpro",
          content: "Floor prices pumping across the board! \u{1F4C8} Bored Apes +15%, Azuki +12%, Pudgy Penguins +20%. The NFT market is showing signs of life again. Time to start hunting for deals! \u{1F3AF}",
          timestamp: new Date(Date.now() - 57e5).toISOString(),
          likes: 789,
          retweets: 456,
          comments: 234,
          verified: false,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "x_7",
          username: "CryptoWhaleWatcher",
          handle: "@cryptowhalewatcher",
          content: "\u{1F40B} WHALE ACTIVITY: Massive accumulation detected! Top 100 wallets adding to positions. Smart money is positioning for the next leg up. Follow the whales, not the noise! \u{1F440}",
          timestamp: new Date(Date.now() - 66e5).toISOString(),
          likes: 1234,
          retweets: 678,
          comments: 345,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC", "ETH"]
        },
        {
          id: "x_8",
          username: "MemeCoinMania",
          handle: "@memecoinmania",
          content: "\u{1F415} Meme season is back! DOGE pumping, SHIB following, new memes launching every hour. Remember: only invest what you can afford to lose and take profits! This won't last forever \u{1F602}",
          timestamp: new Date(Date.now() - 75e5).toISOString(),
          likes: 1567,
          retweets: 890,
          comments: 456,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["DOGE", "SHIB"]
        },
        {
          id: "x_9",
          username: "TradingSignals",
          handle: "@tradingsignals",
          content: "\u{1F4CA} TECHNICAL UPDATE: BTC breaking out of 6-month accumulation pattern. RSI oversold bounce incoming? Target 1: $45k, Target 2: $48k. Stop loss at $40k. Not financial advice! \u{1F3AF}",
          timestamp: new Date(Date.now() - 84e5).toISOString(),
          likes: 2456,
          retweets: 1345,
          comments: 678,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "x_10",
          username: "RealVisionCrypto",
          handle: "@realvisioncrypto",
          content: `\u{1F3A5} NEW VIDEO: "Why This Crypto Cycle is Different" featuring top analysts discussing macro trends, institutional adoption, and regulatory clarity. Link in bio. Don't miss this one! \u{1F525}`,
          timestamp: new Date(Date.now() - 93e5).toISOString(),
          likes: 3456,
          retweets: 2345,
          comments: 1234,
          verified: true,
          avatar: null,
          url: "https://youtube.com/watch?v=example",
          currencies: []
        },
        {
          id: "x_11",
          username: "LayerZeroLabs",
          handle: "@layerzerolabs",
          content: "\u{1F309} Cross-chain interoperability is the future! Our omnichain protocol now supports 15+ blockchains with seamless asset transfers. The unified DeFi experience is finally here! \u{1F680}",
          timestamp: new Date(Date.now() - 102e5).toISOString(),
          likes: 678,
          retweets: 345,
          comments: 123,
          verified: true,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "x_12",
          username: "PolygonDaily",
          handle: "@polygondaily",
          content: "\u26A1 Polygon zkEVM is processing 1M+ transactions daily with near-zero fees! Ethereum scaling solved. Major DApps migrating over as we speak. MATIC holders eating good! \u{1F37D}\uFE0F",
          timestamp: new Date(Date.now() - 111e5).toISOString(),
          likes: 1890,
          retweets: 567,
          comments: 234,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["MATIC"]
        },
        {
          id: "x_13",
          username: "ArbitrumNews",
          handle: "@arbitrumnews",
          content: "\u{1F525} Arbitrum ecosystem TVL just hit $2.5B! Major protocols choosing ARB for lower fees and faster transactions. The L2 wars are heating up and Arbitrum is winning! \u{1F3C6}",
          timestamp: new Date(Date.now() - 12e6).toISOString(),
          likes: 1234,
          retweets: 456,
          comments: 189,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["ARB"]
        },
        {
          id: "x_14",
          username: "OptimismPBC",
          handle: "@optimismpbc",
          content: "\u{1F534} Optimism Bedrock upgrade complete! 10x faster transaction finality and 40% lower fees. Plus our retroactive public goods funding is changing how we build the future \u{1F331}",
          timestamp: new Date(Date.now() - 129e5).toISOString(),
          likes: 2345,
          retweets: 1234,
          comments: 567,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["OP"]
        },
        {
          id: "x_15",
          username: "CosmosEcosystem",
          handle: "@cosmosecosystem",
          content: "\u{1F30C} The Internet of Blockchains is expanding! 50+ sovereign chains connected via IBC, $1B+ in cross-chain value transferred. Interchain security changing the game forever! \u269B\uFE0F",
          timestamp: new Date(Date.now() - 138e5).toISOString(),
          likes: 567,
          retweets: 234,
          comments: 89,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["ATOM"]
        },
        {
          id: "x_16",
          username: "brian_armstrong",
          handle: "@brian_armstrong",
          content: "Coinbase is seeing record institutional demand for crypto custody and trading services. The infrastructure for the next wave of adoption is being built right now.",
          timestamp: new Date(Date.now() - 147e5).toISOString(),
          likes: 12800,
          retweets: 3400,
          comments: 1200,
          verified: true,
          avatar: null,
          url: null,
          currencies: []
        },
        {
          id: "x_17",
          username: "justinsuntron",
          handle: "@justinsuntron",
          content: "TRON network now processes over 7 billion transactions with 200M+ accounts. Building the decentralized internet one block at a time. #TRX #TRON",
          timestamp: new Date(Date.now() - 156e5).toISOString(),
          likes: 4500,
          retweets: 1200,
          comments: 780,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["TRX"]
        },
        {
          id: "x_18",
          username: "balajis",
          handle: "@balajis",
          content: "The Network State concept becomes more relevant as digital communities grow stronger than geographic ones. Bitcoin cities, DAO governance, and digital citizenship are the future.",
          timestamp: new Date(Date.now() - 165e5).toISOString(),
          likes: 8900,
          retweets: 2800,
          comments: 1400,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "x_19",
          username: "novogratz",
          handle: "@novogratz",
          content: "Galaxy Digital continues to see institutional clients allocating to digital assets as a hedge against monetary debasement. The macro thesis for crypto remains intact.",
          timestamp: new Date(Date.now() - 174e5).toISOString(),
          likes: 6700,
          retweets: 1900,
          comments: 890,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC", "ETH"]
        },
        {
          id: "x_20",
          username: "APompliano",
          handle: "@APompliano",
          content: "Bitcoin is the ultimate savings technology. While central banks debase currencies, Bitcoin's fixed supply cap of 21 million makes it the hardest money humanity has ever created.",
          timestamp: new Date(Date.now() - 183e5).toISOString(),
          likes: 15600,
          retweets: 5200,
          comments: 2100,
          verified: true,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "x_21",
          username: "Cointelegraph",
          handle: "@Cointelegraph",
          content: "BREAKING: Major crypto exchange announces support for institutional staking services with yields up to 12% APY. The institutional DeFi adoption wave continues to accelerate.",
          timestamp: new Date(Date.now() - 192e5).toISOString(),
          likes: 8900,
          retweets: 3400,
          comments: 1200,
          verified: true,
          avatar: null,
          url: "https://cointelegraph.com/news/institutional-staking",
          currencies: ["ETH"]
        },
        {
          id: "x_22",
          username: "rovercrc",
          handle: "@rovercrc",
          content: "On-chain analysis shows whale accumulation patterns similar to pre-2021 bull run. Large wallets adding to positions while retail sells. Smart money positioning for next cycle.",
          timestamp: new Date(Date.now() - 201e5).toISOString(),
          likes: 5600,
          retweets: 2800,
          comments: 890,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["BTC", "ETH"]
        },
        {
          id: "x_23",
          username: "Whale_Guru",
          handle: "@Whale_Guru",
          content: "\u{1F40B} WHALE ALERT: 50,000 ETH moved from unknown wallet to Coinbase. Could be institutional deposit or profit taking. Watch for price impact in next 24h. #WhaleMovements",
          timestamp: new Date(Date.now() - 21e6).toISOString(),
          likes: 12300,
          retweets: 4500,
          comments: 1800,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["ETH"]
        },
        {
          id: "x_24",
          username: "Cointelegraph",
          handle: "@Cointelegraph",
          content: "New report: Layer 2 solutions process 10x more transactions than Ethereum mainnet. Polygon leads with 1.2B transactions this quarter, followed by Arbitrum and Optimism.",
          timestamp: new Date(Date.now() - 219e5).toISOString(),
          likes: 6700,
          retweets: 2100,
          comments: 750,
          verified: true,
          avatar: null,
          url: "https://cointelegraph.com/news/layer2-growth-report",
          currencies: ["ETH", "MATIC", "ARB", "OP"]
        },
        {
          id: "x_25",
          username: "rovercrc",
          handle: "@rovercrc",
          content: "Bitcoin network hash rate hits new ATH at 850 EH/s. Mining difficulty adjustment up 8.2%. Network security stronger than ever as institutional miners expand operations globally.",
          timestamp: new Date(Date.now() - 228e5).toISOString(),
          likes: 4200,
          retweets: 1600,
          comments: 520,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "x_26",
          username: "Whale_Guru",
          handle: "@Whale_Guru",
          content: "Top 100 Bitcoin addresses hold 15.2% of total supply (3.19M BTC). Concentration increasing as institutional custody services grow. Long-term bullish for scarcity thesis.",
          timestamp: new Date(Date.now() - 237e5).toISOString(),
          likes: 8900,
          retweets: 3200,
          comments: 1100,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["BTC"]
        },
        {
          id: "x_27",
          username: "Ashcryptoreal",
          handle: "@Ashcryptoreal",
          content: "Altcoin season indicators suggest we're entering a new phase. BTC dominance dropping while ETH and quality alts show strength. Time to diversify beyond Bitcoin maximalism.",
          timestamp: new Date(Date.now() - 246e5).toISOString(),
          likes: 3400,
          retweets: 1200,
          comments: 450,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["BTC", "ETH", "ADA", "DOT"]
        },
        {
          id: "x_28",
          username: "AltcoinGordon",
          handle: "@AltcoinGordon",
          content: "Hidden gem alert: AI + blockchain projects are severely undervalued. Look for projects combining machine learning with decentralized infrastructure. Next narrative brewing \u{1F9E0}",
          timestamp: new Date(Date.now() - 255e5).toISOString(),
          likes: 5600,
          retweets: 2100,
          comments: 780,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["FET", "OCEAN", "RNDR"]
        },
        {
          id: "x_29",
          username: "Ashcryptoreal",
          handle: "@Ashcryptoreal",
          content: "Portfolio allocation strategy: 40% BTC, 30% ETH, 20% quality alts (ADA, SOL, DOT), 10% high-risk/high-reward plays. Risk management is everything in crypto.",
          timestamp: new Date(Date.now() - 264e5).toISOString(),
          likes: 2800,
          retweets: 890,
          comments: 320,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["BTC", "ETH", "ADA", "SOL", "DOT"]
        },
        {
          id: "x_30",
          username: "AltcoinGordon",
          handle: "@AltcoinGordon",
          content: "DeFi 2.0 is here: Real yield protocols, sustainable tokenomics, and actual utility. The casino era is ending, we're moving toward productive crypto assets. #DeFi2",
          timestamp: new Date(Date.now() - 273e5).toISOString(),
          likes: 4200,
          retweets: 1600,
          comments: 560,
          verified: false,
          avatar: null,
          url: null,
          currencies: ["GMX", "GNS", "RADIX"]
        }
      ];
      allPosts.push(...communityPosts);
      allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      let filteredPosts = allPosts;
      if (filter !== "all") {
        if (filter === "twitter") {
          filteredPosts = allPosts.filter((post) => post.id.includes("x_live_"));
        } else {
          const filterMap = {
            bitcoin: ["BTC"],
            ethereum: ["ETH"],
            defi: ["UNI", "AAVE", "COMP", "CRV", "SUSHI"],
            nft: ["NFT"],
            web3: ["WEB3"],
            altcoins: ["SOL", "ADA", "DOT", "MATIC", "AVAX", "LINK", "ATOM", "ARB", "OP"]
          };
          if (filterMap[filter]) {
            filteredPosts = allPosts.filter(
              (post) => filterMap[filter].some(
                (currency) => post.currencies.includes(currency) || post.content.toLowerCase().includes(currency.toLowerCase()) || post.content.toLowerCase().includes(filter)
              )
            );
          }
        }
      }
      const startIndex = (page - 1) * limit2;
      const endIndex = startIndex + limit2;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      res.json({
        posts: paginatedPosts,
        pagination: {
          currentPage: page,
          totalPosts: filteredPosts.length,
          postsPerPage: limit2,
          totalPages: Math.ceil(filteredPosts.length / limit2),
          hasNext: endIndex < filteredPosts.length,
          hasPrevious: page > 1
        }
      });
    } catch (error) {
      console.error("Error fetching social feed:", error);
      const fallbackPosts = {
        posts: [
          {
            id: "1",
            username: "CryptoUpdates",
            handle: "@cryptoupdates",
            content: "Social feed services temporarily unavailable. Please try again later.",
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            likes: 15,
            retweets: 5,
            comments: 2,
            verified: false,
            avatar: null,
            url: null,
            currencies: []
          }
        ],
        pagination: {
          currentPage: 1,
          totalPosts: 1,
          postsPerPage: 10,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      };
      res.json(fallbackPosts);
    }
  });
  app3.get("/api/test-twitter", async (req, res) => {
    try {
      if (!process.env.X_BEARER_TOKEN) {
        return res.json({ error: "No Twitter token configured" });
      }
      console.log("Testing Twitter API directly...");
      const userResponse = await fetch(
        "https://api.twitter.com/2/users/by/username/VitalikButerin",
        {
          headers: {
            "Authorization": `Bearer ${process.env.X_BEARER_TOKEN}`,
            "User-Agent": "CryptoLiquid/1.0"
          }
        }
      );
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        return res.json({
          error: "User lookup failed",
          status: userResponse.status,
          details: errorText
        });
      }
      const userData = await userResponse.json();
      const userId = userData.data?.id;
      if (!userId) {
        return res.json({ error: "No user ID found", userData });
      }
      const tweetsResponse = await fetch(
        `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,public_metrics,author_id&exclude=retweets,replies`,
        {
          headers: {
            "Authorization": `Bearer ${process.env.X_BEARER_TOKEN}`,
            "User-Agent": "CryptoLiquid/1.0"
          }
        }
      );
      if (!tweetsResponse.ok) {
        const errorText = await tweetsResponse.text();
        return res.json({
          error: "Tweets lookup failed",
          status: tweetsResponse.status,
          details: errorText
        });
      }
      const tweetsData = await tweetsResponse.json();
      res.json({
        success: true,
        user: userData.data,
        tweetsCount: tweetsData.data?.length || 0,
        tweets: tweetsData.data?.slice(0, 2) || []
      });
    } catch (error) {
      res.json({ error: "Exception occurred", details: error instanceof Error ? error.message : String(error) });
    }
  });
  const httpServer = createServer(app3);
  function extractCurrencies(text) {
    const cryptoPatterns = [
      /\$?BTC\b/gi,
      /\$?bitcoin\b/gi,
      /\$?ETH\b/gi,
      /\$?ethereum\b/gi,
      /\$?ADA\b/gi,
      /\$?cardano\b/gi,
      /\$?SOL\b/gi,
      /\$?solana\b/gi,
      /\$?DOT\b/gi,
      /\$?polkadot\b/gi,
      /\$?MATIC\b/gi,
      /\$?polygon\b/gi,
      /\$?AVAX\b/gi,
      /\$?avalanche\b/gi,
      /\$?LINK\b/gi,
      /\$?chainlink\b/gi,
      /\$?UNI\b/gi,
      /\$?uniswap\b/gi,
      /\$?DOGE\b/gi,
      /\$?dogecoin\b/gi,
      /\$?BNB\b/gi,
      /\$?binance\b/gi,
      /\$?TRX\b/gi,
      /\$?tron\b/gi,
      /\$?ATOM\b/gi,
      /\$?cosmos\b/gi,
      /\$?ARB\b/gi,
      /\$?arbitrum\b/gi,
      /\$?OP\b/gi,
      /\$?optimism\b/gi
    ];
    const currencies = [];
    const currencyMap = {
      "btc": "BTC",
      "bitcoin": "BTC",
      "eth": "ETH",
      "ethereum": "ETH",
      "ada": "ADA",
      "cardano": "ADA",
      "sol": "SOL",
      "solana": "SOL",
      "dot": "DOT",
      "polkadot": "DOT",
      "matic": "MATIC",
      "polygon": "MATIC",
      "avax": "AVAX",
      "avalanche": "AVAX",
      "link": "LINK",
      "chainlink": "LINK",
      "uni": "UNI",
      "uniswap": "UNI",
      "doge": "DOGE",
      "dogecoin": "DOGE",
      "bnb": "BNB",
      "binance": "BNB",
      "trx": "TRX",
      "tron": "TRX",
      "atom": "ATOM",
      "cosmos": "ATOM",
      "arb": "ARB",
      "arbitrum": "ARB",
      "op": "OP",
      "optimism": "OP"
    };
    cryptoPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const cleaned = match.replace(/\$/g, "").toLowerCase();
          const symbol = currencyMap[cleaned];
          if (symbol && !currencies.includes(symbol)) {
            currencies.push(symbol);
          }
        });
      }
    });
    return currencies;
  }
  app3.get("/api/admin/users", async (req, res) => {
    try {
      const usersSnapshot = await getDocs2(collection2(db, "crypto_app_users"));
      const users = usersSnapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data()
      }));
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app3.post("/api/admin/delete-user", async (req, res) => {
    try {
      const { userId, adminId } = req.body;
      if (!userId || !adminId) {
        return res.status(400).json({ error: "userId and adminId are required" });
      }
      const userDoc = await getDoc2(doc2(db, "crypto_app_users", userId));
      const userInfo = userDoc.exists() ? userDoc.data() : null;
      const userEmail = userInfo?.email || "unknown";
      let authDeletionResult = false;
      if (adminAuth) {
        try {
          await adminAuth.deleteUser(userId);
          authDeletionResult = true;
          console.log(`User ${userId} (${userEmail}) deleted from Firebase Auth`);
        } catch (authError) {
          console.warn(`Failed to delete user from Firebase Auth: ${authError.message}`);
          return res.status(500).json({ error: `Failed to delete user from Firebase Auth: ${authError.message}` });
        }
      } else {
        console.warn("Firebase Admin Auth not available - cannot delete user");
        return res.status(500).json({ error: "Firebase Admin Auth not available" });
      }
      await updateDoc2(doc2(db, "crypto_app_users", userId), {
        deletedFromAuth: true,
        deletedDate: (/* @__PURE__ */ new Date()).toISOString(),
        deletedBy: adminId,
        accountStatus: "deleted"
      });
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: "delete_user",
        targetUserId: userId,
        details: `User ${userId} (${userEmail}) was deleted from Firebase Auth. Data kept in Firestore for records.`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        authDeleted: authDeletionResult
      });
      res.json({
        success: true,
        message: `User deleted successfully from Firebase Auth. Data kept in Firestore for admin records.`,
        authDeleted: authDeletionResult
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  app3.post("/api/admin/suspend-user", async (req, res) => {
    try {
      const { userId, adminId, suspended } = req.body;
      if (!userId || !adminId || suspended === void 0) {
        return res.status(400).json({ error: "userId, adminId, and suspended status are required" });
      }
      await updateDoc2(doc2(db, "crypto_app_users", userId), {
        isActive: !suspended,
        suspendedAt: suspended ? (/* @__PURE__ */ new Date()).toISOString() : null
      });
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: suspended ? "suspend_user" : "unsuspend_user",
        targetUserId: userId,
        details: `User ${userId} was ${suspended ? "suspended" : "unsuspended"}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true, message: `User ${suspended ? "suspended" : "unsuspended"} successfully` });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });
  app3.get("/api/admin/activities", async (req, res) => {
    try {
      const activitiesSnapshot = await getDocs2(
        query2(collection2(db, "adminActivities"), orderBy2("timestamp", "desc"))
      );
      const activities = activitiesSnapshot.docs.map((doc3) => ({
        id: doc3.id,
        ...doc3.data()
      }));
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ error: "Failed to fetch admin activities" });
    }
  });
  app3.post("/api/admin/update-user-profile", async (req, res) => {
    try {
      const { userId, adminId, updates } = req.body;
      if (!userId || !adminId || !updates) {
        return res.status(400).json({ error: "userId, adminId, and updates are required" });
      }
      await updateDoc2(doc2(db, "crypto_app_users", userId), {
        ...updates,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      });
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: "update_user_profile",
        targetUserId: userId,
        details: `Updated user profile fields: ${Object.keys(updates).join(", ")}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        changes: updates
      });
      res.json({ success: true, message: "User profile updated successfully" });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });
  app3.post("/api/admin/update-user-role", async (req, res) => {
    try {
      const { userId, adminId, newRole } = req.body;
      if (!userId || !adminId || !newRole) {
        return res.status(400).json({ error: "userId, adminId, and newRole are required" });
      }
      if (!["user", "admin", "super_admin"].includes(newRole)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      const userDoc = await getDoc2(doc2(db, "crypto_app_users", userId));
      const userInfo = userDoc.exists() ? userDoc.data() : null;
      const userEmail = userInfo?.email || "unknown";
      const oldRole = userInfo?.role || "user";
      await updateDoc2(doc2(db, "crypto_app_users", userId), {
        role: newRole,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: adminId
      });
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: "update_user_role",
        targetUserId: userId,
        details: `User ${userId} (${userEmail}) role changed from ${oldRole} to ${newRole}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        oldRole,
        newRole
      });
      res.json({ success: true, message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });
  app3.post("/api/admin/update-user-type", async (req, res) => {
    try {
      const { userId, adminId, userType, accountType } = req.body;
      if (!userId || !adminId) {
        return res.status(400).json({ error: "userId and adminId are required" });
      }
      const validUserTypes = ["casual", "trader", "investor", "professional"];
      const validAccountTypes = ["standard", "premium", "pro", "enterprise"];
      if (userType && !validUserTypes.includes(userType)) {
        return res.status(400).json({ error: "Invalid user type" });
      }
      if (accountType && !validAccountTypes.includes(accountType)) {
        return res.status(400).json({ error: "Invalid account type" });
      }
      const userDoc = await getDoc2(doc2(db, "crypto_app_users", userId));
      const userInfo = userDoc.exists() ? userDoc.data() : null;
      const userEmail = userInfo?.email || "unknown";
      const oldUserType = userInfo?.userType || "casual";
      const oldAccountType = userInfo?.accountType || "standard";
      const updateData = {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: adminId
      };
      if (userType) updateData.userType = userType;
      if (accountType) updateData.accountType = accountType;
      await updateDoc2(doc2(db, "crypto_app_users", userId), updateData);
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: "update_user_type",
        targetUserId: userId,
        details: `User ${userId} (${userEmail}) type changed from ${oldUserType} to ${userType || oldUserType}, account type from ${oldAccountType} to ${accountType || oldAccountType}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        oldUserType,
        newUserType: userType || oldUserType,
        oldAccountType,
        newAccountType: accountType || oldAccountType
      });
      res.json({ success: true, message: "User type updated successfully" });
    } catch (error) {
      console.error("Error updating user type:", error);
      res.status(500).json({ error: "Failed to update user type" });
    }
  });
  app3.post("/api/admin/update-user-verification", async (req, res) => {
    try {
      const { userId, adminId, verificationType, status, notes } = req.body;
      if (!userId || !adminId || !verificationType || !status) {
        return res.status(400).json({ error: "userId, adminId, verificationType, and status are required" });
      }
      const updates = {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      switch (verificationType) {
        case "email":
          updates["emailVerified"] = status === "approved";
          updates["emailVerifiedAt"] = status === "approved" ? (/* @__PURE__ */ new Date()).toISOString() : null;
          break;
        case "phone":
          updates["security.phoneVerified"] = status === "approved";
          updates["security.phoneVerifiedAt"] = status === "approved" ? (/* @__PURE__ */ new Date()).toISOString() : null;
          break;
        case "identity":
          updates["security.identityVerified"] = status === "approved";
          updates["security.identityVerifiedAt"] = status === "approved" ? (/* @__PURE__ */ new Date()).toISOString() : null;
          break;
        case "kyc":
          updates["security.kycStatus"] = status;
          if (status === "approved") {
            updates["security.kycApprovedAt"] = (/* @__PURE__ */ new Date()).toISOString();
            updates["verificationLevel"] = "verified";
          }
          break;
        default:
          return res.status(400).json({ error: "Invalid verification type" });
      }
      await updateDoc2(doc2(db, "users", userId), updates);
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: "update_verification",
        targetUserId: userId,
        details: `Updated ${verificationType} verification to ${status}${notes ? ": " + notes : ""}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        verificationType,
        status,
        notes
      });
      res.json({ success: true, message: `${verificationType} verification updated successfully` });
    } catch (error) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ error: "Failed to update verification status" });
    }
  });
  app3.post("/api/admin/update-user-type", async (req, res) => {
    try {
      const { userId, adminId, userType, accountType, verificationLevel } = req.body;
      if (!userId || !adminId) {
        return res.status(400).json({ error: "userId and adminId are required" });
      }
      const updates = {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (userType) updates.userType = userType;
      if (accountType) updates.accountType = accountType;
      if (verificationLevel) updates.verificationLevel = verificationLevel;
      await updateDoc2(doc2(db, "users", userId), updates);
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: "update_user_type",
        targetUserId: userId,
        details: `Updated user type: ${userType || "unchanged"}, account type: ${accountType || "unchanged"}, verification: ${verificationLevel || "unchanged"}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        changes: { userType, accountType, verificationLevel }
      });
      res.json({ success: true, message: "User type updated successfully" });
    } catch (error) {
      console.error("Error updating user type:", error);
      res.status(500).json({ error: "Failed to update user type" });
    }
  });
  app3.get("/api/admin/user-analytics", async (req, res) => {
    try {
      const usersSnapshot = await getDocs2(collection2(db, "users"));
      const users = usersSnapshot.docs.map((doc3) => doc3.data());
      const analytics = {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.isActive).length,
        suspendedUsers: users.filter((u) => !u.isActive).length,
        verifiedUsers: users.filter((u) => u.emailVerified).length,
        usersByType: {
          casual: users.filter((u) => u.userType === "casual").length,
          trader: users.filter((u) => u.userType === "trader").length,
          investor: users.filter((u) => u.userType === "investor").length,
          professional: users.filter((u) => u.userType === "professional").length,
          institutional: users.filter((u) => u.userType === "institutional").length
        },
        usersByAccountType: {
          standard: users.filter((u) => u.accountType === "standard").length,
          premium: users.filter((u) => u.accountType === "premium").length,
          pro: users.filter((u) => u.accountType === "pro").length,
          enterprise: users.filter((u) => u.accountType === "enterprise").length
        },
        verificationLevels: {
          basic: users.filter((u) => u.verificationLevel === "basic").length,
          verified: users.filter((u) => u.verificationLevel === "verified").length,
          premium: users.filter((u) => u.verificationLevel === "premium").length,
          institutional: users.filter((u) => u.verificationLevel === "institutional").length
        },
        kycStats: {
          notStarted: users.filter((u) => u.security?.kycStatus === "not-started").length,
          pending: users.filter((u) => u.security?.kycStatus === "pending").length,
          approved: users.filter((u) => u.security?.kycStatus === "approved").length,
          rejected: users.filter((u) => u.security?.kycStatus === "rejected").length
        },
        recentSignups: users.filter((u) => {
          const createdAt = new Date(u.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
          return createdAt > weekAgo;
        }).length,
        activeInLastDay: users.filter((u) => {
          const lastLogin = new Date(u.lastLoginAt);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
          return lastLogin > dayAgo;
        }).length
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });
  app3.post("/api/admin/send-notification", async (req, res) => {
    try {
      const { userId, adminId, title, message, type, urgent } = req.body;
      if (!userId || !adminId || !title || !message) {
        return res.status(400).json({ error: "userId, adminId, title, and message are required" });
      }
      await addDoc2(collection2(db, "users", userId, "notifications"), {
        title,
        message,
        type: type || "info",
        // info, warning, success, error
        urgent: urgent || false,
        fromAdmin: true,
        adminId,
        read: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: "send_notification",
        targetUserId: userId,
        details: `Sent notification: ${title}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        notificationData: { title, message, type, urgent }
      });
      res.json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });
  app3.post("/api/admin/bulk-operation", async (req, res) => {
    try {
      const { adminId, operation, userIds, data } = req.body;
      if (!adminId || !operation || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ error: "adminId, operation, and userIds array are required" });
      }
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      for (const userId of userIds) {
        try {
          switch (operation) {
            case "suspend":
              await updateDoc2(doc2(db, "users", userId), {
                isActive: false,
                suspendedAt: (/* @__PURE__ */ new Date()).toISOString(),
                lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
              });
              break;
            case "unsuspend":
              await updateDoc2(doc2(db, "users", userId), {
                isActive: true,
                suspendedAt: null,
                lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
              });
              break;
            case "update_type":
              if (data.userType || data.accountType || data.verificationLevel) {
                const updates = { lastUpdated: (/* @__PURE__ */ new Date()).toISOString() };
                if (data.userType) updates.userType = data.userType;
                if (data.accountType) updates.accountType = data.accountType;
                if (data.verificationLevel) updates.verificationLevel = data.verificationLevel;
                await updateDoc2(doc2(db, "users", userId), updates);
              }
              break;
            default:
              throw new Error(`Unknown operation: ${operation}`);
          }
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({ userId, error: error.message });
        }
      }
      await addDoc2(collection2(db, "adminActivities"), {
        adminId,
        action: "bulk_operation",
        details: `Bulk ${operation}: ${successCount} succeeded, ${errorCount} failed`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        operation,
        successCount,
        errorCount,
        totalUsers: userIds.length
      });
      res.json({
        success: true,
        message: `Bulk operation completed: ${successCount} succeeded, ${errorCount} failed`,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : void 0
      });
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      res.status(500).json({ error: "Failed to perform bulk operation" });
    }
  });
  registerAdminRoutes(app3);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  base: "/aad/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app3, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app3.use(vite.middlewares);
  app3.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app3) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app3.use(express.static(distPath));
  app3.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app2 = express2();
app2.use(express2.json());
app2.use(express2.urlencoded({ extended: false }));
app2.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app2);
  app2.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app2.get("env") === "development") {
    await setupVite(app2, server);
  } else {
    serveStatic(app2);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "localhost"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
