import { useEffect, useRef, useState } from 'react';
import { useHistoricalData } from '@/hooks/use-crypto-data';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, LineChart, Activity } from 'lucide-react';

interface LiquidChartProps {
  coinId: string;
  coinName: string;
  currentPrice: number;
  priceChange24h: number;
}

const timeframes = [
  { label: '15m', value: 0.01, interval: 'hourly' },
  { label: '1H', value: 0.04, interval: 'hourly' },
  { label: '4H', value: 0.17, interval: 'hourly' },
  { label: '1D', value: 1, interval: 'daily' },
  { label: '7D', value: 7, interval: 'daily' },
  { label: '30D', value: 30, interval: 'daily' }
];

const chartTypes = [
  { label: 'Line', value: 'line', icon: LineChart },
  { label: 'Area', value: 'area', icon: BarChart3 },
  { label: 'Candle', value: 'candle', icon: Activity }
];

export function LiquidChart({ coinId, coinName, currentPrice, priceChange24h }: LiquidChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(1); // 1 day default
  const [selectedInterval, setSelectedInterval] = useState('daily');
  const [chartType, setChartType] = useState('area');
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const { trackChartView } = useActivityTracking();

  // Fetch real historical data from CoinGecko API
  const { data: historicalData, isLoading, error, refetch } = useHistoricalData(
    coinId, 
    selectedTimeframe, 
    selectedInterval
  );

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Track chart view when timeframe or chart type changes
  useEffect(() => {
    if (coinId && coinName) {
      const timeframeLabel = timeframes.find(tf => tf.value === selectedTimeframe)?.label || 'unknown';
      trackChartView(coinId, coinName, `${timeframeLabel}-${chartType}`);
    }
  }, [coinId, coinName, selectedTimeframe, chartType, trackChartView]);

  const drawChart = () => {
    if (!historicalData?.prices || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 60, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Clear canvas with liquid glass background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const prices = historicalData.prices;
    if (prices.length === 0) return;

    // Calculate price range
    const priceValues = prices.map(([, price]) => price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const priceRange = maxPrice - minPrice;
    const padding_price = priceRange * 0.1;

    // Time range
    const minTime = prices[0][0];
    const maxTime = prices[prices.length - 1][0];
    const timeRange = maxTime - minTime;

    // Helper functions
    const getX = (timestamp: number) => 
      padding.left + (timestamp - minTime) / timeRange * chartWidth;
    
    const getY = (price: number) => 
      padding.top + (maxPrice + padding_price - price) / (priceRange + 2 * padding_price) * chartHeight;

    // Draw price grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const gridLines = 8;
    for (let i = 0; i <= gridLines; i++) {
      const price = minPrice - padding_price + (priceRange + 2 * padding_price) * i / gridLines;
      const y = getY(price);
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Price labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, padding.left - 10, y + 3);
    }

    // Draw time grid lines
    const timeGridLines = 6;
    for (let i = 0; i <= timeGridLines; i++) {
      const time = minTime + timeRange * i / timeGridLines;
      const x = getX(time);
      
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();

      // Time labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      const timeLabel = new Date(time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        ...(selectedTimeframe >= 7 ? { month: 'short', day: 'numeric' } : {})
      });
      ctx.fillText(timeLabel, x, padding.top + chartHeight + 20);
    }

    // Draw chart based on type
    if (chartType === 'area') {
      // Create gradient
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

      // Draw area
      ctx.beginPath();
      ctx.moveTo(getX(prices[0][0]), getY(prices[0][1]));
      
      for (let i = 1; i < prices.length; i++) {
        ctx.lineTo(getX(prices[i][0]), getY(prices[i][1]));
      }
      
      ctx.lineTo(getX(prices[prices.length - 1][0]), padding.top + chartHeight);
      ctx.lineTo(getX(prices[0][0]), padding.top + chartHeight);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw price line
    ctx.strokeStyle = priceChange24h >= 0 ? 'rgba(74, 222, 128, 0.9)' : 'rgba(248, 113, 113, 0.9)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(getX(prices[0][0]), getY(prices[0][1]));
    
    for (let i = 1; i < prices.length; i++) {
      ctx.lineTo(getX(prices[i][0]), getY(prices[i][1]));
    }
    ctx.stroke();

    // Draw current price indicator
    const lastPrice = prices[prices.length - 1][1];
    const lastY = getY(lastPrice);
    
    ctx.fillStyle = priceChange24h >= 0 ? 'rgba(74, 222, 128, 1)' : 'rgba(248, 113, 113, 1)';
    ctx.beginPath();
    ctx.arc(getX(prices[prices.length - 1][0]), lastY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Current price label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`$${lastPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 
      padding.left + chartWidth + 10, lastY + 4);

    // Draw crosshair if hovering
    if (mousePosition && hoveredPrice && hoveredTime) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePosition.x, padding.top);
      ctx.lineTo(mousePosition.x, padding.top + chartHeight);
      ctx.stroke();
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padding.left, mousePosition.y);
      ctx.lineTo(padding.left + chartWidth, mousePosition.y);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!historicalData?.prices || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const padding = { top: 20, right: 60, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;

    if (x >= padding.left && x <= padding.left + chartWidth) {
      const prices = historicalData.prices;
      const timeRange = prices[prices.length - 1][0] - prices[0][0];
      const relativeX = (x - padding.left) / chartWidth;
      const targetTime = prices[0][0] + timeRange * relativeX;

      // Find closest price point
      let closestIndex = 0;
      let minDistance = Math.abs(prices[0][0] - targetTime);
      
      for (let i = 1; i < prices.length; i++) {
        const distance = Math.abs(prices[i][0] - targetTime);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      const [timestamp, price] = prices[closestIndex];
      setHoveredPrice(price);
      setHoveredTime(new Date(timestamp).toLocaleString());
      setMousePosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPrice(null);
    setHoveredTime(null);
    setMousePosition(null);
  };

  useEffect(() => {
    drawChart();
  }, [historicalData, chartType, mousePosition]);

  if (error) {
    return (
      <Card className="p-6 bg-white/5 backdrop-blur border-white/10">
        <div className="text-center text-white/70">
          <p>Unable to load real market data</p>
          <p className="text-sm">Please check your internet connection</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white/5 backdrop-blur border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">{coinName} Price Chart</h3>
            <Badge variant={priceChange24h >= 0 ? "default" : "destructive"} className="bg-white/10">
              {priceChange24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {priceChange24h.toFixed(2)}%
            </Badge>
          </div>
          
          {/* Current price display */}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              ${hoveredPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 
                currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            {hoveredTime && (
              <div className="text-sm text-white/70">{hoveredTime}</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Timeframe buttons */}
          <div className="flex flex-wrap gap-1">
            {timeframes.map(({ label, value, interval }) => (
              <Button
                key={label}
                variant={selectedTimeframe === value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTimeframe(value);
                  setSelectedInterval(interval);
                }}
                className={`
                  bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all
                  ${selectedTimeframe === value ? 'bg-white/30 shadow-lg' : ''}
                `}
                data-testid={`timeframe-${label}`}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Chart type buttons */}
          <div className="flex gap-1">
            {chartTypes.map(({ label, value, icon: Icon }) => (
              <Button
                key={value}
                variant={chartType === value ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType(value)}
                className={`
                  bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all
                  ${chartType === value ? 'bg-white/30 shadow-lg' : ''}
                `}
                data-testid={`chart-type-${value}`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline ml-1">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          data-testid="price-chart-canvas"
        />
      </div>

      {/* Chart info */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-white/60">Volume 24h</div>
            <div className="text-white font-medium">Real-time data</div>
          </div>
          <div>
            <div className="text-white/60">Market Cap</div>
            <div className="text-white font-medium">Live updates</div>
          </div>
          <div>
            <div className="text-white/60">Data Source</div>
            <div className="text-white font-medium">CoinGecko API</div>
          </div>
          <div>
            <div className="text-white/60">Update Frequency</div>
            <div className="text-white font-medium">10 seconds</div>
          </div>
        </div>
      </div>
    </Card>
  );
}