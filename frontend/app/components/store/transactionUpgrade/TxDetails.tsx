import { View, Text, Dimensions } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImageProvider } from "../../../context/ImageProvider";

type TxDetailsProps = {
  name: string;
  description: string;
};

export const TxDetails: React.FC<TxDetailsProps> = ({ name, description }) => {
  const { getImage } = useImageProvider();

  return (
    <View className="flex flex-col justify-start items-start px-2 gap-1 flex-1">
      <View className="relative w-full h-[24px]">
        <Canvas style={{ flex: 1 }} className="w-full">
          <Image
            image={getImage("shop.name.plaque")}
            fit="fill"
            x={0}
            y={0}
            width={290}
            height={24}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.None,
            }}
          />
        </Canvas>
        <Text className="absolute top-0 left-[8px] text-[#fff7ff] text-xl font-bold font-Pixels">
          {name}
        </Text>
      </View>
      <Text className="text-[#717171] text-lg font-Pixels leading-none mt-[2px]">
        {description}
      </Text>
    </View>
  );
};
