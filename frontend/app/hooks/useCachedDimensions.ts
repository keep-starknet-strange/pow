import { useEffect, useState } from "react";
import { Dimensions, ScaledSize } from "react-native";

interface CachedDimensions {
  window: ScaledSize;
  screen: ScaledSize;
}

let cachedDimensions: CachedDimensions | null = null;
const subscribers = new Set<() => void>();

const updateCache = () => {
  cachedDimensions = {
    window: Dimensions.get("window"),
    screen: Dimensions.get("screen"),
  };
  subscribers.forEach((callback) => callback());
};

// Initialize cache
updateCache();

// Listen for dimension changes
const subscription = Dimensions.addEventListener("change", updateCache);

export const useCachedDimensions = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const callback = () => forceUpdate({});
    subscribers.add(callback);

    return () => {
      subscribers.delete(callback);
    };
  }, []);

  return cachedDimensions!;
};

export const useCachedWindowDimensions = () => {
  const { window } = useCachedDimensions();
  return window;
};

export const useCachedScreenDimensions = () => {
  const { screen } = useCachedDimensions();
  return screen;
};

// For direct access without hook (useful for calculations outside components)
export const getCachedDimensions = () => cachedDimensions!;
export const getCachedWindowDimensions = () => cachedDimensions!.window;
export const getCachedScreenDimensions = () => cachedDimensions!.screen;
