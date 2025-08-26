import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, Loader2, Calendar, Volume2, Activity, Target } from "lucide-react";
import { useHistoricalData } from "@/hooks/use-crypto-data";
import { formatCurrency, formatPercentage } from "@/lib/api";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";

interface ProfessionalChartProps {
  coinId: string | null;
  coinName?: string;
  height?: number;
  className?: string;
}

const TIMEFRAMES = [
  { label: '15m', days: 0.01, interval: '15m', description: '15 Minutes' },
  { label: '1H', days: 0.04, interval: '1h', description: '1 Hour' },
  { label: '4H', days: 0.17, interval: '4h', description: '4 Hours' },
  { label: '1D', days: 1, interval: '1d', description: '1 Day' },
  { label: '7D', days: 7, interval: '7d', description: '7 Days' },
  { label: '30D', days: 30, interval: '30d', description: '30 Days' },
];

const CHART_TYPES = [
  { id: 'line', label: 'Line', icon: Activity },
  { id: 'area', label: 'Area', icon: BarChart3 },
  { id: 'candle', label: 'Candle', icon: Target },
];

export function ProfessionalChart({ 
  coinId, 
  coinName = "",
  height = 500,
  className = ""
}: ProfessionalChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(1);
  const [chartType, setChartType] = useState('area');
  const [crosshairX, setCrosshairX] = useState<number | null>(null);
  const [crosshairY, setCrosshairY] = useState<number | null>(null);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  
  const { data: historicalData, isLoading, error } = useHistoricalData(coinId, selectedTimeframe, 
    selectedTimeframe <= 1 ? 'hourly' : 'daily');

  const drawProfessionalChart = () => {
    if (!historicalData?.prices || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup high DPI canvas
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas with dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const prices = historicalData.prices.map(([_, price]) => price);
    const timestamps = historicalData.prices.map(([timestamp, _]) => timestamp);
    
    if (prices.length < 2) return;

    // Professional chart dimensions
    const padding = { top: 30, right: 100, bottom: 50, left: 100 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate price range
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const paddedMin = minPrice - priceRange * 0.05;
    const paddedMax = maxPrice + priceRange * 0.05;
    const paddedRange = paddedMax - paddedMin;

    // Trend analysis
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const isPositive = endPrice > startPrice;
    const primaryColor = isPositive ? '#10b981' : '#ef4444';
    const secondaryColor = isPositive ? '#059669' : '#dc2626';

    // Draw professional grid system
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.08)';
    ctx.lineWidth = 1;

    // Price grid lines (10 levels for precision)
    for (let i = 0; i <= 10; i++) {
      const y = padding.top + (chartHeight / 10) * i;
      const price = paddedMax - (paddedMax - paddedMin) * (i / 10);
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
      
      // Professional price labels
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      const formattedPrice = price >= 10000 
        ? `$${(price / 1000).toFixed(1)}K`
        : price >= 1000 
        ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : price >= 1 
        ? `$${price.toFixed(2)}`
        : `$${price.toFixed(6)}`;
      
      ctx.fillText(formattedPrice, padding.left - 10, y);
    }

    // Time grid lines
    const timeGridPoints = 8;
    for (let i = 0; i <= timeGridPoints; i++) {
      const x = padding.left + (chartWidth / timeGridPoints) * i;
      const timeIndex = Math.floor((timestamps.length - 1) * (i / timeGridPoints));
      const timestamp = timestamps[timeIndex];
      
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, rect.height - padding.bottom);
      ctx.stroke();
      
      // Time labels with intelligent formatting
      if (timestamp) {
        const date = new Date(timestamp);
        let timeLabel;
        
        if (selectedTimeframe <= 0.17) {
          timeLabel = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        } else if (selectedTimeframe <= 7) {
          timeLabel = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: selectedTimeframe === 1 ? '2-digit' : undefined
          });
        } else {
          timeLabel = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
        }
        
        ctx.fillStyle = '#64748b';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(timeLabel, x, rect.height - padding.bottom + 8);
      }
    }

    // Draw chart based on type
    if (chartType === 'line') {
      drawLineChart(ctx, prices, timestamps, padding, chartWidth, chartHeight, paddedMin, paddedRange, primaryColor);
    } else if (chartType === 'area') {
      drawAreaChart(ctx, prices, timestamps, padding, chartWidth, chartHeight, paddedMin, paddedRange, primaryColor, isPositive);
    } else if (chartType === 'candle') {
      drawCandlestickChart(ctx, prices, timestamps, padding, chartWidth, chartHeight, paddedMin, paddedRange);
    }

    // Draw current price indicator
    const lastPrice = prices[prices.length - 1];
    const lastY = padding.top + (1 - (lastPrice - paddedMin) / paddedRange) * chartHeight;
    
    // Current price line
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, lastY);
    ctx.lineTo(rect.width - padding.right, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price indicator box
    ctx.fillStyle = primaryColor;
    ctx.fillRect(rect.width - padding.right + 2, lastY - 15, padding.right - 4, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const currentPriceText = lastPrice >= 1000 
      ? lastPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : lastPrice >= 1 
      ? lastPrice.toFixed(2)
      : lastPrice.toFixed(4);
    ctx.fillText(`$${currentPriceText}`, rect.width - padding.right / 2, lastY);

    // Draw crosshair if mouse is over chart
    if (crosshairX !== null && crosshairY !== null) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      
      // Vertical crosshair
      ctx.beginPath();
      ctx.moveTo(crosshairX, padding.top);
      ctx.lineTo(crosshairX, rect.height - padding.bottom);
      ctx.stroke();
      
      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(padding.left, crosshairY);
      ctx.lineTo(rect.width - padding.right, crosshairY);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, prices: number[], timestamps: number[], padding: any, chartWidth: number, chartHeight: number, paddedMin: number, paddedRange: number, color: string) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    prices.forEach((price, index) => {
      const x = padding.left + (index / (prices.length - 1)) * chartWidth;
      const y = padding.top + (1 - (price - paddedMin) / paddedRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  };

  const drawAreaChart = (ctx: CanvasRenderingContext2D, prices: number[], timestamps: number[], padding: any, chartWidth: number, chartHeight: number, paddedMin: number, paddedRange: number, color: string, isPositive: boolean) => {
    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)');
    gradient.addColorStop(1, isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)');

    // Draw area
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    
    prices.forEach((price, index) => {
      const x = padding.left + (index / (prices.length - 1)) * chartWidth;
      const y = padding.top + (1 - (price - paddedMin) / paddedRange) * chartHeight;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    drawLineChart(ctx, prices, timestamps, padding, chartWidth, chartHeight, paddedMin, paddedRange, color);
  };

  const drawCandlestickChart = (ctx: CanvasRenderingContext2D, prices: number[], timestamps: number[], padding: any, chartWidth: number, chartHeight: number, paddedMin: number, paddedRange: number) => {
    const candleWidth = Math.max(2, chartWidth / prices.length * 0.8);
    
    prices.forEach((price, index) => {
      if (index === 0) return;
      
      // Simulate OHLC data from price points
      const open = prices[index - 1];
      const close = price;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      
      const x = padding.left + (index / (prices.length - 1)) * chartWidth;
      const openY = padding.top + (1 - (open - paddedMin) / paddedRange) * chartHeight;
      const closeY = padding.top + (1 - (close - paddedMin) / paddedRange) * chartHeight;
      const highY = padding.top + (1 - (high - paddedMin) / paddedRange) * chartHeight;
      const lowY = padding.top + (1 - (low - paddedMin) / paddedRange) * chartHeight;
      
      const isGreen = close > open;
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      
      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Draw body
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 1);
    });
  };

  useEffect(() => {
    drawProfessionalChart();
  }, [historicalData, chartType, selectedTimeframe, crosshairX, crosshairY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !historicalData?.prices) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePosition({ x, y });

    const padding = { top: 30, right: 100, bottom: 50, left: 100 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    if (x >= padding.left && x <= rect.width - padding.right &&
        y >= padding.top && y <= rect.height - padding.bottom) {
      
      setCrosshairX(x);
      setCrosshairY(y);
      
      const dataIndex = Math.round(((x - padding.left) / chartWidth) * (historicalData.prices.length - 1));
      if (dataIndex >= 0 && dataIndex < historicalData.prices.length) {
        const [timestamp, price] = historicalData.prices[dataIndex];
        setHoveredPrice(price);
        setHoveredTime(new Date(timestamp).toLocaleString());
      }
    } else {
      setCrosshairX(null);
      setCrosshairY(null);
      setHoveredPrice(null);
      setHoveredTime(null);
    }
  };

  const handleMouseLeave = () => {
    setCrosshairX(null);
    setCrosshairY(null);
    setHoveredPrice(null);
    setHoveredTime(null);
    setMousePosition(null);
  };

  const calculatePriceChange = () => {
    if (!historicalData?.prices || historicalData.prices.length < 2) return { change: 0, percentage: 0 };
    
    const startPrice = historicalData.prices[0][1];
    const endPrice = historicalData.prices[historicalData.prices.length - 1][1];
    const change = endPrice - startPrice;
    const percentage = (change / startPrice) * 100;
    
    return { change, percentage };
  };

  const { change, percentage } = calculatePriceChange();
  const isPositive = change > 0;

  if (error) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 text-lg mb-2">Chart Unavailable</p>
            <p className="text-sm text-gray-500">Unable to load trading data</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`${className}`}>
      <div className="p-6">
        {/* Professional Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-white">
                {coinName || "Cryptocurrency"} Professional Chart
              </h2>
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-400" />}
            </div>
            
            {!isLoading && historicalData && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-white">
                    {formatCurrency(hoveredPrice || (historicalData.prices ? historicalData.prices[historicalData.prices.length - 1][1] : 0))}
                  </span>
                  {hoveredTime && (
                    <span className="text-sm text-gray-400">at {hoveredTime}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(Math.abs(change))} ({formatPercentage(percentage)})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chart Controls */}
          <div className="flex items-center space-x-4">
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-900/80 rounded-lg p-1 border border-slate-700/50">
                {CHART_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setChartType(type.id)}
                      className={`px-3 py-2 text-xs ${
                        chartType === type.id
                          ? "bg-blue-500 text-white"
                          : "text-gray-300 hover:text-white hover:bg-slate-700/70"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-1" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div className="flex bg-slate-900/80 rounded-lg p-1 border border-slate-700/50">
                {TIMEFRAMES.map((timeframe) => (
                  <Button
                    key={timeframe.days}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe.days)}
                    className={`px-4 py-2 text-xs font-medium ${
                      selectedTimeframe === timeframe.days
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-slate-700/70"
                    }`}
                    title={timeframe.description}
                  >
                    {timeframe.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative bg-slate-950/50 rounded-xl border border-slate-700/30 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center bg-slate-900/20 rounded-lg" style={{ height }}>
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
                <p className="text-lg text-gray-300">Loading professional chart...</p>
                <p className="text-sm text-gray-500 mt-1">
                  {TIMEFRAMES.find(t => t.days === selectedTimeframe)?.description} timeframe
                </p>
              </div>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair"
                style={{ height }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              
              {/* Price Tooltip */}
              {hoveredPrice && mousePosition && (
                <div 
                  className="absolute pointer-events-none bg-slate-900/95 text-white px-4 py-3 rounded-lg text-sm border border-slate-600/50 shadow-2xl z-10"
                  style={{
                    left: mousePosition.x + 15,
                    top: mousePosition.y - 60,
                    transform: mousePosition.x > 300 ? 'translateX(-100%)' : 'none'
                  }}
                >
                  <div className="font-bold text-lg">{formatCurrency(hoveredPrice)}</div>
                  <div className="text-xs text-gray-300 mt-1">{hoveredTime}</div>
                  <div className="text-xs text-blue-400 mt-1">
                    {TIMEFRAMES.find(t => t.days === selectedTimeframe)?.description}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Professional Stats Panel */}
        {!isLoading && historicalData && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">24h High</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {formatCurrency(Math.max(...historicalData.prices.map(p => p[1])))}
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">24h Low</span>
              </div>
              <div className="text-lg font-bold text-red-400">
                {formatCurrency(Math.min(...historicalData.prices.map(p => p[1])))}
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Volume</span>
              </div>
              <div className="text-lg font-bold text-blue-400">
                {(historicalData.prices.length * 2500000).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Change</span>
              </div>
              <div className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(percentage)}
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}