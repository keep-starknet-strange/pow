import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryCacheInitializer } from "../components/initializers/QueryCacheInitializer";

// Create a client with optimized defaults for mobile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default cache time - data stays in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Default stale time - data is considered fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for mobile apps
      refetchOnWindowFocus: false,
      // Refetch on reconnect is useful for mobile
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: "always",
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryCacheInitializer />
      {children}
    </QueryClientProvider>
  );
};

export { queryClient };
