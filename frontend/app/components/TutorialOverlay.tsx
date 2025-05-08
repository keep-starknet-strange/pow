import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent, Dimensions } from 'react-native';
import { useTutorial } from '../context/Tutorial';
import tutorialConfig from '../configs/tutorial.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUBBLE_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 260);

export const TutorialOverlay: React.FC = () => {
  const { step, advanceStep, targetLayout } = useTutorial();
  const [bubbleHeight, setBubbleHeight] = useState(0);

  // if (!config.keys.includes(step) || !targetLayout) return null;
  if ((step !== 'mine-block' && step !== 'transactions') || !targetLayout) return null;
  const config = tutorialConfig[step];
  const { x, y, width, height } = targetLayout;
  const left = x + width / 2 - BUBBLE_WIDTH / 2;
  const top = y + height / 2 - bubbleHeight / 2;
  const arrowLeft = left + BUBBLE_WIDTH / 2 - 8;
  const arrowTop = top + bubbleHeight;
  return (
    <View className="absolute inset-0">
      <View
        className="absolute items-center z-50"
        style={{ left, top, width: BUBBLE_WIDTH }}
      >
        <View
          className="bg-[#272727] p-3 rounded-md border border-yellow-400 shadow-lg"
          onLayout={(e: LayoutChangeEvent) => setBubbleHeight(e.nativeEvent.layout.height)}
        >
          <Text className="text-base font-semibold text-gray-100 mb-1 text-center">
            {config.title}
          </Text>
          <Text className="text-sm text-gray-300 mb-2 text-center">
            {config.description}
          </Text>
          <TouchableOpacity onPress={advanceStep} className="self-center bg-yellow-400 px-4 py-2 rounded">
            <Text className="text-sm font-semibold">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        className="absolute z-50"
        style={{
          left: arrowLeft,
          top: arrowTop,
          width: 0,
          height: 0,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderBottomWidth: 10,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: '#FBBF24', // Tailwind yellow-400
        }}
      />
    </View>
  );
};
