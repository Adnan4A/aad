import { useGlobalStats } from "@/hooks/use-crypto-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

export function DominanceWidget() {
  const { data, isLoading, error } = useGlobalStats();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 rounded animate-pulse bg-gray-600"></div>
        <div className="w-20 h-4 rounded animate-pulse bg-gray-600"></div>
      </div>
    );
  }

  if (error || !data || !data.btcDominance) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <Crown className="w-4 h-4" />
        <span className="text-xs">BTC: N/A</span>
      </div>
    );
  }

  const getDominanceColor = (dominance: number) => {
    if (dominance > 50) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    if (dominance > 40) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 cursor-help">
            <Badge 
              variant="outline" 
              className={`glass-card ${getDominanceColor(data.btcDominance)} flex items-center space-x-1 text-xs px-2 py-1`}
              data-testid="dominance-widget"
            >
              <Crown className="w-3 h-3" />
              <span>BTC: {data.btcDominance.toFixed(1)}%</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass-card border-gray-700">
          <div className="text-center">
            <p className="font-semibold text-white">Bitcoin Dominance</p>
            <p className="text-sm text-gray-300">{data.btcDominance.toFixed(2)}%</p>
            {data.ethDominance && (
              <p className="text-xs text-gray-400 mt-1">
                ETH: {data.ethDominance.toFixed(2)}%
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Bitcoin's share of total crypto market cap
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}