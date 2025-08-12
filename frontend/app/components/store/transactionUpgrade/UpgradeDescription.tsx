import React from "react";
import { View, Text } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../../hooks/useImages";
import { useUpgrades } from "../../../stores/useUpgradesStore";

type UpgradeDescriptionProps = {
  chainId: number;
  upgradeId: number;
  description: string;
  currentLevel: number;
  values: number[];
  baseValue: number;
};

export const UpgradeDescription: React.FC<UpgradeDescriptionProps> = ({
  chainId,
  upgradeId,
  description,
  currentLevel,
  values,
  baseValue,
}) => {
  const { getImage } = useImages();

  const currVal = currentLevel === -1 ? baseValue : values[currentLevel];
  const upgradeVal =
    currentLevel + 1 < values.length
      ? values[currentLevel + 1]
      : values[currentLevel];

  const processedDescription = description
    .replace(/\${currVal}/g, currVal.toLocaleString())
    .replace(/\${upgradeVal}/g, upgradeVal.toLocaleString())
    .replace(/\\n/g, "\n"); // Convert escaped newlines to actual newlines

  // Split by newlines first, then handle BTC icons within each line
  const lines = processedDescription.split("\n");

  return (
    <View className="flex-col">
      {lines.map((line, lineIndex) => {
        const parts = line.split(/(\${BTC})/g);

        return (
          <View key={lineIndex} className="flex-row flex-wrap items-center">
            {parts.map((part, partIndex) => {
              if (part === "${BTC}") {
                return (
                  <Canvas
                    key={partIndex}
                    style={{
                      width: 14,
                      height: 14,
                      marginLeft: 1,
                      marginRight: 1,
                    }}
                  >
                    <Image
                      image={getImage("shop.btc")}
                      fit="contain"
                      sampling={{
                        filter: FilterMode.Nearest,
                        mipmap: MipmapMode.Nearest,
                      }}
                      x={0}
                      y={0}
                      width={12}
                      height={12}
                    />
                  </Canvas>
                );
              }
              return (
                <Text
                  key={partIndex}
                  className="text-[#717171] text-lg font-Pixels leading-none"
                >
                  {part}
                </Text>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};
