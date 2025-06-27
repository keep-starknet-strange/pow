import {
  Canvas,
  FilterMode,
  Image,
  MipmapMode,
} from "@shopify/react-native-skia";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBalance } from "../context/Balance";
import { useImageProvider } from "../context/ImageProvider";
import { shortMoneyString } from "../utils/helpers";

export const Header: React.FC = () => {
  const { balance } = useBalance();
  const { getImage } = useImageProvider();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ marginTop: insets.top }}
      className="bg-[#101119] h-[76px] p-0 relative"
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={getImage("balance")}
          fit="fill"
          x={0}
          y={0}
          width={402}
          height={76}
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
        />
      </Canvas>
      <View className="absolute right-0 h-full flex items-center justify-center pr-3">
        <Text className="text-[#fff2fdff] text-5xl font-Xerxes">
          {shortMoneyString(balance)}
        </Text>
      </View>
      <View className="absolute bottom-[-4px] left-0 right-0 h-[8px] bg-[#10c01950]" />
    </View>
  );
};

export default Header;
