import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Smile, Frown, Meh } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FearGreedData {
  value: number;
  status: string;
  timestamp: string;
}

export function FearGreedWidget() {
  const { data, isLoading, error } = useQuery<FearGreedData>({
    queryKey: ['/api/fear-greed-index'],
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
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs">F&G: N/A</span>
      </div>
    );
  }

  const getStatusColor = (value: number) => {
    if (value >= 75) return "bg-red-500/20 text-red-400 border-red-500/30"; // Extreme Greed
    if (value >= 55) return "bg-orange-500/20 text-orange-400 border-orange-500/30"; // Greed
    if (value >= 45) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"; // Neutral
    if (value >= 25) return "bg-blue-500/20 text-blue-400 border-blue-500/30"; // Fear
    return "bg-purple-500/20 text-purple-400 border-purple-500/30"; // Extreme Fear
  };

  const getIcon = (value: number) => {
    if (value >= 75) return <Smile className="w-3 h-3" />; // Extreme Greed
    if (value >= 55) return <Smile className="w-3 h-3" />; // Greed
    if (value >= 45) return <Meh className="w-3 h-3" />; // Neutral
    if (value >= 25) return <Frown className="w-3 h-3" />; // Fear
    return <AlertTriangle className="w-3 h-3" />; // Extreme Fear
  };

  const getShortStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Extreme Greed': 'Greed',
      'Greed': 'Greed',
      'Neutral': 'Neutral',
      'Fear': 'Fear',
      'Extreme Fear': 'Fear'
    };
    return statusMap[status] || status;
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
              <span>F&G: {data.value}</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass-card border-gray-700">
          <div className="text-center">
            <p className="font-semibold text-white">Fear & Greed Index</p>
            <p className="text-xs text-gray-300">{data.status}</p>
            <p className="text-xs text-gray-400 mt-1">
              Market sentiment: {data.value >= 75 ? 'Extremely bullish' : 
                                data.value >= 55 ? 'Bullish' : 
                                data.value >= 45 ? 'Neutral' : 
                                data.value >= 25 ? 'Bearish' : 'Extremely bearish'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}