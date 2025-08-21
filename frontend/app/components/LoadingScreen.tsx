import React, { useEffect, useState, useRef } from "react";
import { View, Text } from "react-native";
import { MainBackground } from "./MainBackground";
import { Logo } from "./Logo";
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
      const randomText = allTextsRef.current[Math.floor(Math.random() * allTextsRef.current.length)];
      setTipText(randomText);
    };
    
    // Set initial text
    getRandomText();
    
    // Cycle every 5 seconds
    const interval = setInterval(getRandomText, 5000);
    return () => clearInterval(interval);
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
        <>
          <Logo />
        </>
        <View className="px-4">
          <Text className="text-black font-Teatime text-center" style={{ fontSize: 20 }}>
            {tipText}
          </Text>
        </View>
      </View>
      <View className="absolute bottom-[60px] right-[20px] flex-row">
        <Text className="text-black font-Pixels" style={{ fontSize: 18 }}>
          Loading
        </Text>
        <Text className="text-black font-Pixels" style={{ fontSize: 18, width: 30 }}>
          {dots}
        </Text>
      </View>
    </View>
  );
};
