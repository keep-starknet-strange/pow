import { useEffect, useRef } from "react";

export const useAutoClicker = (
  isEnabled: boolean,
  intervalMs: number,
  clickFn: () => void
) => {
  useEffect(() => {
    const savedClickFn = clickFn;
    if (!isEnabled || intervalMs <= 0) return;
    console.log("SET!!!!!!!!!!")
    const interval = setInterval(clickFn, intervalMs);
    return () => {
      console.log("clear!!!!!!!")
      clearInterval(interval);
    }
  }, [isEnabled, intervalMs, clickFn]);
};
