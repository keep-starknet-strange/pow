import React, { memo, useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Window } from "./tutorial/Window";
import { useOnchainActions } from "../stores/useOnchainActions";
import {
  getRandomNounsAttributes,
  getNounsHead,
  getNounsGlasses,
  getNounsBody,
  getNounsAccessories,
} from "../configs/nouns";

const LoadingDots = memo(() => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (sharedValue: any, delay: number) => {
      sharedValue.value = withRepeat(
        withTiming(1, { duration: 600 }),
        -1,
        true,
      );
    };

    // Stagger the animations
    animateDot(dot1, 0);
    setTimeout(() => animateDot(dot2, 0), 200);
    setTimeout(() => animateDot(dot3, 0), 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
  }));

  return (
    <View className="flex-row items-center justify-center my-[4px]">
      <Text className="text-[18px] font-Pixels text-gray-100 mr-1">
        Reverting
      </Text>
      <Animated.Text
        style={dot1Style}
        className="text-[18px] font-Pixels text-gray-100"
      >
        .
      </Animated.Text>
      <Animated.Text
        style={dot2Style}
        className="text-[18px] font-Pixels text-gray-100"
      >
        .
      </Animated.Text>
      <Animated.Text
        style={dot3Style}
        className="text-[18px] font-Pixels text-gray-100"
      >
        .
      </Animated.Text>
    </View>
  );
});

const AttackerAvatar = memo(() => {
  const [attackerAttributes] = useState(() => getRandomNounsAttributes());

  return (
    <View className="w-24 h-24 relative mb-[4px]">
      <Image
        source={getNounsBody(attackerAttributes.body)}
        className="absolute inset-0 w-full h-full"
        resizeMode="contain"
      />
      <Image
        source={getNounsHead(attackerAttributes.head)}
        className="absolute inset-0 w-full h-full"
        resizeMode="contain"
      />
      <Image
        source={getNounsGlasses(attackerAttributes.glasses)}
        className="absolute inset-0 w-full h-full"
        resizeMode="contain"
      />
      <Image
        source={getNounsAccessories(attackerAttributes.accessories)}
        className="absolute inset-0 w-full h-full"
        resizeMode="contain"
      />
    </View>
  );
});

const RevertModalComponent: React.FC = () => {
  const { isReverting } = useOnchainActions();

  if (!isReverting) return null;

  return (
    <View className="absolute inset-0 z-[100]" pointerEvents="box-none">
      {/* Dark overlay */}
      <View className="absolute inset-0 bg-black/70" pointerEvents="auto" />

      {/* Modal window */}
      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="none"
      >
        <Window
          style={{
            width: 280,
          }}
        >
          <View className="items-center">
            <Text className="text-[28px] font-Teatime text-red-400 my-[4px] text-center">
              Reversion Attack!
            </Text>

            <AttackerAvatar />

            <Text className="text-[14px] font-Pixels text-gray-100 text-center my-[4px] px-2 leading-5">
              A mysterious spammer has infiltrated your blockchain! They're
              causing chaos and forcing a rollback of recent transactions.
            </Text>

            <LoadingDots />
          </View>
        </Window>
      </View>
    </View>
  );
};

export const RevertModal = memo(RevertModalComponent);
