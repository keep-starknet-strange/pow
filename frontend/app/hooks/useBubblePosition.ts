import { useMemo } from "react";
import { Dimensions, ViewStyle } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUBBLE_MAX_WIDTH = 260;
const HORIZONTAL_MARGIN = 8;
const ARROW_SIZE = 8;
const ARROW_SPACING = 4;
const BUBBLE_WIDTH = Math.min(SCREEN_WIDTH * 0.8, BUBBLE_MAX_WIDTH);

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

export function useBubblePosition(
  target: { x: number; y: number; width: number; height: number },
  bubbleHeight: number,
  insetTop: number
) {
  const { x, y, width, height } = target;
  const roomBelow = SCREEN_HEIGHT - (y + height) - insetTop;
  const showBelow = roomBelow >= bubbleHeight + ARROW_SIZE + ARROW_SPACING;

  let top = showBelow
    ? y + height + ARROW_SIZE + ARROW_SPACING - insetTop
    : y - bubbleHeight - ARROW_SIZE - ARROW_SPACING - insetTop;

  top = clamp(top, insetTop + HORIZONTAL_MARGIN, SCREEN_HEIGHT - bubbleHeight - HORIZONTAL_MARGIN);
  const left = clamp(x + width / 2 - BUBBLE_WIDTH / 2, HORIZONTAL_MARGIN, SCREEN_WIDTH - BUBBLE_WIDTH - HORIZONTAL_MARGIN);

  const arrowLeft = clamp(x + width / 2 - ARROW_SIZE, HORIZONTAL_MARGIN, SCREEN_WIDTH - ARROW_SIZE - HORIZONTAL_MARGIN);
  const arrowStyle: ViewStyle = showBelow
    ? {
        position: "absolute",
        top: top - ARROW_SIZE,
        borderLeftWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#FBBF24",
      }
    : {
        position: "absolute",
        top: top + bubbleHeight,
        borderLeftWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderTopWidth: ARROW_SIZE,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#FBBF24",
      };

  return useMemo(() => ({ left, top, style: arrowStyle, arrowLeft }), [left, top, arrowStyle, arrowLeft]);
}
