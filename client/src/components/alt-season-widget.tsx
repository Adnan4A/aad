import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AltSeasonData {
  value: number;
  status: string;
  timestamp: string;
}

export function AltSeasonWidget() {
  const { data, isLoading, error } = useQuery<AltSeasonData>({
    queryKey: ['/api/alt-season-index'],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 rounded animate-pulse bg-gray-600"></div>
        <div className="w-16 h-4 rounded animate-pulse bg-gray-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <Activity className="w-4 h-4" />
        <span className="text-xs">Alt Index: N/A</span>
      </div>
    );
  }

  const getStatusColor = (value: number) => {
    if (value > 75) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (value < 25) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getIcon = (value: number) => {
    if (value > 75) return <TrendingUp className="w-3 h-3" />;
    if (value < 25) return <TrendingDown className="w-3 h-3" />;
    return <Activity className="w-3 h-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 cursor-help">
            <Badge 
              variant="outline" 
              className={`glass-card ${getStatusColor(data.value)} flex items-center space-x-1 text-xs px-2 py-1`}
            >
              {getIcon(data.value)}
              <span>Alt: {data.value}</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass-card border-gray-700">
          <div className="text-center">
            <p className="font-semibold text-white">Alt Season Index</p>
            <p className="text-xs text-gray-300">{data.status}</p>
            <p className="text-xs text-gray-400 mt-1">
              {data.value > 75 ? 'Altcoins outperforming Bitcoin' : 
               data.value < 25 ? 'Bitcoin outperforming altcoins' : 
               'Mixed market conditions'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}