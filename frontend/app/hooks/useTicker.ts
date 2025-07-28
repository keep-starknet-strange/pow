import { useState, useEffect } from "react";
import { useInterval } from "usehooks-ts";

export function useTicker(intervalMs: number) {
  const [tick, setTick] = useState(0);
  useInterval(() => {
    setTick((t) => t + 1);
  }, intervalMs);
  return tick;
}
