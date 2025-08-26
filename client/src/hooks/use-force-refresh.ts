import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useForceRefresh = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const forceRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear all cached data to force fresh API calls
      queryClient.clear();
      
      // Immediately refetch all queries to get fresh data
      await queryClient.refetchQueries({
        type: 'active',
        exact: false,
      });
      
      // Force invalidation to ensure no stale data
      await queryClient.invalidateQueries();
      
      console.log('🚀 Force refresh completed - all coin prices and data updated instantly!');
    } catch (error) {
      console.error('Error during force refresh:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return { forceRefresh, isRefreshing };
};