import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  ImageSourcePropType,
  Easing,
  Animated,
  useAnimatedValue,
} from "react-native";
import {
  Canvas,
  Image as SkiaImage,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { PopupAnimation } from "./PopupAnimation";
import { TargetId } from "../stores/useTutorialStore";
import { useImages } from "../hooks/useImages";

export type ConfirmerProps = {
  progress: number;
  image?: string;
  text?: string;
  getAnimation: (progress: number) => ImageSourcePropType;
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
    }
  }, [confirmTime]);

  return (
    <View className="w-full h-full relative">
      {props.confirmPopup && (
        <PopupAnimation
          popupStartTime={props.confirmPopup.startTime}
          popupValue={props.confirmPopup.value}
          color={props.confirmPopup.color}
          animRange={[-100, -120]}
        />
      )}
      <Pressable
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
        onPress={() => {
          props.onConfirm();
          setConfirmTime(Date.now());
        }}
        {...tutorialProps}
      >
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
            className="text-[#fff7ff] text-[24px] font-Teatime mt-[20px]"
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
      </Pressable>
    </View>
  );
};
