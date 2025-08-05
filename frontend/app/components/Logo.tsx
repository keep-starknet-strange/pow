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
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
} from "react-native-reanimated";

export const Logo: React.FC = () => {
  const { getImage } = useImages();

  // Animated values for character Y positions (falling from top)
  const pShadowY = useSharedValue(-200);
  const oShadowY = useSharedValue(-250);
  const wShadowY = useSharedValue(-300);
  const exclamationShadowY = useSharedValue(-350);

  const pMainY = useSharedValue(-200);
  const oMainY = useSharedValue(-250);
  const wMainY = useSharedValue(-300);
  const exclamationMainY = useSharedValue(-350);

  const sublogoX = useSharedValue(400);

  // Fixed X positions for each character
  const pX = 30;
  const oX = 104;
  const wX = 181;
  const exclamationX = 310;

  const pShadowX = 42;
  const oShadowX = 116;
  const wShadowX = 193;
  const exclamationShadowX = 322;

  // Derived values for white outlines (offset from main letters)
  const pOutlineXDerived = pX - 2;
  const oOutlineXDerived = oX - 2;
  const wOutlineXDerived = wX - 2;
  const exclamationOutlineXDerived = exclamationX - 2;

  const pShadowOutlineXDerived = pShadowX - 2;
  const oShadowOutlineXDerived = oShadowX - 2;
  const wShadowOutlineXDerived = wShadowX - 2;
  const exclamationShadowOutlineXDerived = exclamationShadowX - 2;

  // Derived values for Y positions with outline offsets
  const pShadowOutlineYDerived = useDerivedValue(() => pShadowY.value - 1);
  const oShadowOutlineYDerived = useDerivedValue(() => oShadowY.value - 1);
  const wShadowOutlineYDerived = useDerivedValue(() => wShadowY.value - 1);
  const exclamationShadowOutlineYDerived = useDerivedValue(
    () => exclamationShadowY.value - 1,
  );

  const pOutlineYDerived = useDerivedValue(() => pMainY.value - 2);
  const oOutlineYDerived = useDerivedValue(() => oMainY.value - 2);
  const wOutlineYDerived = useDerivedValue(() => wMainY.value - 2);
  const exclamationOutlineYDerived = useDerivedValue(
    () => exclamationMainY.value - 2,
  );

  useEffect(() => {
    // Animate characters falling from top with bouncy spring animation
    // Final positions adjusted for canvas offset (200px down due to marginTop: -200)
    pShadowY.value = withDelay(
      100,
      withSpring(232, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );
    pMainY.value = withDelay(
      100,
      withSpring(220, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );

    oShadowY.value = withDelay(
      200,
      withSpring(232, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );
    oMainY.value = withDelay(
      200,
      withSpring(220, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );

    wShadowY.value = withDelay(
      300,
      withSpring(232, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );
    wMainY.value = withDelay(
      300,
      withSpring(220, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );

    exclamationShadowY.value = withDelay(
      400,
      withSpring(232, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );
    exclamationMainY.value = withDelay(
      400,
      withSpring(220, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );

    sublogoX.value = withDelay(
      600,
      withSpring(100, {
        damping: 12,
        stiffness: 90,
        mass: 0.8,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );
  }, []);

  return (
    <Animated.View
      className="absolute"
      style={{
        width: "90%",
        height: 600,
        top: "35%",
        marginTop: -200,
        overflow: "visible",
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        style={{
          position: "absolute",
          width: "100%",
          height: 600,
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
            image={getImage("logoExclamation")}
            fit="contain"
            x={exclamationShadowOutlineXDerived}
            y={exclamationShadowOutlineYDerived}
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
            y={wShadowOutlineYDerived}
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
            y={oShadowOutlineYDerived}
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
            y={pShadowOutlineYDerived}
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
            y={exclamationOutlineYDerived}
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
            y={wOutlineYDerived}
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
            y={oOutlineYDerived}
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
            y={pOutlineYDerived}
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
            y={exclamationShadowY}
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
            y={wShadowY}
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
            y={oShadowY}
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
            y={pShadowY}
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
          x={exclamationX}
          y={exclamationMainY}
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
      </Canvas>
      <View
        className="absolute"
        style={{
          width: 600,
          height: 18,
          top: 320,
          right: 30 - 300,
          zIndex: -1,
          overflow: "visible",
          paddingLeft: 100,
        }}
      >
        <Canvas
          style={{
            position: "absolute",
            left: 0,
            width: 600,
            height: "100%",
            overflow: "visible",
          }}
        >
          <Image
            image={getImage("sublogo")}
            fit="contain"
            x={sublogoX}
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
