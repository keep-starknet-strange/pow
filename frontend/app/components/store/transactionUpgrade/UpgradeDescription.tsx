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

type UpgradeDescriptionProps = {
  chainId: number;
  upgradeId: number;
  description: string;
  subDescription: string;
  maxSubDescription: string;
  currentLevel: number;
  values?: number[];
  baseValue?: number;
  speeds?: number[];
  baseSpeed?: number;
};

export const UpgradeDescription: React.FC<UpgradeDescriptionProps> = ({
  description,
  subDescription,
  maxSubDescription,
  currentLevel,
  values,
  baseValue,
  speeds,
  baseSpeed,
}) => {
  const { getImage } = useImages();

  // Handle both upgrade values and automation speeds
  const isAutomation = speeds !== undefined;
  const dataArray = isAutomation ? speeds : values;
  const baseData = isAutomation ? baseSpeed : baseValue;

  // For automations, convert speed to actual rate per second (speed / 5)
  // Since the formula is 5000ms / speed, the actual rate is speed / 5 per second
  const rawCurrVal = currentLevel === -1 ? baseData : dataArray?.[currentLevel];
  const rawUpgradeVal =
    currentLevel + 1 < (dataArray?.length || 0)
      ? dataArray?.[currentLevel + 1]
      : dataArray?.[currentLevel];

  const currVal = isAutomation ? (rawCurrVal || 0) / 5 : rawCurrVal;
  const upgradeVal = isAutomation ? (rawUpgradeVal || 0) / 5 : rawUpgradeVal;

  // Check if we're at max level
  const isMaxLevel = currentLevel + 1 >= (dataArray?.length || 0);

  // Use the appropriate sub-description based on max level
  const activeSubDescription = isMaxLevel ? maxSubDescription : subDescription;

  // Process the sub-description with values/speeds
  let processedSubDescription = activeSubDescription;

  if (isAutomation) {
    // For automations, replace speed placeholders
    processedSubDescription = processedSubDescription
      .replace(/\${currSpeed}/g, `__CURR_VAL__${currVal || 0}__`)
      .replace(/\${upgradeSpeed}/g, `__UPGRADE_VAL__${upgradeVal || 0}__`);
  } else {
    // For upgrades, replace value placeholders
    processedSubDescription = processedSubDescription
      .replace(/\${currVal}/g, `__CURR_VAL__${currVal || 0}__`)
      .replace(/\${upgradeVal}/g, `__UPGRADE_VAL__${upgradeVal || 0}__`);
  }

  const lines = [description, processedSubDescription];

  const renderTextWithNumbers = (text: string, isSecondLine: boolean) => {
    const textColor = isSecondLine ? "#fff7ff" : "#717171";

    // Split by our value markers and BTC icons
    // Updated regex to handle decimal numbers (e.g., 0.2, 1.5)
    const parts = text
      .split(/(__CURR_VAL__[\d.]+__|__UPGRADE_VAL__[\d.]+__|\{BTC\})/g)
      .filter((part) => part.length > 0);

    return parts.map((part, partIndex) => {
      // Handle BTC icon
      if (part === "{BTC}") {
        return (
          <Canvas
            key={partIndex}
            style={{
              width: 14,
              height: 14,
              marginLeft: 0,
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
        const value = parseFloat(
          part.replace("__CURR_VAL__", "").replace("__", ""),
        );
        return (
          <View key={partIndex}>
            <AnimatedRollingNumber
              value={value}
              enableCompactNotation
              compactToFixed={1}
              fixedOnlyForCompact={value % 1 !== 0 && value < 10 ? false : undefined}
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
        const value = parseFloat(
          part.replace("__UPGRADE_VAL__", "").replace("__", ""),
        );
        return (
          <View key={partIndex}>
            <AnimatedRollingNumber
              value={value}
              enableCompactNotation
              compactToFixed={1}
              fixedOnlyForCompact={value % 1 !== 0 && value < 10 ? false : undefined}
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
          className="text-[16px] font-Pixels leading-none"
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
          <View key={lineIndex} className="flex-row flex-wrap">
            {renderTextWithNumbers(line, isSecondLine)}
          </View>
        );
      })}
    </View>
  );
};
