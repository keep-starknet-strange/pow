import React, { useState, useEffect, memo } from "react";
import { View, Text, Pressable } from "react-native";
import {
  Canvas,
  FilterMode,
  MipmapMode,
  Image,
} from "@shopify/react-native-skia";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";
import { getRandomNounsAttributes, NounsAttributes } from "../../configs/nouns";
import { useImages } from "../../hooks/useImages";
import { useEventManager } from "../../stores/useEventManager";
import { PFPView } from "../../components/PFPView";

export interface AvatarCreatorProps {
  containerSize: { width: number; height: number };
  avatar: NounsAttributes;
  setAvatar: (avatar: NounsAttributes) => void;
  newAvatar: NounsAttributes;
  setNewAvatar: (avatar: NounsAttributes) => void;
  startCreatingAvatar: () => void;
  creatingAvatar: boolean;
}

const AVATAR_SIZE_RATIO = 0.65;
const BUTTONS_SIZE_RATIO = 0.18;

export const AvatarCreator: React.FC<AvatarCreatorProps> = memo(
  ({
    containerSize,
    avatar,
    setAvatar,
    newAvatar,
    setNewAvatar,
    startCreatingAvatar,
    creatingAvatar,
  }) => {
    const { getImage } = useImages();
    const { notify } = useEventManager();
    const [size, setSize] = useState<number>(0);
    const [buttonSize, setButtonSize] = useState<number>(0);

    useEffect(() => {
      const containerMinSize = Math.min(
        containerSize.width,
        containerSize.height,
      );
      setSize(containerMinSize * AVATAR_SIZE_RATIO);
    }, [containerSize.width, containerSize.height]);

    useEffect(() => {
      setButtonSize(size * BUTTONS_SIZE_RATIO);
    }, [size]);

    return (
      <Animated.View
        entering={FadeInUp}
        layout={LinearTransition}
        style={{
          alignItems: "center",
        }}
      >
        <View className="relative">
          <Pressable
            style={{
              width: size,
              height: size,
            }}
            className="items-center justify-center bg-[#10111910] p-4 rounded-xl shadow-lg shadow-black/50 relative"
            onPress={startCreatingAvatar}
          >
            <View style={{ flex: 1, position: "absolute", top: 0, left: 0 }}>
              <Canvas style={{ width: size, height: size }}>
                <Image
                  image={getImage("block.grid.min")}
                  fit="fill"
                  x={0}
                  y={0}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  width={size}
                  height={size}
                />
              </Canvas>
            </View>

            <PFPView attributes={creatingAvatar ? newAvatar : avatar} />
          </Pressable>

          <Pressable
            style={{
              width: buttonSize,
              height: buttonSize,
              top: 0,
              right: -buttonSize,
              marginRight: -10,
              position: "absolute",
            }}
            onPress={startCreatingAvatar}
          >
            <Canvas style={{ width: buttonSize, height: buttonSize }}>
              <Image
                image={getImage("icon.edit")}
                fit="contain"
                x={0}
                y={0}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                width={buttonSize}
                height={buttonSize}
              />
            </Canvas>
          </Pressable>

          <Pressable
            style={{
              width: buttonSize,
              height: buttonSize,
              top: buttonSize,
              right: -buttonSize,
              marginRight: -10,
              marginTop: 10,
              position: "absolute",
            }}
            onPress={() => {
              const newAvatar = getRandomNounsAttributes();
              setAvatar(newAvatar);
              setNewAvatar(newAvatar);
              notify("DiceRoll");
            }}
          >
            <Canvas style={{ width: buttonSize, height: buttonSize }}>
              <Image
                image={getImage("icon.random")}
                fit="contain"
                x={0}
                y={0}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                width={buttonSize}
                height={buttonSize}
              />
            </Canvas>
          </Pressable>
        </View>
        <View className="flex flex-row items-center justify-center mt-1 gap-2">
          <Text className="text-[#101119] text-[18px] font-Pixels">
            Create your Noun Avatar
          </Text>
        </View>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the avatar, newAvatar or containerSize props change
    return (
      prevProps.containerSize.width === nextProps.containerSize.width &&
      prevProps.containerSize.height === nextProps.containerSize.height &&
      prevProps.avatar.head === nextProps.avatar.head &&
      prevProps.avatar.body === nextProps.avatar.body &&
      prevProps.avatar.accessories === nextProps.avatar.accessories &&
      prevProps.avatar.glasses === nextProps.avatar.glasses &&
      prevProps.newAvatar.head === nextProps.newAvatar.head &&
      prevProps.newAvatar.body === nextProps.newAvatar.body &&
      prevProps.newAvatar.accessories === nextProps.newAvatar.accessories &&
      prevProps.newAvatar.glasses === nextProps.newAvatar.glasses &&
      prevProps.creatingAvatar === nextProps.creatingAvatar
    );
  },
);

export default AvatarCreator;
