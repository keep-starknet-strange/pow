import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "@/app/stores/useTutorialStore";

export const L1L2Switch = ({
  currentView,
  setCurrentView,
  isStore = false, // Default to false if not provided
}: {
  currentView: "L1" | "L2";
  setCurrentView: (view: "L1" | "L2") => void;
  isStore?: boolean; // Optional prop for store tab
}) => {
  const { getImage } = useImages();
  const { ref, onLayout } = useTutorialLayout(
    "l2StoreTab" as TargetId,
    isStore,
  );

  return (
    <View className="absolute right-0 top-0">
      <Canvas style={{ width: 92, height: 31 }}>
        <Image
          image={getImage("header.switch")}
          fit="fill"
          x={0}
          y={0}
          width={92}
          height={31}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
      <Pressable
        onPress={() => {
          setCurrentView("L1");
        }}
        className="absolute left-[6px] top-0 w-[38px] h-[21px]"
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage(
              currentView === "L1"
                ? "header.switch.active"
                : "header.switch.inactive",
            )}
            fit="fill"
            x={0}
            y={0}
            width={38}
            height={21}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <View className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-center">
          <Text
            className="text-[18px] font-Pixels"
            style={{ color: currentView === "L1" ? "#fff7ff" : "#7b7b7b" }}
          >
            L1
          </Text>
        </View>
      </Pressable>
      <Pressable
        ref={ref}
        onLayout={onLayout}
        onPress={() => {
          setCurrentView("L2");
        }}
        className="absolute right-[6px] top-0 w-[38px] h-[21px]"
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage(
              currentView === "L2"
                ? "header.switch.active"
                : "header.switch.inactive",
            )}
            fit="fill"
            x={0}
            y={0}
            width={38}
            height={21}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <View className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-center">
          <Text
            className="text-[18px] font-Pixels"
            style={{ color: currentView === "L2" ? "#fff7ff" : "#7b7b7b" }}
          >
            L2
          </Text>
        </View>
      </Pressable>
    </View>
  );
};
