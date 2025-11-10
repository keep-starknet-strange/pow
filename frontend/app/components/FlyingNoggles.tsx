import React, { useEffect, memo } from "react";
import { View } from "react-native";
import {
  withTiming,
  Easing,
  useSharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
  Group,
} from "@shopify/react-native-skia";
import { useImages } from "../hooks/useImages";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
import { useAnimationConfig } from "../hooks/useAnimationConfig";

type NoggleConfig = {
  x: number;
  y: number;
  speed: number;
  size: number;
  angle: number;
};

const NOGGLE_COUNT = 24;
const NOGGLE_COLORS = [
  "blue",
  "green",
  "pink",
  "purple",
  "yellow",
  "red",
  "magenta",
  "orange",
  "teal",
  "honey",
  "watermelon",
  "black",
  "greyLight",
  "rgb",
];

const FlyingNoggle: React.FC<{
  noggle: NoggleConfig;
  image: any;
  shouldAnimate: boolean;
  width: number;
  height: number;
}> = memo(({ noggle, image, shouldAnimate, width, height }) => {
  const initialRotation = React.useMemo(() => Math.random() * Math.PI * 2, []);
  const x = useSharedValue(noggle.x);
  const y = useSharedValue(noggle.y);
  const angle = useSharedValue(noggle.angle);
  const rotation = useSharedValue(initialRotation);

  const centerX = noggle.size / 2;
  const centerY = noggle.size / 4;

  const transform = useDerivedValue(() => {
    return [
      { translateX: x.value + centerX },
      { translateY: y.value + centerY },
      { rotate: rotation.value },
      { translateX: -centerX },
      { translateY: -centerY },
    ];
  });

  useEffect(() => {
    if (!shouldAnimate) return;

    const animateNoggle = () => {
      const duration = 15000 / noggle.speed;
      const newAngle = angle.value + (Math.random() - 0.5) * 0.3;

      // Calculate new position with movement
      const moveDistance = Math.min(width, height) * 0.3;
      let newX = x.value + Math.cos(newAngle) * moveDistance;
      let newY = y.value + Math.sin(newAngle) * moveDistance;

      // Keep within bounds: -30 to width+30 (accounting for noggle size)
      const padding = 30;
      const minX = -padding;
      const maxX = width + padding - noggle.size;
      const minY = -padding;
      const maxY = height + padding - noggle.size / 2;

      // Clamp positions within bounds
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      x.value = withTiming(newX, {
        duration,
        easing: Easing.linear,
      });
      y.value = withTiming(newY, {
        duration,
        easing: Easing.linear,
      });
      angle.value = newAngle;
    };

    // Continuous rotation animation - full 360 degrees in 30 seconds
    rotation.value = withTiming(rotation.value + Math.PI * 2, {
      duration: 30000,
      easing: Easing.linear,
    });
    const rotationInterval = setInterval(() => {
      rotation.value = withTiming(rotation.value + Math.PI * 2, {
        duration: 30000,
        easing: Easing.linear,
      });
    }, 30000);

    animateNoggle();
    const positionInterval = setInterval(animateNoggle, 15000);

    return () => {
      clearInterval(positionInterval);
      clearInterval(rotationInterval);
    };
  }, [shouldAnimate, width, height]);

  if (!image) return null;

  return (
    <Group opacity={0.5} transform={transform}>
      <Image
        image={image}
        x={0}
        y={0}
        width={noggle.size}
        height={noggle.size / 2}
        fit="contain"
        sampling={{
          filter: FilterMode.Nearest,
          mipmap: MipmapMode.Nearest,
        }}
      />
    </Group>
  );
});

FlyingNoggle.displayName = "FlyingNoggle";

export const FlyingNoggles: React.FC = memo(() => {
  const { getImage } = useImages();
  const { width, height } = useCachedWindowDimensions();
  const { shouldAnimate } = useAnimationConfig();

  // Create noggle configs with better distribution
  const noggles: NoggleConfig[] = React.useMemo(() => {
    // Use grid-based distribution with randomization
    const cols = Math.ceil(Math.sqrt(NOGGLE_COUNT * (width / height)));
    const rows = Math.ceil(NOGGLE_COUNT / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    return Array.from({ length: NOGGLE_COUNT }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Place in cell with random offset within cell boundaries
      const baseX = col * cellWidth;
      const baseY = row * cellHeight;
      const offsetX = Math.random() * cellWidth;
      const offsetY = Math.random() * cellHeight;

      return {
        x: baseX + offsetX,
        y: baseY + offsetY,
        speed: 0.3 + Math.random() * 0.4,
        size: 160 + Math.random() * 120,
        angle: Math.random() * Math.PI * 2,
      };
    });
  }, [width, height]);

  // Get noggle images
  const noggleImages = React.useMemo(() => {
    return NOGGLE_COLORS.map((color) => getImage(`noggles.${color}`));
  }, [getImage]);

  return (
    <View
      className="absolute w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    >
      <Canvas style={{ flex: 1, width, height }}>
        {noggles.map((noggle, i) => {
          const colorIndex = i % NOGGLE_COLORS.length;
          return (
            <FlyingNoggle
              key={i}
              noggle={noggle}
              image={noggleImages[colorIndex]}
              shouldAnimate={shouldAnimate}
              width={width}
              height={height}
            />
          );
        })}
      </Canvas>
    </View>
  );
});

FlyingNoggles.displayName = "FlyingNoggles";

export default FlyingNoggles;
