import { useEffect, useRef, useState } from "react";
import { createChart } from 'lightweight-charts';
import { Calendar, TrendingUp, TrendingDown, Maximize2, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./glass-card";
import { useHistoricalData } from "@/hooks/use-crypto-data";
import { formatCurrency, formatPercentage } from "@/lib/api";

interface TradingViewChartProps {
  coinId: string | null;
  coinName?: string;
  height?: number;
  className?: string;
}

const timeframes = [
  { label: '1H', days: 0.04 },
  { label: '6H', days: 0.25 },
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
];

export function TradingViewChart({ 
  coinId, 
  coinName = '',
  height = 400,
  className = ""
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(1);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  
  const { data: historicalData, isLoading, error } = useHistoricalData(coinId, selectedTimeframe);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart with simple configuration
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          backgroundColor: 'transparent',
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          horzLines: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          timeVisible: true,
        },
      });

      chartRef.current = chart;

      // Try to create area series
      let series;
      try {
        series = chart.addAreaSeries({
          lineColor: '#3b82f6',
          lineWidth: 2,
          topColor: 'rgba(59, 130, 246, 0.3)',
          bottomColor: 'rgba(59, 130, 246, 0.05)',
        });
      } catch (e) {
        // Fallback to line series if area series fails
        console.log('Area series not available, using line series');
        series = chart.addLineSeries({
          color: '#3b82f6',
          lineWidth: 2,
        });
      }

      seriesRef.current = series;

      // Add crosshair move listener for price tracking
      chart.subscribeCrosshairMove((param) => {
        if (param.point && param.time) {
          try {
            const seriesData = param.seriesData.get(series);
            if (seriesData) {
              setHoveredPrice(seriesData.value || seriesData.close || seriesData);
              setHoveredTime(new Date(param.time * 1000).toLocaleString());
            }
          } catch (e) {
            // Silently handle crosshair errors
          }
        } else {
          setHoveredPrice(null);
          setHoveredTime(null);
        }
      });

      // Resize handler
      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({ 
            width: chartContainerRef.current.clientWidth,
            height: height 
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart) {
          chart.remove();
        }
      };
    } catch (error) {
      console.error('Chart creation failed:', error);
    }
  }, [height, selectedTimeframe]);

  useEffect(() => {
    if (!historicalData?.prices || !seriesRef.current) return;

    try {
      // Convert data to TradingView format
      const chartData = historicalData.prices.map(([timestamp, price]) => ({
        time: Math.floor(timestamp / 1000),
        value: price,
      }));

      // Sort by time to ensure proper order
      chartData.sort((a, b) => a.time - b.time);

      // Update chart color based on trend
      const startPrice = chartData[0]?.value || 0;
      const endPrice = chartData[chartData.length - 1]?.value || 0;
      const isPositive = endPrice > startPrice;

      // Try to update series options
      try {
        seriesRef.current.applyOptions({
          lineColor: isPositive ? '#22c55e' : '#ef4444',
          topColor: isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          bottomColor: isPositive ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
        });
      } catch (e) {
        // Fallback for line series
        try {
          seriesRef.current.applyOptions({
            color: isPositive ? '#22c55e' : '#ef4444',
          });
        } catch (e2) {
          console.log('Could not update series color');
        }
      }

      seriesRef.current.setData(chartData);

      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      console.error('Chart data update failed:', error);
    }
  }, [historicalData]);

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
  const currentPrice = hoveredPrice || (historicalData?.prices ? historicalData.prices[historicalData.prices.length - 1][1] : 0);

  if (error) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-center">
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
        {/* Chart Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-white">
                {coinName} Chart
              </h3>
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
            
            {!isLoading && historicalData && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(currentPrice)}
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

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe.days}
                  variant={selectedTimeframe === timeframe.days ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe.days)}
                  className={`text-xs px-3 py-1 ${
                    selectedTimeframe === timeframe.days
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {timeframe.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative bg-slate-900/30 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/20 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">Loading chart data...</p>
              </div>
            </div>
          )}
          
          <div 
            ref={chartContainerRef} 
            className="w-full"
            style={{ height }}
          />
        </div>

        {/* Chart Controls */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>Price Trend</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Real-time Data</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Scroll to zoom • Drag to pan</span>
            <Maximize2 className="w-3 h-3" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}