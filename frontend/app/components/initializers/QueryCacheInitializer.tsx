import { useEffect, memo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

export const QueryCacheInitializer = memo(() => {
  const queryClient = useQueryClient();

  // Restore cache on mount
  useEffect(() => {
    const restoreQueryCache = async () => {
      try {
        const stored = await AsyncStorage.getItem("query-cache");
        if (stored) {
          const queries = JSON.parse(stored);
          const now = Date.now();

          queries.forEach((query: any) => {
            // Only restore if data is less than 30 minutes old
            if (now - query.dataUpdatedAt < 30 * 60 * 1000) {
              queryClient.setQueryData(query.queryKey, query.data);
            }
          });
        }
      } catch (error) {
        console.warn("Failed to restore query cache:", error);
      }
    };

    restoreQueryCache();
  }, [queryClient]);

  // Set up cache persistence
  useEffect(() => {
    const persistQueryCache = async () => {
      try {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll().map((query) => ({
          queryKey: query.queryKey,
          queryHash: query.queryHash,
          data: query.state.data,
          dataUpdatedAt: query.state.dataUpdatedAt,
        }));

        await AsyncStorage.setItem("query-cache", JSON.stringify(queries));
      } catch (error) {
        console.warn("Failed to persist query cache:", error);
      }
    };

    // Persist cache every 30 seconds when queries change
    let persistTimeout: ReturnType<typeof setTimeout>;
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      clearTimeout(persistTimeout);
      persistTimeout = setTimeout(persistQueryCache, 30000);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return null;
});

QueryCacheInitializer.displayName = "QueryCacheInitializer";