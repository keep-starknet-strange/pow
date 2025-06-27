import { Dimensions, TouchableOpacity, Text } from "react-native";
import { shortMoneyString } from "../../../utils/helpers";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImageProvider } from "../../../context/ImageProvider";

type UpgradeButtonProps = {
  icon?: any;
  label: string;
  level: number;
  maxLevel: number;
  nextCost: number;
  onPress: () => void;
};

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  icon,
  label,
  level,
  maxLevel,
  nextCost,
  onPress,
}) => {
  const { getImage } = useImageProvider();
  const { width } = Dimensions.get("window");

  return (
    <TouchableOpacity
      onPress={onPress}
      className="relative w-full"
      style={{
        width: width - 32,
        height: 36,
      }}
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={getImage("shop.tx.buy")}
          fit="fill"
          x={0}
          y={0}
          width={width - 32}
          height={36}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.None,
          }}
        />
      </Canvas>
      <Text className="absolute left-[8px] top-[6px] font-Pixels text-xl text-[#fff7ff]">{label}</Text>
      {level === maxLevel ? (
        <Text className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#e7e7e7]">Max</Text>
      ) : (
        <Text className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#e7e7e7]">Cost: {shortMoneyString(nextCost)}</Text>
      )}
    </TouchableOpacity>
  );
};
