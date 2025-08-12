import { useMemo } from "react";

export function useHighlightMasks(highlightPosition: {
  top: number;
  left: number;
  width: number;
  height: number;
}) {
  return useMemo(() => {
    const { top, left, width, height } = highlightPosition;

    // Use Math.floor for starting positions and Math.ceil for sizes to ensure full coverage
    return [
      { top: 0, left: 0, right: 0, height: Math.floor(top) }, // top mask
      { top: Math.ceil(top + height), left: 0, right: 0, bottom: 0 }, // bottom mask
      { top: Math.floor(top), left: 0, width: Math.floor(left), height: Math.ceil(height) }, // left mask
      { top: Math.floor(top), left: Math.ceil(left + width), right: 0, height: Math.ceil(height) }, // right mask
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

    // Round the base position values to avoid fractional pixels
    return {
      top: Math.round(y) - 4,
      left: Math.round(x) - 4,
      width: Math.round(width) + 8,
      height: Math.round(height) + 8,
    };
  }, [highlightTarget]);
}
