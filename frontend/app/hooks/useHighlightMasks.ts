import { useMemo } from "react";

export function useHighlightMasks(
  highlightTarget: { x: number; y: number; width: number; height: number },
  insetTop: number,
) {
  return useMemo(() => {
    const { x, y, width, height } = highlightTarget;
    const topOffset = y - insetTop;

    return [
      { top: 0, left: 0, right: 0, height: topOffset },
      { top: topOffset + height, left: 0, right: 0, bottom: 0 },
      { top: topOffset, left: 0, width: x, height },
      { top: topOffset, left: x + width, right: 0, height },
    ];
  }, [highlightTarget, insetTop]);
}
