import { useEffect } from "react";

export const useAutoClicker = (
  isEnabled: boolean,
  intervalMs: number,
  clickFn: () => void,
) => {
  useEffect(() => {
    if (!isEnabled || intervalMs <= 0) return;
    const interval = setInterval(clickFn, intervalMs);
    return () => clearInterval(interval);
  }, [isEnabled, intervalMs, clickFn]);
};
