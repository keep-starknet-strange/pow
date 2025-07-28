import { useEffect } from "react";
import { useInterval } from "usehooks-ts";

export const useAutoClicker = (
  isEnabled: boolean,
  intervalMs: number,
  clickFn: () => void,
) => {
  useInterval(
    () => {
      if (isEnabled) {
        clickFn();
      }
    },
    isEnabled ? intervalMs : null,
  );
};
