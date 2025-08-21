import React, { memo, useState, useRef } from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useInterval } from "usehooks-ts";
import { MainBackground } from "../components/MainBackground";
import { Logo } from "../components/Logo";
import loadingConfig from "../configs/loading.json";

interface TipTextDisplayProps {
  tipText: string;
}

const TipTextDisplay: React.FC<TipTextDisplayProps> = memo(({ tipText }) => {
  return (
    <Animated.View
      className="px-4 mt-[40px] h-[60px] justify-center"
      exiting={FadeOutDown}
      entering={FadeInDown}
    >
      <Text
        className="text-black font-Teatime text-center"
        style={{ fontSize: 20 }}
      >
        {tipText}
      </Text>
    </Animated.View>
  );
});

export const LoadingScreen: React.FC = memo(() => {
  const allTextsRef = useRef([
    ...loadingConfig.tips,
    ...loadingConfig.lore,
    ...loadingConfig.facts,
  ]);
  
  // Initialize with a random text
  const [tipText, setTipText] = useState(() => {
    return allTextsRef.current[
      Math.floor(Math.random() * allTextsRef.current.length)
    ];
  });

  // Cycle through tips every 5 seconds
  useInterval(() => {
    const randomText =
      allTextsRef.current[
        Math.floor(Math.random() * allTextsRef.current.length)
      ];
    setTipText(randomText);
  }, 5000);

  // Animated loading dots
  const [dots, setDots] = useState(".");

  useInterval(() => {
    setDots((prev) => {
      if (prev === ".") return "..";
      if (prev === "..") return "...";
      return ".";
    });
  }, 500);

  return (
    <View className="flex-1 items-center">
      <MainBackground />
      <View className="relative flex-col items-center justify-center flex-1">
        <Logo doEnterAnim={false} />
        <TipTextDisplay key={tipText} tipText={tipText} />
      </View>
      <View className="absolute bottom-[60px] right-[20px] flex-row">
        <Text className="text-black font-Pixels" style={{ fontSize: 18 }}>
          Loading
        </Text>
        <Text
          className="text-black font-Pixels"
          style={{ fontSize: 18, width: 30 }}
        >
          {dots}
        </Text>
      </View>
    </View>
  );
});
