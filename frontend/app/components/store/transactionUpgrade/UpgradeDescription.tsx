import React from "react";
import { View, Text } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import AnimatedRollingNumber from "react-native-animated-rolling-numbers";
import { useImages } from "../../../hooks/useImages";
import { useUpgrades } from "../../../stores/useUpgradesStore";

type UpgradeDescriptionProps = {
  chainId: number;
  upgradeId: number;
  description: string;
  subDescription: string;
  maxSubDescription: string;
  currentLevel: number;
  values: number[];
  baseValue: number;
};

export const UpgradeDescription: React.FC<UpgradeDescriptionProps> = ({
  chainId,
  upgradeId,
  description,
  subDescription,
  maxSubDescription,
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

  // Check if we're at max level
  const isMaxLevel = currentLevel + 1 >= values.length;

  // Use the appropriate sub-description based on max level
  const activeSubDescription = isMaxLevel ? maxSubDescription : subDescription;

  // Process the sub-description with values
  const processedSubDescription = activeSubDescription
    .replace(/\${currVal}/g, `__CURR_VAL__${currVal}__`)
    .replace(/\${upgradeVal}/g, `__UPGRADE_VAL__${upgradeVal}__`);

  const lines = [description, processedSubDescription];

  const renderTextWithNumbers = (text: string, isSecondLine: boolean) => {
    const textColor = isSecondLine ? "#fff7ff" : "#717171";

    // Split by our value markers and BTC icons
    const parts = text.split(
      /(__CURR_VAL__\d+__|__UPGRADE_VAL__\d+__|\{BTC\})/g,
    );

    return parts.map((part, partIndex) => {
      // Handle BTC icon
      if (part === "{BTC}") {
        return (
          <Canvas
            key={partIndex}
            style={{
              width: 14,
              height: 14,
              marginLeft: -8,
              marginRight: 0,
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
              width={14}
              height={14}
            />
          </Canvas>
        );
      }

      // Handle current value numbers
      if (part.startsWith("__CURR_VAL__")) {
        const value = parseInt(
          part.replace("__CURR_VAL__", "").replace("__", ""),
        );
        return (
          <View key={partIndex}>
            <AnimatedRollingNumber
              value={value}
              enableCompactNotation
              compactToFixed={2}
              textStyle={{
                color: textColor,
                fontFamily: "Pixels",
                fontSize: 16,
              }}
              spinningAnimationConfig={{ duration: 400 }}
            />
          </View>
        );
      }

      // Handle upgrade value numbers
      if (part.startsWith("__UPGRADE_VAL__")) {
        const value = parseInt(
          part.replace("__UPGRADE_VAL__", "").replace("__", ""),
        );
        return (
          <View key={partIndex}>
            <AnimatedRollingNumber
              value={value}
              enableCompactNotation
              compactToFixed={2}
              textStyle={{
                color: textColor,
                fontFamily: "Pixels",
                fontSize: 16,
              }}
              spinningAnimationConfig={{ duration: 400 }}
            />
          </View>
        );
      }

      // Handle regular text
      return (
        <Text
          key={partIndex}
          style={{ color: textColor }}
          className="text-lg font-Pixels leading-none"
        >
          {part}
        </Text>
      );
    });
  };

  return (
    <View className="flex-col">
      {lines.map((line, lineIndex) => {
        const isSecondLine = lineIndex === 1;

        return (
          <View
            key={lineIndex}
            className="flex-row flex-wrap items-center"
          >
            {renderTextWithNumbers(line, isSecondLine)}
          </View>
        );
      })}
    </View>
  );
};
