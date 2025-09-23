import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFocEngine, FocAccount, FOC_ENGINE_API } from '../context/FocEngineConnector';
import { usePowContractConnector } from '../context/PowContractConnector';
import { createNounsAttributes, getRandomNounsAttributes } from '../configs/nouns';
import { useMock } from '../api/requests';

export interface LeaderboardUser {
  id: number;
  name: string;
  address: string;
  nouns: {
    head: number;
    body: number;
    glasses: number;
    accessories: number;
  };
  prestige: number;
  balance: number;
}

export interface LeaderboardPageData {
  users: LeaderboardUser[];
  hasMore: boolean;
  page: number;
}

// Mock data for development
const leaderboardMock: LeaderboardUser[] = [
  {
    id: 1,
    name: "Satoshi",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    nouns: { head: 4, body: 2, glasses: 1, accessories: 3 },
    prestige: 10,
    balance: 1_245_000_000,
  },
  {
    id: 2,
    name: "Mr Moneybags",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    nouns: { head: 5, body: 3, glasses: 2, accessories: 4 },
    prestige: 6,
    balance: 4_290_000,
  },
  {
    id: 3,
    name: "Builder",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    nouns: { head: 3, body: 1, glasses: 0, accessories: 2 },
    prestige: 3,
    balance: 62_000,
  },
  {
    id: 4,
    name: "Hello World",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    nouns: { head: 2, body: 0, glasses: 1, accessories: 1 },
    prestige: 1,
    balance: 1_000,
  },
  {
    id: 5,
    name: "Test User",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    nouns: { head: 0, body: 0, glasses: 0, accessories: 0 },
    prestige: 0,
    balance: 200,
  },
  {
    id: 6,
    name: "Another User With Long Name",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    nouns: { head: 1, body: 1, glasses: 1, accessories: 1 },
    prestige: 2,
    balance: 5_000,
  },
];

/**
 * Hook to fetch leaderboard data with pagination
 */
export const useLeaderboardInfiniteQuery = () => {
  const { getAccounts } = useFocEngine();
  const { getUserPrestiges } = usePowContractConnector();
  const pageSize = 20;

  const fetchLeaderboardPage = async ({ pageParam = 0 }): Promise<LeaderboardPageData> => {
    // Use mock data if enabled
    if (useMock) {
      const startIndex = pageParam * pageSize;
      const endIndex = startIndex + pageSize;
      const pageUsers = leaderboardMock.slice(startIndex, endIndex);
      
      return {
        users: pageUsers.map((user, index) => ({
          ...user,
          id: startIndex + index + 1,
        })),
        hasMore: endIndex < leaderboardMock.length,
        page: pageParam,
      };
    }

    // Fetch real data
    const response = await fetch(
      `${FOC_ENGINE_API}/indexer/events-latest-ordered?order=desc&pageLength=${pageSize}&page=${pageParam}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const events = data.events || [];
    const hasMore = events.length === pageSize;

    // Extract user addresses and balances from events
    const eventData = events.map((event: any) => ({
      user: event.keys[1],
      balance: parseInt(event.data[1], 16),
    }));

    const addresses = eventData.map((item: any) => item.user);
    
    // Fetch account data and prestiges in parallel
    const [accounts, prestiges] = await Promise.all([
      getAccounts(addresses, undefined, true),
      getUserPrestiges(addresses),
    ]);

    const users: LeaderboardUser[] = eventData.map((item: any, index: number) => {
      const shortAddress = item.user.slice(0, 4) + "..." + item.user.slice(-4);
      const account = accounts?.find(
        (account) => account.account_address === item.user,
      );
      const hasValidUsername =
        account?.account.username &&
        typeof account.account.username === "string" &&
        account.account.username.trim().length > 1;
      const name = hasValidUsername ? account.account.username : shortAddress;

      const baseId = pageParam * pageSize + index + 1;
      return {
        address: item.user,
        balance: item.balance,
        prestige: prestiges && prestiges[index] !== undefined ? prestiges[index] : 0,
        nouns:
          account?.account.metadata && account.account.metadata.length === 4
            ? createNounsAttributes(
                parseInt(account.account.metadata[0], 16),
                parseInt(account.account.metadata[1], 16),
                parseInt(account.account.metadata[2], 16),
                parseInt(account.account.metadata[3], 16),
              )
            : getRandomNounsAttributes(item.user),
        name,
        id: baseId,
      };
    });

    // Sort by balance (highest first)
    users.sort((a, b) => b.balance - a.balance);

    return {
      users,
      hasMore,
      page: pageParam,
    };
  };

  return useInfiniteQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboardPage,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to fetch individual user account data with caching
 */
export const useAccountQuery = (address: string, enabled: boolean = true) => {
  const { getAccount } = useFocEngine();

  return useQuery({
    queryKey: ['account', address],
    queryFn: () => getAccount(address, undefined, true),
    enabled: enabled && !!address,
    staleTime: 15 * 60 * 1000, // 15 minutes - account data changes less frequently
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch multiple accounts with caching
 */
export const useAccountsQuery = (addresses: string[], enabled: boolean = true) => {
  const { getAccounts } = useFocEngine();

  return useQuery({
    queryKey: ['accounts', addresses.sort()], // Sort for consistent cache keys
    queryFn: () => getAccounts(addresses, undefined, true),
    enabled: enabled && addresses.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch user prestiges with caching
 */
export const usePrestigesQuery = (addresses: string[], enabled: boolean = true) => {
  const { getUserPrestiges } = usePowContractConnector();

  return useQuery({
    queryKey: ['prestiges', addresses.sort()],
    queryFn: () => getUserPrestiges(addresses),
    enabled: enabled && addresses.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes - prestige changes moderately
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Mutation to invalidate leaderboard cache when user data changes
 */
export const useInvalidateLeaderboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // This mutation doesn't actually call an API, it just invalidates cache
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalidate leaderboard data to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};

/**
 * Mutation to update user account data optimistically
 */
export const useUpdateAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ address, data }: { address: string; data: Partial<FocAccount> }) => {
      // This would normally call an API to update the account
      // For now, we'll just update the cache optimistically
      return data;
    },
    onSuccess: (data, variables) => {
      // Update account cache
      queryClient.setQueryData(['account', variables.address], (old: FocAccount | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      // Invalidate leaderboard to show updated data
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};
