import { useGlobalStats } from "@/hooks/use-crypto-data";
import { formatNumber } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export function MarketCapWidget() {
  const { data, isLoading, error } = useGlobalStats();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 rounded animate-pulse bg-gray-600"></div>
        <div className="w-20 h-4 rounded animate-pulse bg-gray-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <span className="text-xs">MCap: N/A</span>
      </div>
    );
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (change < 0) return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 cursor-help">
            <Badge 
              variant="outline" 
              className={`glass-card ${getChangeColor(data.marketCapChange24h)} flex items-center space-x-1 text-xs px-2 py-1`}
              data-testid="market-cap-widget"
            >
              {getChangeIcon(data.marketCapChange24h)}
              <span>MCap: ${formatNumber(data.totalMarketCap)}</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass-card border-gray-700">
          <div className="text-center">
            <p className="font-semibold text-white">Total Market Cap</p>
            <p className="text-sm text-gray-300">${data.totalMarketCap.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">
              24h Change: {data.marketCapChange24h > 0 ? '+' : ''}{data.marketCapChange24h.toFixed(2)}%
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}