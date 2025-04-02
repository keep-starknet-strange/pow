import { useState, useEffect, useRef } from "react";

export const useCalculateTps = () => {
  const [tps, setTps] = useState(0);
  const txTimestamps = useRef<number[]>([]);

  const recordTransaction = () => {
    const now = Date.now();
    txTimestamps.current.push(now);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Filter to keep only transactions from the last second
      txTimestamps.current = txTimestamps.current.filter(ts => now - ts <= 1000);
      setTps(txTimestamps.current.length);
    }, 500); // update TPS every 0.5s

    return () => clearInterval(interval);
  }, []);

  return { tps, recordTransaction };
};
