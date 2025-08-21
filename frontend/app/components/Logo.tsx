import React, { useEffect } from "react";
import { View, Dimensions } from "react-native";
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
  withSequence,
  withTiming,
  withRepeat,
  useDerivedValue,
  Easing,
} from "react-native-reanimated";

interface LogoProps {
  doEnterAnim?: boolean;
  doWaveAnim?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ doEnterAnim = false, doWaveAnim = false }) => {
  const { getImage } = useImages();
  const { width: screenWidth } = Dimensions.get("window");

  // Scale factor based on screen width (iPhone SE width is 375)
  const scaleFactor = Math.min(screenWidth / 400, 1);

  // Final positions
  const finalY = 232 * scaleFactor;
  const mainFinalY = 220 * scaleFactor;
  const sublogoFinalX = 100 * scaleFactor;

  // Animated values for character Y positions (falling from top if animated, otherwise at final position)
  const pShadowY = useSharedValue(doEnterAnim ? -200 : finalY);
  const oShadowY = useSharedValue(doEnterAnim ? -250 : finalY);
  const wShadowY = useSharedValue(doEnterAnim ? -300 : finalY);
  const exclamationShadowY = useSharedValue(doEnterAnim ? -350 : finalY);

  const pMainY = useSharedValue(doEnterAnim ? -200 : mainFinalY);
  const oMainY = useSharedValue(doEnterAnim ? -250 : mainFinalY);
  const wMainY = useSharedValue(doEnterAnim ? -300 : mainFinalY);
  const exclamationMainY = useSharedValue(doEnterAnim ? -350 : mainFinalY);

  const sublogoX = useSharedValue(doEnterAnim ? 400 : sublogoFinalX);

  // Fixed X positions for each character (scaled)
  const pX = 30 * scaleFactor;
  const oX = 104 * scaleFactor;
  const wX = 181 * scaleFactor;
  const exclamationX = 310 * scaleFactor;

  const pShadowX = 42 * scaleFactor;
  const oShadowX = 116 * scaleFactor;
  const wShadowX = 193 * scaleFactor;
  const exclamationShadowX = 322 * scaleFactor;

  // Derived values for white outlines (offset from main letters)
  const pOutlineXDerived = pX - 2 * scaleFactor;
  const oOutlineXDerived = oX - 2 * scaleFactor;
  const wOutlineXDerived = wX - 2 * scaleFactor;
  const exclamationOutlineXDerived = exclamationX - 2 * scaleFactor;

  const pShadowOutlineXDerived = pShadowX - 2 * scaleFactor;
  const oShadowOutlineXDerived = oShadowX - 2 * scaleFactor;
  const wShadowOutlineXDerived = wShadowX - 2 * scaleFactor;
  const exclamationShadowOutlineXDerived = exclamationShadowX - 2 * scaleFactor;

  // Derived values for Y positions with outline offsets
  const pShadowOutlineYDerived = useDerivedValue(
    () => pShadowY.value - 1 * scaleFactor,
  );
  const oShadowOutlineYDerived = useDerivedValue(
    () => oShadowY.value - 1 * scaleFactor,
  );
  const wShadowOutlineYDerived = useDerivedValue(
    () => wShadowY.value - 1 * scaleFactor,
  );
  const exclamationShadowOutlineYDerived = useDerivedValue(
    () => exclamationShadowY.value - 1 * scaleFactor,
  );

  const pOutlineYDerived = useDerivedValue(
    () => pMainY.value - 2 * scaleFactor,
  );
  const oOutlineYDerived = useDerivedValue(
    () => oMainY.value - 2 * scaleFactor,
  );
  const wOutlineYDerived = useDerivedValue(
    () => wMainY.value - 2 * scaleFactor,
  );
  const exclamationOutlineYDerived = useDerivedValue(
    () => exclamationMainY.value - 2 * scaleFactor,
  );

  useEffect(() => {
    // Only animate if doEnterAnim is true
    if (!doEnterAnim) return;

    pShadowY.value = withDelay(
      100,
      withSpring(finalY, {
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
      withSpring(mainFinalY, {
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
      withSpring(finalY, {
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
      withSpring(mainFinalY, {
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
      withSpring(finalY, {
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
      withSpring(mainFinalY, {
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
      withSpring(finalY, {
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
      withSpring(mainFinalY, {
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
      withSpring(sublogoFinalX, {
        damping: 12,
        stiffness: 90,
        mass: 0.8,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      }),
    );
  }, [doEnterAnim]);

  useEffect(() => {
    if (!doWaveAnim) return;

    // Create the bounce animation sequence with rest period
    pMainY.value = withRepeat(
      withSequence(
        // Quick bounce up
        withTiming(mainFinalY - 40, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
        // Fall back down with gravity feel and squishy landing
        withSpring(mainFinalY, {
          damping: 10,
          stiffness: 120,
          mass: 1.2,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // Rest period (1 second)
        withTiming(mainFinalY, {
          duration: 400,
        })
      ),
      -1, // Repeat indefinitely
    );

    oMainY.value = withRepeat(
      withSequence(
        // Delay for wave effect
        withTiming(mainFinalY, {
          duration: 100,
        }),
        // Quick bounce up
        withTiming(mainFinalY - 40, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
        // Fall back down with gravity feel and squishy landing
        withSpring(mainFinalY, {
          damping: 10,
          stiffness: 120,
          mass: 1.2,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // Rest period (1 second)
        withTiming(mainFinalY, {
          duration: 300,
        })
      ),
      -1, // Repeat indefinitely
    );

    wMainY.value = withRepeat(
      withSequence(
        // Delay for wave effect
        withTiming(mainFinalY, {
          duration: 200,
        }),
        // Quick bounce up
        withTiming(mainFinalY - 40, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
        // Fall back down with gravity feel and squishy landing
        withSpring(mainFinalY, {
          damping: 10,
          stiffness: 120,
          mass: 1.2,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // Rest period (1 second)
        withTiming(mainFinalY, {
          duration: 200,
        })
      ),
      -1, // Repeat indefinitely
    );

    exclamationMainY.value = withRepeat(
      withSequence(
        // Delay for wave effect
        withTiming(mainFinalY, {
          duration: 300,
        }),
        // Quick bounce up
        withTiming(mainFinalY - 40, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
        // Fall back down with gravity feel and squishy landing
        withSpring(mainFinalY, {
          damping: 10,
          stiffness: 120,
          mass: 1.2,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // Rest period (1 second)
        withTiming(mainFinalY, {
          duration: 100,
        })
      ),
      -1, // Repeat indefinitely
    );

    pShadowY.value = withRepeat(
      withSequence(
        // Quick bounce up
        withTiming(finalY - 40, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
        // Fall back down with gravity feel and squishy landing
        withSpring(finalY, {
          damping: 10,
          stiffness: 120,
          mass: 1.2,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // Rest period (1 second)
        withTiming(finalY, {
          duration: 400,
        })
      ),
      -1, // Repeat indefinitely
    );

    oShadowY.value = withRepeat(
      withSequence(
        // Delay for wave effect
        withTiming(finalY, {
          duration: 100,
        }),
        // Quick bounce up
        withTiming(finalY - 40, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
        // Fall back down with gravity feel and squishy landing
        withSpring(finalY, {
          damping: 10,
          stiffness: 120,
          mass: 1.2,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // Rest period (1 second)
        withTiming(finalY, {
          duration: 300,
        })
      ),
      -1, // Repeat indefinitely
    );

    wShadowY.value = withRepeat(
      withSequence(
        // Delay for wave effect
        withTiming(finalY, {
          duration: 200,
        }),
        // Quick bounce up
        withTiming(finalY - 40, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
        // Fall back down with gravity feel and squishy landing
        withSpring(finalY, {
          damping: 10,
          stiffness: 120,
          mass: 1.2,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // Rest period (1 second)
        withTiming(finalY, {
          duration: 200,
        })
      ),
      -1, // Repeat indefinitely
    );

    exclamationShadowY.value = withRepeat(
      withSequence(
        // Delay for wave effect
        withTiming(finalY, {
          duration: 300,
        }),
        // Quick bounce up
        withTiming(finalY - 40, {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        }),
        // Fall back down with gravity feel and squishy landing
        withSpring(finalY, {
          damping: 10,
          stiffness: 120,
          mass: 1.2,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // Rest period (1 second)
        withTiming(finalY, {
          duration: 100,
        })
      ),
      -1, // Repeat indefinitely
    );
    
  }, [doWaveAnim]);

  return (
    <Animated.View
      className="absolute"
      style={{
        width: "90%",
        maxWidth: 360 * scaleFactor,
        height: 600 * scaleFactor,
        top: "30%",
        marginTop: -200 * scaleFactor,
        overflow: "visible",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <Canvas
        style={{
          position: "absolute",
          width: "100%",
          height: 600 * scaleFactor,
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
            width={34 * scaleFactor}
            height={84 * scaleFactor}
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
            width={140 * scaleFactor}
            height={84 * scaleFactor}
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
            width={90 * scaleFactor}
            height={84 * scaleFactor}
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
            width={86 * scaleFactor}
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
            image={getImage("logoExclamation")}
            fit="contain"
            x={exclamationOutlineXDerived}
            y={exclamationOutlineYDerived}
            width={34 * scaleFactor}
            height={84 * scaleFactor}
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
            width={140 * scaleFactor}
            height={84 * scaleFactor}
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
            width={90 * scaleFactor}
            height={84 * scaleFactor}
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
            width={86 * scaleFactor}
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
          width: 600 * scaleFactor,
          height: 18 * scaleFactor,
          top: 325 * scaleFactor,
          right: (30 - 320) * scaleFactor,
          zIndex: -1,
          overflow: "visible",
          paddingLeft: 100 * scaleFactor,
        }}
      >
        <Canvas
          style={{
            position: "absolute",
            left: 0,
            width: 600 * scaleFactor,
            height: "100%",
            overflow: "visible",
          }}
        >
          <Image
            image={getImage("sublogo")}
            fit="contain"
            x={sublogoX}
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
  );
};
