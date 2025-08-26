import { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MiniChartProps {
  data: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export function MiniChart({ 
  data, 
  isPositive = true, 
  width = 80, 
  height = 30,
  className = ""
}: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || data.length < 2 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas for high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Filter out null/undefined values
    const validData = data.filter(value => value !== null && value !== undefined && !isNaN(value));
    if (validData.length < 2) return;

    // Calculate chart dimensions
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max values
    const minValue = Math.min(...validData);
    const maxValue = Math.max(...validData);
    const range = maxValue - minValue;

    // Handle case where all values are the same
    if (range === 0) {
      const y = height / 2;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.strokeStyle = isPositive ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return;
    }

    // Draw the line chart
    ctx.beginPath();
    validData.forEach((value, index) => {
      const x = padding + (index / (validData.length - 1)) * chartWidth;
      const y = padding + (1 - (value - minValue) / range) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = isPositive ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

  }, [data, isPositive, width, height]);

  if (!data || data.length < 2) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="w-1 h-1 bg-gray-500 rounded-full opacity-50" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height }}
    />
  );
}

interface SparklineProps {
  data: number[];
  change?: number;
  className?: string;
}

export function Sparkline({ data, change, className = "" }: SparklineProps) {
  const isPositive = change ? change > 0 : data.length > 1 && data[data.length - 1] > data[0];
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <MiniChart 
        data={data} 
        isPositive={isPositive}
        width={60}
        height={20}
      />
      {change !== undefined && (
        <div className="flex items-center space-x-1">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {Math.abs(change).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}