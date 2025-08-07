import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Pressable,
  ImageSourcePropType,
  Easing,
  Animated,
  useAnimatedValue,
  GestureResponderEvent,
} from "react-native";
import {
  Canvas,
  Image as SkiaImage,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { PopupAnimation } from "./PopupAnimation";
import { FlashBurstManager } from "./FlashBurstManager";
import { TargetId } from "../stores/useTutorialStore";
import { useImages } from "../hooks/useImages";

export type ConfirmerProps = {
  image?: string;
  text?: string;
  onConfirm: () => void;
  confirmPopup?: {
    startTime: number;
    value: string;
    color: string;
  };
  renderedBy?: string;
};

export const Confirmer: React.FC<ConfirmerProps> = (props) => {
  const { getImage } = useImages();
  const pressableRef = useRef<View>(null);
  const [triggerFlash, setTriggerFlash] = useState<
    ((x: number, y: number) => void) | null
  >(null);

  const enabled =
    props.renderedBy !== undefined &&
    ["miner", "sequencer", "da", "prover"].includes(props.renderedBy);
  let tutorialProps = {};
  let ref, onLayout;
  if (enabled) {
    const targetId = `${props.renderedBy}Confirmer` as TargetId;
    ({ ref, onLayout } = useTutorialLayout(targetId, enabled));
    tutorialProps = { ref, onLayout };
  }

  const [confirmTime, setConfirmTime] = useState(0);
  const confirmAnimation = useAnimatedValue(0);
  useEffect(() => {
    confirmAnimation.setValue(0);
    Animated.timing(confirmAnimation, {
      toValue: 100,
      duration: 250,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
    return () => {
      confirmAnimation.removeAllListeners();
    };
  }, [confirmTime]);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;

      // Trigger flash animation at click position
      if (triggerFlash) {
        triggerFlash(locationX, locationY);
      }

      setConfirmTime(Date.now());
      props.onConfirm();
    },
    [triggerFlash, props.onConfirm],
  );

  const handleFlashRequested = useCallback(
    (callback: (x: number, y: number) => void) => {
      setTriggerFlash(() => callback);
    },
    [],
  );

  return (
    <Pressable
      ref={pressableRef}
      className="w-full h-full relative"
      onPress={handlePress}
      {...tutorialProps}
    >
      {props.confirmPopup && (
        <PopupAnimation
          popupStartTime={props.confirmPopup.startTime}
          popupValue={props.confirmPopup.value}
          color={props.confirmPopup.color}
          animRange={[-100, -120]}
        />
      )}
      {props.image && (
        <Animated.View
          style={{
            width: 112,
            height: 112,
            transform: [
              {
                translateY: confirmAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                }),
              },
            ],
          }}
          className="w-28 h-28"
        >
          <Canvas style={{ width: 112, height: 112 }}>
            <SkiaImage
              x={0}
              y={0}
              width={112}
              height={112}
              image={getImage(props.image)}
              fit="fill"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
        </Animated.View>
      )}
      {props.text && (
        <Animated.Text
          className="text-[#fff7ff] text-[24px] font-Teatime w-full
                     absolute top-[50%] translate-y-[-50%] text-center
          "
          style={{
            transform: [
              {
                translateY: confirmAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                }),
              },
            ],
          }}
        >
          {props.text}
        </Animated.Text>
      )}
      <FlashBurstManager
        renderedBy={props.renderedBy}
        onFlashRequested={handleFlashRequested}
      />
    </Pressable>
  );
};
