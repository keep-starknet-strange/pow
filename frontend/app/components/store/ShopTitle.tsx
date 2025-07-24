import { useRef } from "react";
import Animated, { FadeInLeft, runOnJS } from "react-native-reanimated";
import { InteractionManager } from "react-native";

export function ShopTitle({ position }: { position: "left" | "right" }) {
  const handleRef = useRef<number | null>(null);

  if (handleRef.current === null) {
    handleRef.current = InteractionManager.createInteractionHandle();
  }

  const clearHandle = () => {
    if (handleRef.current !== null) {
      InteractionManager.clearInteractionHandle(handleRef.current);
      handleRef.current = null;
    }
  };

  return (
    <Animated.Text
      className={`font-Pixels text-xl absolute ${
        position === "left" ? "left-[12px]" : "right-2"
      } text-[#fff7ff]`}
      entering={FadeInLeft.duration(300).withCallback(() => {
        runOnJS(clearHandle)();
      })}
    >
      SHOP
    </Animated.Text>
  );
}
