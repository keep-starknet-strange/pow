import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchRemoteConfig } from "../services/remoteConfig";

const DISMISSED_NEWS_KEY = "@pow_dismissed_news_hash";

interface RemoteConfigState {
  minVersion: string | null;
  newsMessage: string | null;
  optionalLink: string | null;
  lastFetchedAt: number | null;
  isLoading: boolean;
  dismissedNewsHash: string | null;

  fetchConfig: () => Promise<void>;
  dismissNews: () => Promise<void>;
  shouldShowNews: () => boolean;
  loadDismissedNewsHash: () => Promise<void>;
}

// Simple hash function for news message
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

export const useRemoteConfigStore = create<RemoteConfigState>((set, get) => ({
  minVersion: null,
  newsMessage: null,
  optionalLink: null,
  lastFetchedAt: null,
  isLoading: false,
  dismissedNewsHash: null,

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      const config = await fetchRemoteConfig();
      if (config) {
        set({
          minVersion: config.minVersion,
          newsMessage: config.newsMessage,
          optionalLink: config.optionalLink,
          lastFetchedAt: Date.now(),
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error in fetchConfig:", error);
      set({ isLoading: false });
    }
  },

  dismissNews: async () => {
    const { newsMessage } = get();
    if (!newsMessage) return;

    const hash = hashString(newsMessage);
    try {
      await AsyncStorage.setItem(DISMISSED_NEWS_KEY, hash);
      set({ dismissedNewsHash: hash });
    } catch (error) {
      console.error("Error saving dismissed news hash:", error);
    }
  },

  shouldShowNews: () => {
    const { newsMessage, dismissedNewsHash } = get();
    if (!newsMessage || newsMessage.trim() === "") return false;

    const currentHash = hashString(newsMessage);
    return currentHash !== dismissedNewsHash;
  },

  loadDismissedNewsHash: async () => {
    try {
      const hash = await AsyncStorage.getItem(DISMISSED_NEWS_KEY);
      set({ dismissedNewsHash: hash });
    } catch (error) {
      console.error("Error loading dismissed news hash:", error);
    }
  },
}));

export const useRemoteConfig = () => {
  const {
    minVersion,
    newsMessage,
    optionalLink,
    lastFetchedAt,
    isLoading,
    fetchConfig,
    dismissNews,
    shouldShowNews,
    loadDismissedNewsHash,
  } = useRemoteConfigStore();

  return {
    minVersion,
    newsMessage,
    optionalLink,
    lastFetchedAt,
    isLoading,
    fetchConfig,
    dismissNews,
    shouldShowNews,
    loadDismissedNewsHash,
  };
};
