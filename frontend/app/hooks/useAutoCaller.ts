import { useEffect, useRef } from "react";

export const useAutoCaller = (
  isEnabled: boolean,
  intervalMs: number,
  call: () => void
) => {
  const savedCallback = useRef(call);

  useEffect(() => {
    savedCallback.current = call;
  }, [call]);

  useEffect(() => {
    if (!isEnabled || intervalMs <= 0) return;

    console.log("set interval!!!!!!!!!!!!!!!!");
    const id = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => {
      console.log("CLEARR!!!!!!!!!!");
      clearInterval(id);
    };
  }, [isEnabled, intervalMs]);
};
