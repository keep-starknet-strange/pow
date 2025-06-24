import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Easing,
  Animated,
  useAnimatedValue,
} from "react-native";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { PopupAnimation } from "./PopupAnimation";
import { TargetId } from "../context/Tutorial";

export type ConfirmerProps = {
  progress: number;
  image: ImageSourcePropType;
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
  }, [confirmTime]);

  return (
    <View className="w-full h-full relative">
      {props.progress > 0 && (
        <Image
          source={props.getAnimation(props.progress)}
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-full h-full"
        />
      )}
      {props.confirmPopup && (
        <PopupAnimation
          popupStartTime={props.confirmPopup.startTime}
          popupValue={props.confirmPopup.value}
          color={props.confirmPopup.color}
          animRange={[-100, -120]}
        />
      )}
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
        onPress={() => {
          props.onConfirm();
          setConfirmTime(Date.now());
        }}
        {...tutorialProps}
      >
        <Animated.Image
          source={props.image}
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
        />
      </TouchableOpacity>
    </View>
  );
};
