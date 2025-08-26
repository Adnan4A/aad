export interface RSIData {
  symbol: string;
  name: string;
  image: string;
  rsi: number;
  trend: 'overbought' | 'oversold' | 'neutral';
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface ChartTimeframe {
  label: string;
  value: string;
  days: number;
}

export const CHART_TIMEFRAMES: ChartTimeframe[] = [
  { label: '1D', value: '1', days: 1 },
  { label: '7D', value: '7', days: 7 },
  { label: '30D', value: '30', days: 30 },
  { label: '1Y', value: '365', days: 365 },
];

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
  market_cap_rank?: number;
}
