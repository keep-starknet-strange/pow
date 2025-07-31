import React, { useEffect } from "react";
import { View } from "react-native";
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
  FadeInUp,
  useSharedValue,
  withTiming,
  withDelay,
  useDerivedValue,
} from "react-native-reanimated";

export const Logo: React.FC = () => {
  const { getImage } = useImages();

  // Animated values for character positions
  const pShadowX = useSharedValue(-100);
  const oShadowX = useSharedValue(-150);
  const wShadowX = useSharedValue(-200);
  const exclamationShadowX = useSharedValue(-250);

  const pMainX = useSharedValue(-100);
  const oMainX = useSharedValue(-150);
  const wMainX = useSharedValue(-200);
  const exclamationMainX = useSharedValue(-250);

  // Derived values for white outlines (offset from main letters)
  const pOutlineXDerived = useDerivedValue(() => pMainX.value - 2);
  const oOutlineXDerived = useDerivedValue(() => oMainX.value - 2);
  const wOutlineXDerived = useDerivedValue(() => wMainX.value - 2);
  const exclamationOutlineXDerived = useDerivedValue(
    () => exclamationMainX.value - 2,
  );

  const pShadowOutlineXDerived = useDerivedValue(() => pShadowX.value - 2);
  const oShadowOutlineXDerived = useDerivedValue(() => oShadowX.value - 2);
  const wShadowOutlineXDerived = useDerivedValue(() => wShadowX.value - 2);
  const exclamationShadowOutlineXDerived = useDerivedValue(
    () => exclamationShadowX.value - 2,
  );

  useEffect(() => {
    // Animate characters flying in from left with staggered timing
    pShadowX.value = withDelay(100, withTiming(42, { duration: 800 }));
    pMainX.value = withDelay(100, withTiming(30, { duration: 800 }));

    oShadowX.value = withDelay(200, withTiming(116, { duration: 800 }));
    oMainX.value = withDelay(200, withTiming(104, { duration: 800 }));

    wShadowX.value = withDelay(300, withTiming(193, { duration: 800 }));
    wMainX.value = withDelay(300, withTiming(181, { duration: 800 }));

    exclamationShadowX.value = withDelay(
      400,
      withTiming(322, { duration: 800 }),
    );
    exclamationMainX.value = withDelay(400, withTiming(310, { duration: 800 }));
  }, []);

  return (
    <Animated.View
      entering={FadeInUp}
      className="absolute"
      style={{
        width: "90%",
        height: 140,
        top: "35%",
      }}
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        {/* White outlines for shadows */}
        <Group>
          <ColorMatrix
            matrix={[
              0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0,
            ]}
          />
          <Image
            image={getImage("logoExclamation")}
            fit="contain"
            x={exclamationShadowOutlineXDerived}
            y={31}
            width={34}
            height={84}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoW")}
            fit="contain"
            x={wShadowOutlineXDerived}
            y={31}
            width={140}
            height={84}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoO")}
            fit="contain"
            x={oShadowOutlineXDerived}
            y={31}
            width={90}
            height={84}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoP")}
            fit="contain"
            x={pShadowOutlineXDerived}
            y={31}
            width={86}
            height={84}
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
            image={getImage("logoExclamation")}
            fit="contain"
            x={exclamationOutlineXDerived}
            y={18}
            width={34}
            height={84}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoW")}
            fit="contain"
            x={wOutlineXDerived}
            y={18}
            width={140}
            height={84}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoO")}
            fit="contain"
            x={oOutlineXDerived}
            y={18}
            width={90}
            height={84}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoP")}
            fit="contain"
            x={pOutlineXDerived}
            y={18}
            width={86}
            height={84}
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
            image={getImage("logoExclamation")}
            fit="contain"
            x={exclamationShadowX}
            y={32}
            width={30}
            height={80}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoW")}
            fit="contain"
            x={wShadowX}
            y={32}
            width={136}
            height={80}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoO")}
            fit="contain"
            x={oShadowX}
            y={32}
            width={86}
            height={80}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
          <Image
            image={getImage("logoP")}
            fit="contain"
            x={pShadowX}
            y={32}
            width={82}
            height={80}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Group>

        {/* Main letters */}
        <Image
          image={getImage("logoExclamation")}
          fit="contain"
          x={exclamationMainX}
          y={20}
          width={30}
          height={80}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
        <Image
          image={getImage("logoW")}
          fit="contain"
          x={wMainX}
          y={20}
          width={136}
          height={80}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
        <Image
          image={getImage("logoO")}
          fit="contain"
          x={oMainX}
          y={20}
          width={86}
          height={80}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
        <Image
          image={getImage("logoP")}
          fit="contain"
          x={pMainX}
          y={20}
          width={82}
          height={80}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
      <View
        className="absolute bottom-[-10px] right-[30px]"
        style={{ width: 182, height: 18 }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("sublogo")}
            fit="contain"
            x={0}
            y={0}
            width={182}
            height={18}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
    </Animated.View>
  );
};