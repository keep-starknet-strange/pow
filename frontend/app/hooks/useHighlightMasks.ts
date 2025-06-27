import { useMemo } from "react";

export function useHighlightMasks(highlightPosition: {
  top: number;
  left: number;
  width: number;
  height: number;
}) {
  return useMemo(() => {
    const { top, left, width, height } = highlightPosition;

    return [
      { top: 0, left: 0, right: 0, height: top }, // top mask
      { top: top + height, left: 0, right: 0, bottom: 0 }, // bottom mask
      { top: top, left: 0, width: left, height }, // left mask
      { top: top, left: left + width, right: 0, height }, // right mask
    ];
  }, [highlightPosition]);
}

export function useHightlightPosition(highlightTarget: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return useMemo(() => {
    const { x, y, width, height } = highlightTarget;
    const topOffset = y;

    return {
      top: y - 4,
      left: x - 4,
      width: width + 8,
      height: height + 8,
    };
  }, [highlightTarget]);
}
