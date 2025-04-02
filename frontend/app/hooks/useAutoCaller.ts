import { useEffect } from "react";

export const useAutoCaller = (
  isEnabled: boolean,
  intervalMs: number,
  call: () => void
) => {
  useEffect(() => {
    if (!isEnabled || intervalMs <= 0) return;
    console.log("set interval!!!!!!!!!!!!!!!!")
    const interval = setInterval(call, intervalMs);
    return () => {
      console.log("CLEARR!!!!!!!!!!")
      clearInterval(interval);
    }
  }, [isEnabled, intervalMs, call]);
};
