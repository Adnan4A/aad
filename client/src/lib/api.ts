import { queryClient } from "./queryClient";

const API_BASE = "/api";

export class CryptoAPI {
  static async getGlobalStats() {
    const cacheBuster = Date.now();
    const response = await fetch(`${API_BASE}/global-stats?_t=${cacheBuster}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch global stats: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCoins(page = 1, perPage = 100) {
    const cacheBuster = Date.now();
    const response = await fetch(`${API_BASE}/coins?page=${page}&per_page=${perPage}&_t=${cacheBuster}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch coins: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCoinDetail(coinId: string) {
    const cacheBuster = Date.now();
    const response = await fetch(`${API_BASE}/coins/${coinId}?_t=${cacheBuster}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch coin detail: ${response.statusText}`);
    }
    return response.json();
  }

  static async getHistoricalData(coinId: string, days: number, interval?: string) {
    const params = new URLSearchParams({ days: days.toString() });
    if (interval) {
      params.append('interval', interval);
    }
    const response = await fetch(`${API_BASE}/coins/${coinId}/history?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.statusText}`);
    }
    return response.json();
  }

  static async searchCoins(query: string) {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to search coins: ${response.statusText}`);
    }
    return response.json();
  }
}

// Calculate RSI using real sparkline data from CoinGecko
export function calculateRSI(sparklineData: number[] | undefined, period = 14): number {
  if (!sparklineData || sparklineData.length < period + 1) {
    return 50; // Default neutral RSI for insufficient data
  }

  // Use the last period + 1 prices for accurate calculation
  const prices = sparklineData.slice(-period - 1);
  
  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? -change : 0);

  const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;

  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi * 10) / 10;
}

export function formatCurrency(value: number): string {
  // Format large numbers in text format (millions/billions)
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)} trillion`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)} billion`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)} million`;
  }
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toLocaleString();
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
