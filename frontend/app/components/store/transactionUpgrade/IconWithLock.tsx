import React, { useMemo } from "react";
import { View } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import Animated, { FadeOut } from "react-native-reanimated";
import { useImages } from "../../../hooks/useImages";

type IconWithLockProps = {
  txIcon: string;
  locked: boolean;
};

export const IconWithLock: React.FC<IconWithLockProps> = React.memo(
  ({ txIcon, locked }) => {
    const { getImage } = useImages();

    // Memoize image references to prevent Canvas re-renders
    const backgroundImage = useMemo(() => getImage("shop.tx.bg"), [getImage]);
    const iconImage = useMemo(() => getImage(txIcon), [getImage, txIcon]);
    const lockImage = useMemo(() => getImage("shop.lock"), [getImage]);

    // Create stable key for Canvas components based on content
    const canvasKey = `${txIcon}-${locked ? "locked" : "unlocked"}`;

    return (
      <View className="flex flex-col justify-center relative w-[64px] h-[64px] relative">
        <Canvas
          key={`bg-${canvasKey}`}
          style={{ flex: 1 }}
          className="w-full h-full"
        >
          <Image
            image={backgroundImage}
            fit="fill"
            x={0}
            y={0}
            width={64}
            height={64}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.None,
            }}
          />
        </Canvas>
        <View className="absolute top-0 left-0 w-full h-full">
          <Canvas
            key={`icon-${canvasKey}`}
            style={{ flex: 1 }}
            className="w-full h-full"
          >
            <Image
              image={iconImage}
              fit="fill"
              x={14}
              y={14}
              width={36}
              height={36}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.None,
              }}
            />
          </Canvas>
        </View>
        {locked && (
          <Animated.View
            className="absolute top-0 left-0 w-full h-full
                         bg-[#10111970] rounded-sm"
            exiting={FadeOut}
          >
            <Canvas
              key={`lock-${canvasKey}`}
              style={{ flex: 1 }}
              className="w-full h-full"
            >
              <Image
                image={lockImage}
                fit="fill"
                x={14}
                y={14}
                width={36}
                height={36}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.None,
                }}
              />
            </Canvas>
          </Animated.View>
        )}
      </View>
    );
  },
);
