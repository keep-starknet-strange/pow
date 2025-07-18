/** hooks/useBubblePosition.ts */
import { useWindowDimensions } from "react-native";
import { useMemo } from "react";

const ARROW_W = 18; // = tutorial.arrow intrinsic width
const ARROW_H = 10; // = tutorial.arrow intrinsic height
const BUBBLE_W = 260; // keep in sync with TutorialOverlay
const MARGIN = 12; // min gap from screen edges

export type BubblePosition = {
  /* Bubble */
  bubbleLeft: number;
  bubbleTop: number;

  /* Arrow */
  arrowLeft: number;
  /** Y position for the arrow (parent will supply `position:"absolute"`) */
  arrowStyle: { top: number };

  /** Which way the arrow should point. Explicit > border hack. */
  direction: "up" | "down";
};

/**
 * Decide whether to show the bubble above or below the target and
 * compute absolute positions for both bubble and arrow.
 */
export const useBubblePosition = (
  target: { x: number; y: number; width: number; height: number },
  bubbleHeight: number,
): BubblePosition => {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();

  return useMemo(() => {
    /* 1️⃣ horizontal alignment ------------------------------------------------*/
    const centerX = target.x + target.width / 2;
    const bubbleLeft = Math.max(
      MARGIN,
      Math.min(centerX - BUBBLE_W / 2, SCREEN_W - BUBBLE_W - MARGIN),
    );

    /* 2️⃣ decide above ⬆️ or below ⬇️ -----------------------------------------*/
    const spaceAbove = target.y;
    const spaceBelow = SCREEN_H - (target.y + target.height);

    const showBelow =
      spaceBelow >= bubbleHeight + ARROW_H + MARGIN || spaceBelow >= spaceAbove;

    const direction: "up" | "down" = showBelow ? "up" : "down";

    /* 3️⃣ vertical coords -----------------------------------------------------*/
    const bubbleTop = showBelow
      ? target.y + target.height + ARROW_H
      : target.y - bubbleHeight - ARROW_H;

    const arrowTop = showBelow
      ? bubbleTop - ARROW_H // arrow sits just above bubble
      : bubbleTop + bubbleHeight; // arrow sits just below bubble

    /* 4️⃣ arrow X so tip stays inside bubble ----------------------------------*/
    const arrowLeft = Math.max(
      bubbleLeft, // don’t pass bubble’s left edge
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
