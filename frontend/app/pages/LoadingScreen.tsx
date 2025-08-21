import React, { useEffect, useState, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { MainBackground } from "../components/MainBackground";
import { Logo } from "../components/Logo";
import loadingConfig from "../configs/loading.json";

export const LoadingScreen: React.FC = () => {
  const [tipText, setTipText] = useState("");
  const allTextsRef = useRef([
    ...loadingConfig.tips,
    ...loadingConfig.lore,
    ...loadingConfig.facts,
  ]);

  useEffect(() => {
    const getRandomText = () => {
      const randomText =
        allTextsRef.current[
          Math.floor(Math.random() * allTextsRef.current.length)
        ];
      return randomText;
    };

    // Set initial text without animation
    const initialText =
      allTextsRef.current[
        Math.floor(Math.random() * allTextsRef.current.length)
      ];
    setTipText(initialText);

    // Start cycling after initial delay
    const timeout = setTimeout(() => {
      getRandomText();
      // Then cycle every 5 seconds
      const interval = setInterval(getRandomText, 5000);

      // Store interval ID for cleanup
      const intervalIdRef = { current: interval };

      // Cleanup function
      return () => clearInterval(intervalIdRef.current);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  // Animated loading dots
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 items-center">
      <MainBackground />
      <View className="relative flex-col items-center justify-center flex-1">
        <Logo />
        <View className="px-4 mt-[40px] h-[60px] justify-center">
          <Text
            className="text-black font-Teatime text-center"
            style={{ fontSize: 20 }}
          >
            {tipText}
          </Text>
        </View>
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
};
