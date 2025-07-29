import React, { useEffect, useState } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import { useTutorial } from "../stores/useTutorialStore";
import { useBubblePosition } from "../hooks/useBubblePosition";
import {
  useHighlightMasks,
  useHightlightPosition,
} from "../hooks/useHighlightMasks";
import { getTutorialStepConfig } from "../utils/getTutorialStepConfig";
import { Arrow } from "../components/tutorial/Arrow";
import { Window } from "../components/tutorial/Window";

const BUBBLE_WIDTH = 260;

export const TutorialOverlay: React.FC = () => {
  const { step, layouts, visible, setVisible } = useTutorial();
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
  const position = useBubblePosition(bubbleLayout, bubbleHeight);

  const highlightPosition = useHightlightPosition(highlightLayout);
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
        className="absolute border-4 border-[#7d7d80] shadow-lg"
        style={{
          top: highlightPosition.top,
          left: highlightPosition.left,
          width: highlightPosition.width,
          height: highlightPosition.height,
        }}
      />

      <Arrow
        direction={position.direction}
        style={[
          { position: "absolute", left: position.arrowLeft },
          position.arrowStyle,
        ]}
      />

      <Window
        style={{
          position: "absolute",
          left: position.bubbleLeft,
          top: position.bubbleTop,
          width: BUBBLE_WIDTH,
        }}
        onMeasured={setBubbleHeight}
      >
        <Text className="text-[30px] font-Teatime text-gray-100 mb-1 text-center">
          {stepConfig.title}
        </Text>
        <Text className="text-[14px] font-Pixels text-gray-100 text-center">
          {stepConfig.description}
        </Text>
        {stepConfig.canDismiss && (
          <Pressable
            onPress={() => setVisible(false)}
            className="self-center px-4 py-2 rounded"
          >
            <Text className="text-[16px] font-Pixels text-gray-100 underline">
              Got it
            </Text>
          </Pressable>
        )}
      </Window>
    </View>
  );
};
