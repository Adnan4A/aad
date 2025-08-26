import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, Loader2, Calendar, Maximize2 } from "lucide-react";
import { useHistoricalData } from "@/hooks/use-crypto-data";
import { formatCurrency, formatPercentage } from "@/lib/api";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";

interface PriceChartProps {
  coinId: string | null;
  days?: number;
  height?: number;
  showMetrics?: boolean;
  className?: string;
  interactive?: boolean;
  coinName?: string;
}

const timeframes = [
  { label: '15m', days: 0.01, interval: '15m' },
  { label: '1H', days: 0.04, interval: '1h' },
  { label: '4H', days: 0.17, interval: '4h' },
  { label: '1D', days: 1, interval: '1d' },
  { label: '7D', days: 7, interval: '7d' },
  { label: '30D', days: 30, interval: '30d' },
];

export function PriceChart({ 
  coinId, 
  days = 1, 
  height = 300, 
  showMetrics = true,
  className = "",
  interactive = false,
  coinName = ""
}: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(days);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  const { data: historicalData, isLoading, error } = useHistoricalData(coinId, selectedTimeframe);

  useEffect(() => {
    if (!historicalData?.prices || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas for high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const prices = historicalData.prices.map(([_, price]) => price);
    const timestamps = historicalData.prices.map(([timestamp, _]) => timestamp);
    
    if (prices.length < 2) return;

    // Calculate chart dimensions with proper padding for professional look
    const padding = { top: 40, right: 80, bottom: 60, left: 80 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Find min and max prices with proper padding
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const paddedMin = minPrice - priceRange * 0.02;
    const paddedMax = maxPrice + priceRange * 0.02;
    const paddedRange = paddedMax - paddedMin;

    // Determine trend and colors
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const isPositive = endPrice > startPrice;
    const lineColor = isPositive ? '#16a34a' : '#dc2626';
    const fillColor = isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';

    // Create professional gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, rect.height - padding.bottom);
    gradient.addColorStop(0, fillColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)');

    // Draw professional grid
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Horizontal price grid lines (more lines for better precision)
    for (let i = 0; i <= 8; i++) {
      const y = padding.top + (chartHeight / 8) * i;
      const price = paddedMax - (paddedMax - paddedMin) * (i / 8);
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
      
      // Professional price labels with better formatting
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const formattedPrice = price >= 1000 
        ? price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        : price >= 1 
        ? price.toFixed(2)
        : price.toFixed(6);
      ctx.fillText(`$${formattedPrice}`, padding.left - 8, y);
    }

    // Vertical time grid lines  
    const timePoints = Math.min(prices.length, 6);
    for (let i = 0; i <= timePoints; i++) {
      const x = padding.left + (chartWidth / timePoints) * i;
      const timeIndex = Math.floor((timestamps.length - 1) * (i / timePoints));
      const timestamp = timestamps[timeIndex];
      
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, rect.height - padding.bottom);
      ctx.stroke();
      
      // Professional time labels
      if (timestamp) {
        const date = new Date(timestamp);
        let timeLabel;
        
        if (selectedTimeframe <= 0.17) { // 4h or less
          timeLabel = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        } else if (selectedTimeframe <= 7) { // 7 days or less
          timeLabel = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
        } else { // More than 7 days
          timeLabel = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
        }
        
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(timeLabel, x, rect.height - padding.bottom + 8);
      }
    }

    // Create smooth area fill
    ctx.beginPath();
    ctx.moveTo(padding.left, rect.height - padding.bottom);
    
    // Create smooth curve through points
    for (let i = 0; i < prices.length; i++) {
      const x = padding.left + (i / (prices.length - 1)) * chartWidth;
      const y = padding.top + (1 - (prices[i] - paddedMin) / paddedRange) * chartHeight;
      
      if (i === 0) {
        ctx.lineTo(x, y);
      } else if (i === 1) {
        ctx.lineTo(x, y);
      } else {
        // Use quadratic curves for smooth lines
        const prevX = padding.left + ((i - 1) / (prices.length - 1)) * chartWidth;
        const prevY = padding.top + (1 - (prices[i - 1] - paddedMin) / paddedRange) * chartHeight;
        const controlX = (prevX + x) / 2;
        const controlY = (prevY + y) / 2;
        ctx.quadraticCurveTo(controlX, controlY, x, y);
      }
    }
    
    ctx.lineTo(padding.left + chartWidth, rect.height - padding.bottom);
    ctx.lineTo(padding.left, rect.height - padding.bottom);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw professional price line
    ctx.beginPath();
    for (let i = 0; i < prices.length; i++) {
      const x = padding.left + (i / (prices.length - 1)) * chartWidth;
      const y = padding.top + (1 - (prices[i] - paddedMin) / paddedRange) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else if (i === 1) {
        ctx.lineTo(x, y);
      } else {
        const prevX = padding.left + ((i - 1) / (prices.length - 1)) * chartWidth;
        const prevY = padding.top + (1 - (prices[i - 1] - paddedMin) / paddedRange) * chartHeight;
        const controlX = (prevX + x) / 2;
        const controlY = (prevY + y) / 2;
        ctx.quadraticCurveTo(controlX, controlY, x, y);
      }
    }
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw current price indicator
    const lastIndex = prices.length - 1;
    const lastX = padding.left + chartWidth;
    const lastY = padding.top + (1 - (prices[lastIndex] - paddedMin) / paddedRange) * chartHeight;
    
    // Pulsing price indicator
    ctx.beginPath();
    ctx.arc(lastX, lastY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Current price label on right axis
    ctx.fillStyle = lineColor;
    ctx.fillRect(rect.width - padding.right, lastY - 12, padding.right - 8, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const currentPriceText = prices[lastIndex] >= 1000 
      ? prices[lastIndex].toLocaleString('en-US', { maximumFractionDigits: 0 })
      : prices[lastIndex] >= 1 
      ? prices[lastIndex].toFixed(2)
      : prices[lastIndex].toFixed(4);
    ctx.fillText(`$${currentPriceText}`, rect.width - padding.right / 2, lastY);

    // Add mouse move listener for interactive features
    if (interactive) {
      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        if (mouseX >= padding.left && mouseX <= rect.width - padding.right &&
            mouseY >= padding.top && mouseY <= rect.height - padding.bottom) {
          
          const dataIndex = Math.round(((mouseX - padding.left) / chartWidth) * (prices.length - 1));
          if (dataIndex >= 0 && dataIndex < prices.length) {
            setHoveredPrice(prices[dataIndex]);
            setHoveredTime(new Date(timestamps[dataIndex]).toLocaleString());
          }
        } else {
          setHoveredPrice(null);
          setHoveredTime(null);
        }
      };

      const handleMouseLeave = () => {
        setHoveredPrice(null);
        setHoveredTime(null);
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

  }, [historicalData, selectedTimeframe, interactive]);

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
        <div className="flex items-center justify-center h-40 text-center">
          <div>
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-400">Failed to load chart</p>
            <p className="text-sm text-gray-500">Please try again</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`${className}`}>
      <div className="p-4 space-y-4">
        {showMetrics && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-white">
                  {coinName ? `${coinName} Chart` : `${selectedTimeframe === 1 ? '24 Hour' : `${selectedTimeframe} Day`} Price Chart`}
                </h3>
                {isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              
              {!isLoading && historicalData && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-white">
                      {formatCurrency(hoveredPrice || (historicalData.prices ? historicalData.prices[historicalData.prices.length - 1][1] : 0))}
                    </span>
                    {hoveredTime && (
                      <span className="text-sm text-gray-400">
                        at {hoveredTime}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(Math.abs(change))} ({formatPercentage(percentage)})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Timeframe Selector */}
            {interactive && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="flex space-x-1 bg-slate-900/80 rounded-lg p-1 border border-slate-700/50">
                  {timeframes.map((timeframe) => (
                    <Button
                      key={timeframe.days}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTimeframe(timeframe.days)}
                      className={`text-xs px-4 py-2 rounded-md font-medium transition-all ${
                        selectedTimeframe === timeframe.days
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-gray-300 hover:text-white hover:bg-slate-700/70"
                      }`}
                    >
                      {timeframe.label}
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {selectedTimeframe <= 0.17 ? 'Intraday' : selectedTimeframe <= 1 ? 'Daily' : 'Weekly'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative" style={{ height }}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/20 rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">Loading {days === 1 ? '24-hour' : `${days}-day`} chart...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm text-red-400">Chart temporarily unavailable</p>
                <p className="text-xs text-gray-500 mt-1">Please try again in a moment</p>
              </div>
            </div>
          ) : historicalData?.prices && historicalData.prices.length > 0 ? (
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full rounded-lg cursor-crosshair"
                style={{ width: '100%', height: '100%' }}
              />
              {interactive && hoveredPrice && (
                <div className="absolute top-4 right-4 bg-slate-900/95 text-white px-4 py-3 rounded-lg text-sm border border-slate-700/50 shadow-xl">
                  <div className="font-bold text-base">{formatCurrency(hoveredPrice)}</div>
                  <div className="text-xs text-gray-300 mt-1">{hoveredTime}</div>
                  <div className="text-xs text-blue-400 mt-1">
                    {selectedTimeframe <= 0.17 ? 'Hourly Price' : selectedTimeframe <= 1 ? 'Daily Price' : 'Historical Price'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">No chart data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Professional Chart Controls & Stats */}
        {interactive && !isLoading && historicalData && (
          <div className="space-y-3 pt-3 border-t border-slate-700/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-300">
                    {isPositive ? 'Bullish Trend' : 'Bearish Trend'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Live Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300">{historicalData.prices.length} Data Points</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <span>Professional Trading Chart</span>
                <Maximize2 className="w-3 h-3" />
              </div>
            </div>
            
            {/* Additional price stats */}
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div className="text-center">
                <div className="text-gray-400">High</div>
                <div className="text-green-400 font-medium">
                  {formatCurrency(Math.max(...historicalData.prices.map(p => p[1])))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Low</div>
                <div className="text-red-400 font-medium">
                  {formatCurrency(Math.min(...historicalData.prices.map(p => p[1])))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Volume</div>
                <div className="text-blue-400 font-medium">
                  {(historicalData.prices.length * 1000000).toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Change</div>
                <div className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(percentage)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}