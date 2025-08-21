import React, { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
  Group,
  ColorMatrix,
} from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  useDerivedValue,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";
import { MainBackground } from "./MainBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import loadingConfig from "../configs/loading.json";

export const LoadingScreen: React.FC = () => {
  const { getImage } = useImages();
  const { width: screenWidth } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  
  // Scale factor based on screen width
  const scaleFactor = Math.min(screenWidth / 400, 1);

  // Get random tip/lore/fact
  const [tipText, setTipText] = useState("");
  
  useEffect(() => {
    const allTexts = [
      ...loadingConfig.tips,
      ...loadingConfig.lore,
      ...loadingConfig.facts,
    ];
    const randomText = allTexts[Math.floor(Math.random() * allTexts.length)];
    setTipText(randomText);
  }, []);

  // Animated values for wave animation
  const pY = useSharedValue(0);
  const oY = useSharedValue(0);
  const wY = useSharedValue(0);
  const exclamationY = useSharedValue(0);

  // Shadow positions follow main letters
  const pShadowY = useDerivedValue(() => pY.value + 12 * scaleFactor);
  const oShadowY = useDerivedValue(() => oY.value + 12 * scaleFactor);
  const wShadowY = useDerivedValue(() => wY.value + 12 * scaleFactor);
  const exclamationShadowY = useDerivedValue(() => exclamationY.value + 12 * scaleFactor);

  // Fixed X positions for each character (scaled)
  const pX = 30 * scaleFactor;
  const oX = 104 * scaleFactor;
  const wX = 181 * scaleFactor;
  const exclamationX = 310 * scaleFactor;

  const pShadowX = 42 * scaleFactor;
  const oShadowX = 116 * scaleFactor;
  const wShadowX = 193 * scaleFactor;
  const exclamationShadowX = 322 * scaleFactor;

  // Base Y position for letters
  const baseY = 220 * scaleFactor;

  // Outline positions
  const pOutlineX = pX - 2 * scaleFactor;
  const oOutlineX = oX - 2 * scaleFactor;
  const wOutlineX = wX - 2 * scaleFactor;
  const exclamationOutlineX = exclamationX - 2 * scaleFactor;

  const pShadowOutlineX = pShadowX - 2 * scaleFactor;
  const oShadowOutlineX = oShadowX - 2 * scaleFactor;
  const wShadowOutlineX = wShadowX - 2 * scaleFactor;
  const exclamationShadowOutlineX = exclamationShadowX - 2 * scaleFactor;

  const pOutlineY = useDerivedValue(() => baseY + pY.value - 2 * scaleFactor);
  const oOutlineY = useDerivedValue(() => baseY + oY.value - 2 * scaleFactor);
  const wOutlineY = useDerivedValue(() => baseY + wY.value - 2 * scaleFactor);
  const exclamationOutlineY = useDerivedValue(() => baseY + exclamationY.value - 2 * scaleFactor);

  const pShadowOutlineY = useDerivedValue(() => pShadowY.value + baseY - 1 * scaleFactor);
  const oShadowOutlineY = useDerivedValue(() => oShadowY.value + baseY - 1 * scaleFactor);
  const wShadowOutlineY = useDerivedValue(() => wShadowY.value + baseY - 1 * scaleFactor);
  const exclamationShadowOutlineY = useDerivedValue(() => exclamationShadowY.value + baseY - 1 * scaleFactor);

  // Animated loading dots
  const [dots, setDots] = useState(".");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Start wave animation
  useEffect(() => {
    const bounceHeight = -30 * scaleFactor;
    const duration = 400;
    const staggerDelay = 100;

    pY.value = withRepeat(
      withSequence(
        withDelay(0, withTiming(bounceHeight, { duration, easing: Easing.out(Easing.quad) })),
        withTiming(0, { duration, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: staggerDelay * 3 })
      ),
      -1,
      false
    );

    oY.value = withRepeat(
      withSequence(
        withDelay(staggerDelay, withTiming(bounceHeight, { duration, easing: Easing.out(Easing.quad) })),
        withTiming(0, { duration, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: staggerDelay * 3 })
      ),
      -1,
      false
    );

    wY.value = withRepeat(
      withSequence(
        withDelay(staggerDelay * 2, withTiming(bounceHeight, { duration, easing: Easing.out(Easing.quad) })),
        withTiming(0, { duration, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: staggerDelay * 3 })
      ),
      -1,
      false
    );

    exclamationY.value = withRepeat(
      withSequence(
        withDelay(staggerDelay * 3, withTiming(bounceHeight, { duration, easing: Easing.out(Easing.quad) })),
        withTiming(0, { duration, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: staggerDelay * 3 })
      ),
      -1,
      false
    );
  }, []);

  const pMainY = useDerivedValue(() => baseY + pY.value);
  const oMainY = useDerivedValue(() => baseY + oY.value);
  const wMainY = useDerivedValue(() => baseY + wY.value);
  const exclamationMainY = useDerivedValue(() => baseY + exclamationY.value);

  return (
    <View className="flex-1 items-center">
      <MainBackground />
      <View
        className="absolute w-full h-full items-center justify-center"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/* Logo with wave animation */}
        <Animated.View
          style={{
            width: "90%",
            maxWidth: 360 * scaleFactor,
            height: 400 * scaleFactor,
            marginTop: -100 * scaleFactor,
            overflow: "visible",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <Canvas
            style={{
              position: "absolute",
              width: "100%",
              height: 400 * scaleFactor,
              overflow: "visible",
            }}
          >
            {/* White outlines for shadows */}
            <Group>
              <ColorMatrix
                matrix={[
                  0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0,
                ]}
              />
              <Image
                image={getImage("logoP")}
                fit="contain"
                x={pShadowOutlineX}
                y={pShadowOutlineY}
                width={86 * scaleFactor}
                height={84 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoO")}
                fit="contain"
                x={oShadowOutlineX}
                y={oShadowOutlineY}
                width={90 * scaleFactor}
                height={84 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoW")}
                fit="contain"
                x={wShadowOutlineX}
                y={wShadowOutlineY}
                width={140 * scaleFactor}
                height={84 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoExclamation")}
                fit="contain"
                x={exclamationShadowOutlineX}
                y={exclamationShadowOutlineY}
                width={34 * scaleFactor}
                height={84 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Group>

            {/* White outlines for main letters */}
            <Group>
              <ColorMatrix
                matrix={[
                  0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0,
                ]}
              />
              <Image
                image={getImage("logoP")}
                fit="contain"
                x={pOutlineX}
                y={pOutlineY}
                width={86 * scaleFactor}
                height={84 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoO")}
                fit="contain"
                x={oOutlineX}
                y={oOutlineY}
                width={90 * scaleFactor}
                height={84 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoW")}
                fit="contain"
                x={wOutlineX}
                y={wOutlineY}
                width={140 * scaleFactor}
                height={84 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoExclamation")}
                fit="contain"
                x={exclamationOutlineX}
                y={exclamationOutlineY}
                width={34 * scaleFactor}
                height={84 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Group>

            {/* Purple shadows */}
            <Group>
              <ColorMatrix
                matrix={[
                  0, 0, 0.263, 0, 0.263, 0, 0, 0.051, 0, 0.051, 0, 0, 0.569, 0,
                  0.569, 0, 0, 0, 1, 0,
                ]}
              />
              <Image
                image={getImage("logoP")}
                fit="contain"
                x={pShadowX}
                y={pShadowY}
                width={82 * scaleFactor}
                height={80 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoO")}
                fit="contain"
                x={oShadowX}
                y={oShadowY}
                width={86 * scaleFactor}
                height={80 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoW")}
                fit="contain"
                x={wShadowX}
                y={wShadowY}
                width={136 * scaleFactor}
                height={80 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
              <Image
                image={getImage("logoExclamation")}
                fit="contain"
                x={exclamationShadowX}
                y={exclamationShadowY}
                width={30 * scaleFactor}
                height={80 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Group>

            {/* Main letters */}
            <Image
              image={getImage("logoP")}
              fit="contain"
              x={pX}
              y={pMainY}
              width={82}
              height={80}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
            <Image
              image={getImage("logoO")}
              fit="contain"
              x={oX}
              y={oMainY}
              width={86}
              height={80}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
            <Image
              image={getImage("logoW")}
              fit="contain"
              x={wX}
              y={wMainY}
              width={136}
              height={80}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
            <Image
              image={getImage("logoExclamation")}
              fit="contain"
              x={exclamationX}
              y={exclamationMainY}
              width={30}
              height={80}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
          
          {/* Powered by Starknet */}
          <View
            className="absolute"
            style={{
              width: 182 * scaleFactor,
              height: 18 * scaleFactor,
              top: 320 * scaleFactor,
              left: "50%",
              marginLeft: -91 * scaleFactor,
            }}
          >
            <Canvas
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Image
                image={getImage("sublogo")}
                fit="contain"
                x={0}
                y={0}
                width={182 * scaleFactor}
                height={18 * scaleFactor}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Canvas>
          </View>
        </Animated.View>

        {/* Tip/Lore Text */}
        <View className="absolute" style={{ top: "60%", paddingHorizontal: 40 }}>
          <Text 
            className="text-white font-Teatime text-center"
            style={{ fontSize: 14 * scaleFactor, lineHeight: 20 * scaleFactor }}
          >
            {tipText}
          </Text>
        </View>

        {/* Loading dots */}
        <View className="absolute bottom-8 right-8">
          <Text className="text-white font-Pixels" style={{ fontSize: 16 }}>
            Loading{dots}
          </Text>
        </View>
      </View>
    </View>
  );
};