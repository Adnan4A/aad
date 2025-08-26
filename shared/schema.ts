import { z } from "zod";

// Global market stats schema
export const globalStatsSchema = z.object({
  totalMarketCap: z.number(),
  totalVolume: z.number(),
  activeCryptos: z.number(),
  marketCapChange24h: z.number(),
  volumeChange24h: z.number(),
  btcDominance: z.number(),
  ethDominance: z.number(),
});

// Dominance data schema
export const dominanceSchema = z.object({
  btcDominance: z.number(),
  ethDominance: z.number(),
  altcoinDominance: z.number(),
  lastUpdated: z.string(),
});

// Cryptocurrency schema
export const cryptoSchema = z.object({
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
    percentage: z.number(),
  }).nullable(),
  last_updated: z.string(),
  sparkline_in_7d: z.object({
    price: z.array(z.number()),
  }).optional(),
  price_change_percentage_7d: z.number().optional(),
});

// Coin detail schema
export const coinDetailSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  description: z.object({
    en: z.string(),
  }),
  image: z.object({
    thumb: z.string(),
    small: z.string(),
    large: z.string(),
  }),
  market_cap_rank: z.number(),
  market_data: z.object({
    current_price: z.object({
      usd: z.number(),
    }),
    market_cap: z.object({
      usd: z.number(),
    }),
    total_volume: z.object({
      usd: z.number(),
    }),
    high_24h: z.object({
      usd: z.number(),
    }),
    low_24h: z.object({
      usd: z.number(),
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
      usd: z.number(),
    }),
    ath_date: z.object({
      usd: z.string(),
    }),
    sparkline_7d: z.object({
      price: z.array(z.number()),
    }).optional(),
  }),
});

// Historical price data schema
export const historicalDataSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
  market_caps: z.array(z.tuple([z.number(), z.number()])),
  total_volumes: z.array(z.tuple([z.number(), z.number()])),
});

// User Activity Schema for Firebase
export const userActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['page_view', 'coin_view', 'chart_view', 'search', 'login', 'logout', 'watchlist_add', 'watchlist_remove']),
  action: z.string(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string(),
  coinId: z.string().optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  timeSpent: z.number().optional(), // in seconds
  timestamp: z.string(),
  createdAt: z.string(),
});

// User Session Schema for Firebase
export const userSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sessionId: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  duration: z.number().optional(), // in seconds
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  isActive: z.boolean().default(true),
  pagesVisited: z.array(z.object({
    url: z.string(),
    title: z.string(),
    timeSpent: z.number(),
    timestamp: z.string(),
  })).default([]),
  coinsViewed: z.array(z.object({
    coinId: z.string(),
    coinName: z.string(),
    viewCount: z.number(),
    totalTimeSpent: z.number(),
    lastViewed: z.string(),
  })).default([]),
  chartsViewed: z.array(z.object({
    coinId: z.string(),
    timeframe: z.string(),
    timestamp: z.string(),
  })).default([]),
});

// Hidden Coin Schema for Firebase
export const hiddenCoinSchema = z.object({
  id: z.string(),
  coinId: z.string(),
  coinName: z.string(),
  coinSymbol: z.string(),
  isHidden: z.boolean().default(true),
  hiddenBy: z.string(), // admin user ID
  hiddenByName: z.string(), // admin display name
  reason: z.string().optional(),
  hiddenAt: z.string(),
  showAt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Site Config Schema for Firebase  
export const siteConfigSchema = z.object({
  id: z.string().default('main'),
  featuredCoins: z.array(z.string()).default([]),
  hiddenCoins: z.array(z.string()).default([]),
  maintenanceMode: z.boolean().default(false),
  announcementBanner: z.object({
    enabled: z.boolean(),
    message: z.string(),
    type: z.enum(['info', 'warning', 'error', 'success'])
  }).optional(),
  apiLimits: z.object({
    requestsPerMinute: z.number().default(100),
    enableRateLimit: z.boolean().default(true)
  }),
  lastUpdated: z.string(),
  updatedBy: z.string(),
  updatedByName: z.string(),
});

// Admin schemas
export const adminUserSchema = z.object({
  uid: z.string(),
  email: z.string(),
  displayName: z.string(),
  photoURL: z.string().nullable(),
  role: z.enum(['user', 'admin', 'super_admin']).default('user'),
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

export const adminActivitySchema = z.object({
  id: z.string(),
  adminId: z.string(),
  adminName: z.string(),
  action: z.enum(['user_delete', 'user_suspend', 'user_role_update', 'coin_hide', 'coin_show', 'data_export', 'settings_change']),
  target: z.string(), // user id or coin id
  targetType: z.enum(['user', 'coin', 'settings']),
  details: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Types
export type GlobalStats = z.infer<typeof globalStatsSchema>;
export type Crypto = z.infer<typeof cryptoSchema>;
export type CoinDetail = z.infer<typeof coinDetailSchema>;
export type HistoricalData = z.infer<typeof historicalDataSchema>;
export type Dominance = z.infer<typeof dominanceSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminActivity = z.infer<typeof adminActivitySchema>;
export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type UserActivity = z.infer<typeof userActivitySchema>;
export type UserSession = z.infer<typeof userSessionSchema>;
export type HiddenCoin = z.infer<typeof hiddenCoinSchema>;

// Insert Types (for creating new records)
export type InsertUserActivity = Omit<UserActivity, 'id' | 'createdAt'>;
export type InsertUserSession = Omit<UserSession, 'id'>;
export type InsertHiddenCoin = Omit<HiddenCoin, 'id'>;
export type InsertAdminActivity = Omit<AdminActivity, 'id'>;
export type InsertSiteConfig = Omit<SiteConfig, 'id' | 'lastUpdated'>;