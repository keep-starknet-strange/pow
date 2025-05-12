import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent, Dimensions } from 'react-native';
import { useTutorial } from '../context/Tutorial';
import tutorialConfig from '../configs/tutorial.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUBBLE_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 260);

export const TutorialOverlay: React.FC = () => {
  const { step, layouts, visible, setVisible } = useTutorial();
  const [bubbleHeight, setBubbleHeight] = useState(0);

  useEffect(() => {
    if (step !== "completed") setVisible(true);
  }, [step]);
  
  if (!visible) return null;
  // if (!config.keys.includes(step) || !layouts) return null;
  if ((step !== 'mineBlock' && step !== 'transactions') || !layouts) return null;
  const config: { title: string; description: string; topOffset?: number } = tutorialConfig[step];
  if (layouts[step] === undefined) return null;
  const { x, y, width, height } = layouts[step]
  const left = x + width / 2 - BUBBLE_WIDTH / 2;
  let top = y + height / 2 - bubbleHeight / 2;
  const arrowLeft = left + BUBBLE_WIDTH / 2 - 8;
  const arrowTop = top + bubbleHeight;
  top += config.topOffset ?? 0;
  return (
    <View className="absolute inset-0">
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
      <View
        className="absolute items-center z-50"
        style={{ left, top, width: BUBBLE_WIDTH }}
      >
        <View
          className="bg-[#272727] p-3 rounded-md border border-yellow-400 shadow-lg"
          onLayout={(e: LayoutChangeEvent) => {
            const measured = Math.round(e.nativeEvent.layout.height);
            setBubbleHeight(prev => {
              if (prev === measured) return prev;
              return measured;
            });
          }}
        >
          <Text className="text-base font-semibold text-gray-100 mb-1 text-center">
            {config.title}
          </Text>
          <Text className="text-sm text-gray-300 mb-2 text-center">
            {config.description}
          </Text>
          <TouchableOpacity onPress={()=> setVisible(false)} className="self-center bg-yellow-400 px-4 py-2 rounded">
            <Text className="text-sm font-semibold">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};
