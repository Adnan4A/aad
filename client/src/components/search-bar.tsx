import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchCoins } from "@/hooks/use-crypto-data";
import { GlassCard } from "./glass-card";
import type { SearchResult } from "@/lib/types";

interface SearchBarProps {
  onCoinSelect?: (coinId: string) => void;
}

export function SearchBar({ onCoinSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { data: searchResults = [], isLoading } = useSearchCoins(query);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length >= 2);
  };

  const handleCoinSelect = (coin: SearchResult) => {
    setQuery("");
    setIsOpen(false);
    onCoinSelect?.(coin.id);
  };

  return (
    <div ref={searchRef} className="relative" data-testid="search-bar">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search coins..."
          value={query}
          onChange={handleInputChange}
          className="glass-card pl-10 w-64 focus:ring-2 focus:ring-accent-blue border-gray-600"
          data-testid="search-input"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50" data-testid="search-results">
          <GlassCard className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400" data-testid="search-loading">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((coin: SearchResult) => (
                  <div
                    key={coin.id}
                    className="p-3 hover:bg-primary-700 cursor-pointer transition-colors"
                    onClick={() => handleCoinSelect(coin)}
                    data-testid={`search-result-${coin.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      {coin.thumb && (
                        <img
                          src={coin.thumb}
                          alt={coin.name}
                          className="w-6 h-6 rounded-full"
                          data-testid={`search-result-image-${coin.id}`}
                        />
                      )}
                      <div>
                        <p className="font-medium text-white" data-testid={`search-result-name-${coin.id}`}>
                          {coin.name}
                        </p>
                        <p className="text-sm text-gray-400 uppercase" data-testid={`search-result-symbol-${coin.id}`}>
                          {coin.symbol}
                        </p>
                      </div>
                      {coin.market_cap_rank && (
                        <div className="ml-auto">
                          <span className="text-xs text-gray-500" data-testid={`search-result-rank-${coin.id}`}>
                            #{coin.market_cap_rank}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-400" data-testid="search-no-results">
                No coins found
              </div>
            ) : null}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
