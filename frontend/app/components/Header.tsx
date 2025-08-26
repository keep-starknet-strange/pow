import React, { memo } from "react";
import { View, TouchableOpacity, Text } from "react-native";
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
import { TutorialRefView } from "../components/tutorial/TutorialRefView";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
import { usePowContractConnector } from "../context/PowContractConnector";

export const Header: React.FC = memo(() => {
  const { balance } = useBalance();
  const { getImage } = useImages();
  const { width } = useCachedWindowDimensions();
  const { doubleBalanceCheat } = usePowContractConnector();

  const insets = useSafeAreaInsets();

  // Check if cheat codes are enabled via environment variable
  const cheatCodesEnabled =
    process.env.EXPO_PUBLIC_ENABLE_CHEAT_CODES === "true";

  const handleCheatCode = () => {
    try {
      doubleBalanceCheat();
    } catch (error) {
      if (__DEV__) console.error("Failed to execute cheat code:", error);
    }
  };
  return (
    <View
      className="bg-[#101119] h-[76px] p-0 relative"
      style={{ width: width, marginTop: insets.top }}
    >
      <View className="absolute top-0 left-[4px] right-[4px] h-full">
        <TutorialRefView targetId="headerBalance" enabled={true} />
      </View>
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

      {/* Hidden cheat code button - only visible when cheat codes are enabled */}
      {cheatCodesEnabled && (
        <TouchableOpacity
          onPress={handleCheatCode}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 70,
            height: 70,
            zIndex: 1000,
          }}
        ></TouchableOpacity>
      )}
    </View>
  );
});

export default Header;
