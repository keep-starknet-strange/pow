import React, { useState, memo } from "react";
import { View, Text, Pressable } from "react-native";
import {
  Canvas,
  FilterMode,
  MipmapMode,
  Image,
} from "@shopify/react-native-skia";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getRandomNounsAttributes, NounsAttributes } from "../../configs/nouns";
import { useImages } from "../../hooks/useImages";
import { useEventManager } from "../../stores/useEventManager";
import { PFPView } from "../../components/PFPView";

export interface AvatarCreatorProps {
  avatar: NounsAttributes;
  setAvatar: (avatar: NounsAttributes) => void;
  newAvatar: NounsAttributes;
  setNewAvatar: (avatar: NounsAttributes) => void;
  startCreatingAvatar: () => void;
  creatingAvatar: boolean;
}

export const AvatarCreator: React.FC<AvatarCreatorProps> = memo(
  ({
    avatar,
    setAvatar,
    newAvatar,
    setNewAvatar,
    startCreatingAvatar,
    creatingAvatar,
  }) => {
    const HEADER_HEIGHT = 60;
    const { getImage } = useImages();
    const { notify } = useEventManager();

    return (
      <Animated.View
        entering={FadeInUp}
        style={{
          alignItems: "center",
          marginTop: HEADER_HEIGHT,
        }}
      >
        <View className="relative">
          <Pressable
            className="flex items-center justify-center bg-[#10111910]
                     w-[250px] h-[250px] p-4 mt-8
                     rounded-xl shadow-lg shadow-black/50 relative"
            onPress={startCreatingAvatar}
          >
            <View className="absolute top-0 left-0 w-[250px] h-[250px]">
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <Image
                  image={getImage("block.grid.min")}
                  fit="fill"
                  x={0}
                  y={0}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                  width={246}
                  height={246}
                />
              </Canvas>
            </View>
            <PFPView attributes={creatingAvatar ? newAvatar : avatar} />
          </Pressable>
          <Pressable
            className="absolute top-[85px] right-[-42px] shadow-lg shadow-black/50"
            onPress={startCreatingAvatar}
          >
            <Canvas style={{ width: 40, height: 40 }}>
              <Image
                image={getImage("icon.edit")}
                fit="contain"
                x={0}
                y={0}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                width={40}
                height={40}
              />
            </Canvas>
          </Pressable>
          <Pressable
            className="absolute top-[40px] right-[-42px] shadow-lg shadow-black/50"
            onPress={() => {
              const newAvatar = getRandomNounsAttributes();
              setAvatar(newAvatar);
              setNewAvatar(newAvatar);
              notify("DiceRoll");
            }}
          >
            <Canvas style={{ width: 40, height: 40 }}>
              <Image
                image={getImage("icon.random")}
                fit="contain"
                x={0}
                y={0}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                width={40}
                height={40}
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
    // Only re-render if the avatar or newAvatar props change
    return (
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
