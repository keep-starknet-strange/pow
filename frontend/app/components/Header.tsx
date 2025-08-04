import React, { memo } from "react";
import { View, Dimensions } from "react-native";
import {
  Canvas,
  FilterMode,
  Image,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Easing } from "react-native-reanimated";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import { useBalance } from "../stores/useBalanceStore";
import { useImages } from "../hooks/useImages";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { TargetId } from "../stores/useTutorialStore";

export const Header: React.FC = memo(() => {
  const { balance } = useBalance();
  const { getImage } = useImages();
  const { width } = Dimensions.get("window");

  const { ref, onLayout } = useTutorialLayout(
    "headerBalance" as TargetId,
    true,
  );
  const insets = useSafeAreaInsets();
  return (
    <View
      ref={ref}
      onLayout={onLayout}
      className="bg-[#101119] h-[76px] p-0 relative shadow-md shadow-black/40"
      style={{ width: width, marginTop: insets.top }}
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={getImage("header")}
          fit="fill"
          x={0}
          y={0}
          width={width}
          height={76}
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
        />
      </Canvas>
      <View className="absolute right-0 h-full flex items-center justify-center pr-3">
        <AnimatedRollingNumber
          value={balance}
          enableCompactNotation
          compactToFixed={2}
          textStyle={{ fontSize: 50, color: "#fff2fdff", fontFamily: "Xerxes" }}
          spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
        />
      </View>
    </View>
  );
});

export default Header;
