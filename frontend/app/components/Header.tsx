import React from "react";
import { Text, View, Dimensions } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImageProvider } from "../context/ImageProvider";
import { useBalance } from "../context/Balance";
import { useGame } from "../context/Game";
import { shortMoneyString } from "../utils/helpers";

export const Header: React.FC = () => {
  const { balance } = useBalance();
  const { getImage } = useImageProvider();
  const { l2 } = useGame();
  const headerBg = l2 ? "balance.l2" : "balance.l1";
  const { width } = Dimensions.get("window");

  return (
    <View
      className="bg-[#101119] h-[76px] p-0 relative"
      style={{ width: width }}
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={getImage(headerBg)}
          fit="fill"
          x={0}
          y={0}
          width={width}
          height={76}
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
        />
      </Canvas>
      <View className="absolute right-0 h-full flex items-center justify-center pr-3">
        <Text className="text-[#fff2fdff] text-5xl font-bold font-Xerxes">
          {shortMoneyString(balance)}
        </Text>
      </View>
    </View>
  );
};

export default Header;
