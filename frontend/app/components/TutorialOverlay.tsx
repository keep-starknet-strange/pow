import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTutorial } from "../context/Tutorial";
import { useBubblePosition } from "../hooks/useBubblePosition";
import { useHighlightMasks, useHightlightPosition } from "../hooks/useHighlightMasks";
import { getTutorialStepConfig } from "../utils/getTutorialStepConfig";

const BUBBLE_WIDTH = 260;

export const TutorialOverlay: React.FC = () => {
  const { step, layouts, visible, setVisible } = useTutorial();
  const insets = useSafeAreaInsets();
  const [bubbleHeight, setBubbleHeight] = useState(0);

  const stepConfig = getTutorialStepConfig(step);
  const bubbleLayout = layouts?.[stepConfig.bubbleTargetId] ?? {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  const highlightLayout = layouts?.[stepConfig.highlightTargetId] ?? {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  const isReady = bubbleLayout.width > 0 && bubbleLayout.height > 0;
  const {
    left: bubbleLeft,
    top: bubbleTop,
    style: arrowStyle,
    arrowLeft,
  } = useBubblePosition(bubbleLayout, bubbleHeight, insets.top);

  const highlightPosition = useHightlightPosition(highlightLayout, insets.top);
  const masks = useHighlightMasks(highlightPosition);

  useEffect(() => {
    if (step !== "completed") setVisible(true);
  }, [step]);

  if (!visible || !isReady) return null;

  return (
    <View className="absolute inset-0 z-[50]" pointerEvents="box-none">
      {masks.map((m, i) => (
        <View
          key={i}
          style={[
            { position: "absolute" },
            m,
            { backgroundColor: "rgba(0,0,0,0.7)" },
          ]}
        />
      ))}

      <View
        pointerEvents="none"
        className="absolute border-2 border-yellow-400 rounded-2xl shadow-lg"
        style={{
          top: highlightPosition.top,
          left: highlightPosition.left,
          width: highlightPosition.width,
          height: highlightPosition.height,
        }}
      />

      <View
        className="absolute z-[50]"
        style={[{ left: arrowLeft }, arrowStyle]}
      />

      <View
        className="absolute items-center z-[50]"
        style={{ left: bubbleLeft, top: bubbleTop, width: BUBBLE_WIDTH }}
      >
        <View
          className="bg-[#272727] p-3 rounded-2xl border border-yellow-400 shadow-lg"
          onLayout={(e: LayoutChangeEvent) =>
            setBubbleHeight(Math.round(e.nativeEvent.layout.height))
          }
        >
          <Text className="text-base font-semibold text-gray-100 mb-1 text-center">
            {stepConfig.title}
          </Text>
          <Text className="text-sm text-gray-300 mb-2 text-center">
            {stepConfig.description}
          </Text>
          <TouchableOpacity
            onPress={() => setVisible(false)}
            className="self-center bg-yellow-400 px-4 py-2 rounded"
          >
            <Text className="text-sm font-semibold text-black">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
