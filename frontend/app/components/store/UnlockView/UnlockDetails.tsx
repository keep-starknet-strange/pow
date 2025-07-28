import React from "react";
import { View, Text } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "@/app/hooks/useImages";

type UnlockDetailsProps = {
  label: string;
  description: string;
  cost: number;
  textStyle?: object;
};

export const UnlockDetails: React.FC<UnlockDetailsProps> = ({
  label,
  description,
  cost,
  textStyle,
}) => {
  const { getImage } = useImages();

  return (
    <View className="flex flex-col items-start justify-start pl-[12px]">
      <Text
        className="text-[32px] font-Teatime text-[#fff7ff]"
        style={textStyle}
      >
        {label}
      </Text>
      <Text
        className="text-[20px] font-Teatime text-[#fff7ff]"
        style={textStyle}
      >
        {description}
      </Text>
      <View className="flex flex-row items-center justify-start">
        <Text
          className="text-[20px] font-Teatime text-[#fff7ff]"
          style={textStyle}
        >
          {`Cost: ${cost}`}
        </Text>
        <Canvas
          style={{ width: 16, height: 16}}
          className="mr-1"
        >
          <Image
            image={getImage("shop.btc")}
            fit="contain"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={1}
            width={13}
            height={13}
          />
        </Canvas>
      </View>
    </View>
  );
};
