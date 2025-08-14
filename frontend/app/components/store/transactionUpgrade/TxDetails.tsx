import { View, Text, Dimensions } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import React from "react";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useImages } from "../../../hooks/useImages";
import { UpgradeDescription } from "./UpgradeDescription";

type TxDetailsProps = {
  name: string;
  description: string;
  chainId?: number;
  upgradeId?: number;
  currentLevel?: number;
  values?: number[];
  baseValue?: number;
  speeds?: number[];
  baseSpeed?: number;
  subDescription?: string;
  maxSubDescription?: string;
};

export const TxDetails: React.FC<TxDetailsProps> = ({
  name,
  description,
  chainId,
  upgradeId,
  currentLevel,
  values,
  baseValue,
  speeds,
  baseSpeed,
  subDescription,
  maxSubDescription,
}) => {
  const { getImage } = useImages();

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
        <Animated.Text
          className="absolute top-0 left-[8px] text-[#fff7ff] text-xl font-bold font-Pixels"
          entering={FadeInRight}
        >
          {name}
        </Animated.Text>
      </View>
      <Animated.View entering={FadeInRight} className="mt-[2px]">
        {chainId !== undefined &&
        upgradeId !== undefined &&
        currentLevel !== undefined &&
        ((values && baseValue !== undefined) ||
          (speeds && baseSpeed !== undefined)) &&
        subDescription &&
        maxSubDescription ? (
          <UpgradeDescription
            chainId={chainId}
            upgradeId={upgradeId}
            description={description}
            subDescription={subDescription}
            maxSubDescription={maxSubDescription}
            currentLevel={currentLevel}
            values={values}
            baseValue={baseValue}
            speeds={speeds}
            baseSpeed={baseSpeed}
          />
        ) : (
          <Text className="text-[#717171] text-lg font-Pixels leading-none">
            {description}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};
