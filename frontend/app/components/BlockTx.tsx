import React, { memo, useEffect } from "react";
import { View } from "react-native";
import { Canvas, Image } from "@shopify/react-native-skia";
import { FilterMode, MipmapMode } from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";
import { getTxImg, getBlockTxIcon } from "../utils/transactions";
import Animated, {
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

interface BlockTxProps {
  // Transaction props
  txTypeId: number;
  chainId: number;
  isDapp: boolean;
  // Positioning props
  index: number;
  txSize: number;
  txPerRow: number;
  // Animation props
  shouldExplode?: boolean;
  explosionDelay?: number;
  shouldMiniExplode?: boolean;
  miniExplosionDelay?: number;
}

export const BlockTx: React.FC<BlockTxProps> = memo((props) => {
  const { getImage } = useImages();

  // Calculate original position
  const originalLeft = (props.index % props.txPerRow) * props.txSize;
  const originalTop = Math.floor(props.index / props.txPerRow) * props.txSize;

  // Animation values for explosion effect
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Calculate center of the block and this BlockTx
  const blockCenter = (props.txPerRow * props.txSize) / 2;
  const txCenterX = originalLeft + props.txSize / 2;
  const txCenterY = originalTop + props.txSize / 2;

  // Calculate angle from block center to tx center
  const deltaX = txCenterX - blockCenter;
  const deltaY = txCenterY - blockCenter;
  // If tx is at center, use a random angle
  const explosionAngle =
    deltaX === 0 && deltaY === 0
      ? Math.random() * Math.PI * 2
      : Math.atan2(deltaY, deltaX);

  // Generate random explosion distance (30-60 pixels)
  const explosionDistance = Math.random() * 30 + 30;
  const explosionX = Math.cos(explosionAngle) * explosionDistance;
  const explosionY = Math.sin(explosionAngle) * explosionDistance;

  // Mini explosion for click animation (much subtler)
  const miniExplosionDistance = Math.random() * 5 + 5; // 5-10 pixels only
  const miniExplosionX = Math.cos(explosionAngle) * miniExplosionDistance;
  const miniExplosionY = Math.sin(explosionAngle) * miniExplosionDistance;

  useEffect(() => {
    if (props.shouldExplode) {
      const delay = props.explosionDelay || 0;

      // Wait for the delay, then explode out and return
      setTimeout(() => {
        translateX.value = withSequence(
          withTiming(explosionX, {
            duration: 200,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: 200,
            easing: Easing.in(Easing.quad),
          }),
        );

        translateY.value = withSequence(
          withTiming(explosionY, {
            duration: 200,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: 200,
            easing: Easing.in(Easing.quad),
          }),
        );
      }, delay);
    }
  }, [
    props.shouldExplode,
    props.explosionDelay,
    explosionX,
    explosionY,
    translateX,
    translateY,
  ]);

  useEffect(() => {
    if (props.shouldMiniExplode) {
      const delay = props.miniExplosionDelay || 0;

      // Mini explosion - much faster and smaller
      setTimeout(() => {
        translateX.value = withSequence(
          withTiming(miniExplosionX, {
            duration: 50,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: 100,
            easing: Easing.in(Easing.quad),
          }),
        );

        translateY.value = withSequence(
          withTiming(miniExplosionY, {
            duration: 50,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: 100,
            easing: Easing.in(Easing.quad),
          }),
        );
      }, delay);
    }
  }, [
    props.shouldMiniExplode,
    props.miniExplosionDelay,
    miniExplosionX,
    miniExplosionY,
    translateX,
    translateY,
  ]);

  const explosionStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <Animated.View
      entering={BounceIn.duration(400)}
      className="absolute"
      style={[
        {
          width: props.txSize,
          height: props.txSize,
          left: originalLeft,
          top: originalTop,
        },
        explosionStyle,
      ]}
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={getTxImg(
            props.chainId,
            props.txTypeId,
            props.isDapp,
            getImage,
          )}
          fit="fill"
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
          x={0}
          y={0}
          width={props.txSize}
          height={props.txSize}
        />
      </Canvas>
      <View className="absolute top-0 left-0 w-full h-full justify-center items-center">
        <Canvas
          style={{ width: props.txSize * 0.4, height: props.txSize * 0.4 }}
        >
          <Image
            image={getBlockTxIcon(
              props.chainId,
              props.txTypeId,
              props.isDapp,
              getImage,
            )}
            fit="contain"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={0}
            width={props.txSize * 0.4}
            height={props.txSize * 0.4}
          />
        </Canvas>
      </View>
    </Animated.View>
  );
});
