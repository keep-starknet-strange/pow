import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import {
  Canvas,
  Image as SkiaImg,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";
import { useEventManager } from "../context/EventManager";
import {
  getNounsAccessoriesList,
  getNounsBodiesList,
  getNounsGlassesList,
  getNounsHeadsList,
  getRandomNounsAttributes,
  NounsAttributes,
} from "../configs/nouns";

interface NounsBuilderProps {
  avatar: NounsAttributes;
  setCreatingAvatar: (creating: boolean) => void;
  applyAvatarCreation: () => void;
  newAvatar: NounsAttributes;
  setNewAvatar: (avatar: NounsAttributes) => void;
}

const NounsBuilder: React.FC<NounsBuilderProps> = ({
  avatar,
  setCreatingAvatar,
  applyAvatarCreation,
  newAvatar,
  setNewAvatar,
}) => {
  const { getImage } = useImages();
  const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const { notify } = useEventManager();

  const avatarTabs = [
    { label: "Heads", value: "head", list: getNounsHeadsList() },
    { label: "Glasses", value: "glasses", list: getNounsGlassesList() },
    { label: "Bodies", value: "body", list: getNounsBodiesList() },
    {
      label: "Accs",
      value: "accessories",
      list: getNounsAccessoriesList(),
    },
  ];
  const [avatarTab, setAvatarTab] = React.useState<{
    label: string;
    value: string;
    list: any[];
  }>(avatarTabs[0]);

  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown}
      style={{ marginBottom: insets.bottom }}
      className="absolute left-0 right-0 bottom-0 px-2 pt-2 h-[414px]
                          flex flex-col items-center justify-start gap-1 w-full"
    >
      <Canvas
        style={{ width: width, height: 414, position: "absolute", top: 0 }}
      >
        <SkiaImg
          image={getImage("nouns.creator.bg")}
          fit="fill"
          x={0}
          y={0}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
          width={width}
          height={414}
        />
      </Canvas>
      <View className="flex flex-row items-center justify-between w-full">
        <View className="relative">
          <Canvas style={{ width: 200, height: 24 }}>
            <SkiaImg
              image={getImage("nouns.titleplate")}
              fit="fill"
              x={0}
              y={0}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              width={200}
              height={24}
            />
          </Canvas>
          <Text className="absolute top-[3px] left-[6px] text-[#fff7ff] text-[18px] font-Pixels">
            NOUNS BUILDER
          </Text>
        </View>
        <View className="flex flex-row gap-2 items-center">
          <TouchableOpacity
            className="py-1 px-2"
            onPress={() => {
              const newAvatar = getRandomNounsAttributes();
              setNewAvatar(newAvatar);
            }}
          >
            <Canvas style={{ width: 30, height: 30 }}>
              <SkiaImg
                image={getImage("icon.random")}
                fit="contain"
                x={0}
                y={0}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                width={30}
                height={30}
              />
            </Canvas>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setCreatingAvatar(false);
              setNewAvatar(avatar);
            }}
            className=""
          >
            <Canvas style={{ width: 24, height: 24 }}>
              <SkiaImg
                image={getImage("icon.close")}
                fit="contain"
                x={0}
                y={0}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
                width={24}
                height={24}
              />
            </Canvas>
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex flex-row items-end px-4 gap-[1px] mt-[9px]">
        {avatarTabs.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => setAvatarTab(tab)}
            className="relative flex justify-center"
            style={{
              width: (width - 2 * avatarTabs.length - 6) / avatarTabs.length,
              height: avatarTab.value === tab.value ? 32 : 24,
            }}
          >
            <Canvas style={{ flex: 1 }} className="w-full h-full">
              <SkiaImg
                image={getImage(
                  avatarTab.value === tab.value
                    ? "nouns.tab.active"
                    : "nouns.tab.inactive",
                )}
                fit="fill"
                x={0}
                y={0}
                width={(width - 2 * avatarTabs.length - 6) / avatarTabs.length}
                height={avatarTab.value === tab.value ? 32 : 24}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Canvas>
            <Text
              className={`text-[16px] font-Pixels ${avatarTab.value === tab.value ? "text-[#fff7ff]" : "text-[#717171]"} text-center absolute w-full`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-1 w-full relative">
        <ScrollView
          className="flex-1 w-full"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-row flex-wrap gap-1 w-full pt-1">
            {avatarTab.list.map((part, index) => (
              <TouchableOpacity
                key={index}
                className="h-20 aspect-square relative"
                onPress={() => {
                  setNewAvatar({
                    ...newAvatar,
                    [avatarTab.value as keyof NounsAttributes]: index,
                  });
                }}
              >
                {newAvatar[avatarTab.value as keyof NounsAttributes] ===
                  index && (
                  <View className="absolute top-0 left-0 h-20 aspect-square">
                    <Canvas style={{ flex: 1 }} className="w-full h-full">
                      <SkiaImg
                        image={
                          newAvatar[
                            avatarTab.value as keyof NounsAttributes
                          ] === index
                            ? getImage("nouns.slots")
                            : getImage("nouns.slots")
                        }
                        fit="cover"
                        x={0}
                        y={0}
                        sampling={{
                          filter: FilterMode.Nearest,
                          mipmap: MipmapMode.Nearest,
                        }}
                        width={68}
                        height={68}
                      />
                    </Canvas>
                  </View>
                )}
                <Image
                  source={part}
                  className="w-full h-full p-4"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <LinearGradient
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            width: "100%",
            height: 80,
            pointerEvents: "none",
          }}
          colors={["transparent", "#000000a0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          notify("BasicClick");
          applyAvatarCreation();
        }}
        className="w-full h-14 my-3"
      >
        <Text className="pt-2 text-[36px] font-Teatime text-[#fff7ff] text-center">
          APPLY
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NounsBuilder;
