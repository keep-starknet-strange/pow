/** hooks/useBubblePosition.ts */
import { useMemo } from "react";
import { useCachedWindowDimensions } from "./useCachedDimensions";

const ARROW_W = 18;
const ARROW_H = 10;
const BUBBLE_W = 260;
const MARGIN = 12;

export type BubblePosition = {
  bubbleLeft: number;
  bubbleTop: number;
  arrowLeft: number;
  arrowStyle: { top: number };
  direction: "up" | "down";
};

export const useBubblePosition = (
  target: { x: number; y: number; width: number; height: number },
  bubbleHeight: number,
): BubblePosition => {
  const { width: SCREEN_W, height: SCREEN_H } = useCachedWindowDimensions();

  return useMemo(() => {
    const centerX = target.x + target.width / 2;
    const bubbleLeft = Math.max(
      MARGIN,
      Math.min(centerX - BUBBLE_W / 2, SCREEN_W - BUBBLE_W - MARGIN),
    );

    const spaceAbove = target.y;
    const spaceBelow = SCREEN_H - (target.y + target.height);

    const showBelow =
      spaceBelow >= bubbleHeight + ARROW_H + MARGIN || spaceBelow >= spaceAbove;

    const direction: "up" | "down" = showBelow ? "up" : "down";

    const bubbleTop = showBelow
      ? target.y + target.height + ARROW_H
      : target.y - bubbleHeight - ARROW_H;

    const arrowTop = showBelow ? bubbleTop - ARROW_H : bubbleTop + bubbleHeight;

    const arrowLeft = Math.max(
      bubbleLeft,
      Math.min(centerX - ARROW_W / 2, bubbleLeft + BUBBLE_W - ARROW_W),
    );

    return {
      bubbleLeft,
      bubbleTop,
      arrowLeft,
      arrowStyle: { top: arrowTop },
      direction,
    };
  }, [SCREEN_W, SCREEN_H, target, bubbleHeight]);
};
