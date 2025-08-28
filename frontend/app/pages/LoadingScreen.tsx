import React, { memo, useState, useRef, useEffect } from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useInterval } from "usehooks-ts";
import { MainBackground } from "../components/MainBackground";
import { Logo } from "../components/Logo";
import loadingConfig from "../configs/loading.json";
import { useGameStore } from "../stores/useGameStore";
import { useBalanceStore } from "../stores/useBalanceStore";
import { useL2Store } from "../stores/useL2Store";
import { useAchievementsStore } from "../stores/useAchievementsStore";
import { useTransactionsStore } from "../stores/useTransactionsStore";
import { useTutorialStore } from "../stores/useTutorialStore";
import { useUpgradesStore } from "../stores/useUpgradesStore";
import { useSoundStore } from "../stores/useSoundStore";
import { useStarknetConnector } from "../context/StarknetConnector";
import { useFocEngine } from "../context/FocEngineConnector";
import Constants from "expo-constants";

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

export const LoadingScreenView: React.FC = memo(() => {
  const version = Constants.expoConfig?.version || "0.0.1";
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
    <View className="flex-1 items-center w-full h-full">
      <MainBackground />
      <View className="relative flex-col items-center justify-center flex-1">
        <Logo doEnterAnim={false} doWaveAnim={true} />
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
      <View className="absolute bottom-0 w-full px-8 py-4 pb-6 bg-[#10111A]">
        <Animated.View
          entering={FadeInDown}
          className="flex flex-row items-center justify-between w-full"
        >
          <Text className="text-[#fff7ff] font-Pixels text-[16px]">
            version {version}
          </Text>
          <Text className="text-[#fff7ff] font-Pixels text-[16px]">
            We're open source!
          </Text>
        </Animated.View>
      </View>
    </View>
  );
});

export const LoadingScreen: React.FC = memo(() => {
  // Check if account is connected
  const { account } = useStarknetConnector();
  const { isUserInitializing } = useFocEngine();

  // Check if all stores are initialized
  const gameInitialized = useGameStore((state) => state.isInitialized);
  const balanceInitialized = useBalanceStore((state) => state.isInitialized);
  const l2Initialized = useL2Store((state) => state.isInitialized);
  const achievementsInitialized = useAchievementsStore(
    (state) => state.isInitialized,
  );
  const transactionsInitialized = useTransactionsStore(
    (state) => state.isInitialized,
  );
  const tutorialInitialized = useTutorialStore((state) => state.isInitialized);
  const upgradesInitialized = useUpgradesStore((state) => state.isInitialized);
  const soundInitialized = useSoundStore((state) => state.isInitialized);

  const allStoresInitialized =
    gameInitialized &&
    balanceInitialized &&
    l2Initialized &&
    achievementsInitialized &&
    transactionsInitialized &&
    tutorialInitialized &&
    upgradesInitialized &&
    soundInitialized;

  // State to track if we should hide the loading screen after delay
  const [shouldHide, setShouldHide] = useState(false);

  // Effect to handle 2-second delay after stores are initialized
  useEffect(() => {
    if (allStoresInitialized) {
      const timer = setTimeout(() => {
        setShouldHide(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShouldHide(false);
    }
  }, [allStoresInitialized]);

  // Only render if account is connected/initializing AND (stores not initialized OR still within delay period)
  if (!(account || isUserInitializing) || shouldHide) {
    return null;
  }

  return (
    <View className="flex-1 w-full h-full absolute z-[1000]">
      <LoadingScreenView />
    </View>
  );
});
