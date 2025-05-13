import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent, Dimensions, ViewStyle, StyleProp } from 'react-native';
import { useTutorial } from '../context/Tutorial';
import tutorialConfig from '../configs/tutorial.json';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_MAX_WIDTH = 260;
const HORIZONTAL_MARGIN = 8;
const ARROW_SIZE = 8;
const ARROW_SPACING = 4;
const BUBBLE_WIDTH = Math.min(SCREEN_WIDTH * 0.8, BUBBLE_MAX_WIDTH);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface Position {
  left: number;
  top: number;
  style: StyleProp<ViewStyle>;
  arrowLeft: number;
}

function useBubblePosition(
  target: { x: number; y: number; width: number; height: number },
  bubbleHeight: number,
  offset: number,
  insetTop: number,
  headerHeight: number
): Position {
  const { x, y, width, height } = target;
  const pageYOffset = y - headerHeight;

  // Preferred below target
  let top = y + height + ARROW_SIZE + ARROW_SPACING - pageYOffset - offset;
  const roomBelow = SCREEN_HEIGHT - (y + height) - insetTop;
  const below = roomBelow >= bubbleHeight + ARROW_SIZE + ARROW_SPACING;

  if (!below) {
    top = y - bubbleHeight - ARROW_SIZE - ARROW_SPACING - headerHeight;
  }

  // Clamp within screen
  top = clamp(top, insetTop + HORIZONTAL_MARGIN, SCREEN_HEIGHT - bubbleHeight - HORIZONTAL_MARGIN);
  const left = clamp(x + width / 2 - BUBBLE_WIDTH / 2, HORIZONTAL_MARGIN, SCREEN_WIDTH - BUBBLE_WIDTH - HORIZONTAL_MARGIN);

  // Arrow style
  const arrowStyle: ViewStyle = below
    ? {
        position: 'absolute',
        top: top - ARROW_SIZE,
        borderLeftWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderBottomWidth: ARROW_SIZE,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FBBF24',
      }
    : {
        position: 'absolute',
        top: top + bubbleHeight,
        borderLeftWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderTopWidth: ARROW_SIZE,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FBBF24',
      };

  const arrowLeft = clamp(x + width / 2 - ARROW_SIZE, HORIZONTAL_MARGIN, SCREEN_WIDTH - ARROW_SIZE - HORIZONTAL_MARGIN);
  return useMemo(() => ({ left, top, style: arrowStyle, arrowLeft }), [left, top, arrowStyle, arrowLeft]);
}

export const TutorialOverlay: React.FC = () => {
  const { step, layouts, visible, setVisible } = useTutorial();
  const [bubbleHeight, setBubbleHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const headerH = useHeaderHeight();

  const config = (Object.prototype.hasOwnProperty.call(tutorialConfig, step) ? tutorialConfig[step] : { title: '', description: '', topOffset: 0 }) as {
    title: string;
    description: string;
    topOffset: number;
  };
  const target = layouts?.[step] ?? { x: 0, y: 0, width: 0, height: 0 };

  // Compute positions unconditionally
  const { left: bubbleLeft, top: bubbleTop, style: arrowStyle, arrowLeft } = useBubblePosition(
    target,
    bubbleHeight,
    config.topOffset || 0,
    insets.top + headerH,
    headerH
  );

  const masks = useMemo(() => {
    const { x, y, width, height } = target;
    const topOffset = y - headerH;
    return [
      { top: 0, left: 0, right: 0, height: topOffset },
      { top: topOffset + height, left: 0, right: 0, bottom: 0 },
      { top: topOffset, left: 0, width: x, height },
      { top: topOffset, left: x + width, right: 0, height },
    ];
  }, [target, headerH]);

  // Show overlay on step change
  useEffect(() => {
    if (step !== 'completed') {
      setVisible(true);
    }
  }, [step, setVisible]);

  // Guard render
  if (!visible || !layouts || !['mineBlock', 'transactions'].includes(step)) return null;
  if (!layouts[step]) return null;

  return (
    <View className="absolute inset-0 z-10" pointerEvents="box-none">
      {/* Masks */}
      {masks.map((m, i) => (
        <View key={i} style={[{ position: 'absolute' }, m, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
      ))}

      {/* Highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: target.y - headerH - 4,
          left: target.x - 4,
          width: target.width + 8,
          height: target.height + 8,
        }}
        className="border-2 border-yellow-400 rounded-2xl shadow-lg"
      />

      {/* Arrow */}
      <View className="absolute z-50" style={[{ left: arrowLeft }, arrowStyle]} />

      {/* Bubble */}
      <View className="absolute items-center z-50" style={{ left: bubbleLeft, top: bubbleTop, width: BUBBLE_WIDTH }}>
        <View
          className="bg-[#272727] p-3 rounded-2xl border border-yellow-400 shadow-lg"
          onLayout={(e: LayoutChangeEvent) => {
            const h = Math.round(e.nativeEvent.layout.height);
            if (h !== bubbleHeight) setBubbleHeight(h);
          }}
        >
          <Text className="text-base font-semibold text-gray-100 mb-1 text-center">{config.title}</Text>
          <Text className="text-sm text-gray-300 mb-2 text-center">{config.description}</Text>
          <TouchableOpacity onPress={() => setVisible(false)} className="self-center bg-yellow-400 px-4 py-2 rounded">
            <Text className="text-sm font-semibold text-black">Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};