import { useGlobalStats } from "@/hooks/use-crypto-data";
import { formatNumber } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export function VolumeWidget() {
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
        <BarChart3 className="w-4 h-4" />
        <span className="text-xs">Vol: N/A</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 cursor-help">
            <Badge 
              variant="outline" 
              className="glass-card bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center space-x-1 text-xs px-2 py-1"
              data-testid="volume-widget"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Vol: ${formatNumber(data.totalVolume)}</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass-card border-gray-700">
          <div className="text-center">
            <p className="font-semibold text-white">24h Trading Volume</p>
            <p className="text-sm text-gray-300">${data.totalVolume.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">
              Total trading volume across all cryptocurrencies
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}