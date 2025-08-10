import { memo, useMemo } from "react";
import { View, Text } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import Animated, { Easing } from "react-native-reanimated";
import { useImages } from "../hooks/useImages";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";
import { useUpgrades } from "../stores/useUpgradesStore";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import { useDerivedValue, withTiming } from "react-native-reanimated";

const ProgressBar = memo(({ progress }: { progress: number }) => {
  const { getImage } = useImages();
  const { width } = useCachedWindowDimensions();

  const progressAnim = useDerivedValue(() => {
    return withTiming((progress / 100) * 70, {
      duration: 500,
      easing: Easing.cubic,
    });
  }, [progress]);
  const progressAnimOffset = useDerivedValue(() => {
    return withTiming(70 - (progress / 100) * 70, {
      duration: 500,
      easing: Easing.cubic,
    });
  }, [progress]);

  return (
    <Canvas style={{ width: "100%", height: 70 }}>
      <Image
        image={getImage("l2.bars.bar")}
        fit="fill"
        x={0}
        y={progressAnimOffset}
        width={(width / 2 - (14 + (12 - 1) * 2)) / 12}
        height={progressAnim}
        sampling={{
          filter: FilterMode.Nearest,
          mipmap: MipmapMode.Nearest,
        }}
      />
    </Canvas>
  );
});

ProgressBar.displayName = 'ProgressBar';

const BackgroundCanvas = memo(() => {
  const { getImage } = useImages();
  const { width } = useCachedWindowDimensions();
  
  return (
    <Canvas style={{ width: "100%", height: 80 }}>
      <Image
        image={getImage("l2.bars.bg")}
        fit="fill"
        x={0}
        y={0}
        width={width / 2 - 6}
        height={80}
        sampling={{
          filter: FilterMode.Nearest,
          mipmap: MipmapMode.Nearest,
        }}
      />
    </Canvas>
  );
});

BackgroundCanvas.displayName = 'BackgroundCanvas';

const PlaqueCanvas = memo(() => {
  const { getImage } = useImages();
  
  return (
    <Canvas style={{ width: 60, height: 22 }}>
      <Image
        image={getImage("l2.bars.plaque")}
        fit="fill"
        x={0}
        y={0}
        width={60}
        height={22}
        sampling={{
          filter: FilterMode.Nearest,
          mipmap: MipmapMode.Nearest,
        }}
      />
    </Canvas>
  );
});

PlaqueCanvas.displayName = 'PlaqueCanvas';

const PlaqueDisplay = memo(({ value, maxValue }: { value: number; maxValue: number }) => {
  return (
    <View className="absolute top-0 left-0 h-[22px] w-[60px]">
      <PlaqueCanvas />
      <View className="absolute top-0 left-0 flex flex-row items-center justify-center w-full h-full">
        <AnimatedRollingNumber
          value={value}
          enableCompactNotation
          compactToFixed={2}
          textStyle={{
            fontSize: 16,
            color: "#b3b3b3",
            fontFamily: "Pixels",
          }}
          spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
        />
        <Text
          style={{
            fontSize: 16,
          }}
          className="text-[#b3b3b3] font-Pixels"
        >
          /{maxValue}
        </Text>
      </View>
    </View>
  );
});

PlaqueDisplay.displayName = 'PlaqueDisplay';

const CoinIcon = memo(() => {
  const { getImage } = useImages();
  
  return (
    <Canvas style={{ width: 16, height: 16 }}>
      <Image
        image={getImage("shop.btc")}
        fit="fill"
        x={2}
        y={1}
        width={13}
        height={13}
        sampling={{
          filter: FilterMode.Nearest,
          mipmap: MipmapMode.Nearest,
        }}
      />
    </Canvas>
  );
});

CoinIcon.displayName = 'CoinIcon';

const BottomInfo = memo(({ label, fees }: { label: string; fees: number }) => {
  return (
    <View className="flex flex-row items-center justify-between w-full">
      <Text className="text-[#b9b9b9] text-[16px] font-Pixels ml-[3px]">
        {label}
      </Text>
      <View className="flex flex-row items-center justify-end mr-[3px]">
        <AnimatedRollingNumber
          value={fees}
          enableCompactNotation
          compactToFixed={2}
          textStyle={{
            fontSize: 16,
            color: "#b3b3b3",
            fontFamily: "Pixels",
          }}
          spinningAnimationConfig={{ duration: 400, easing: Easing.bounce }}
        />
        <CoinIcon />
      </View>
    </View>
  );
});

BottomInfo.displayName = 'BottomInfo';

const ProgressBarsContainer = memo(({ progressBars }: { progressBars: number[] }) => {
  const { width } = useCachedWindowDimensions();
  
  return (
    <View className="absolute top-0 left-0 flex flex-row justify-start items-end h-[80px] px-[4px] gap-[2px] py-[5px]">
      {progressBars.map((progress: number, index: number) => (
        <Animated.View
          key={index}
          style={{ width: (width / 2 - (14 + (12 - 1) * 2)) / 12 }}
        >
          <ProgressBar progress={progress} />
        </Animated.View>
      ))}
    </View>
  );
});

ProgressBarsContainer.displayName = 'ProgressBarsContainer';

export const L2ProgressView = memo(({
  label,
  value,
  maxValue,
  fees,
}: {
  label: string;
  value: number;
  maxValue: number;
  fees: number;
}) => {
  const { width } = useCachedWindowDimensions();

  const maxBarCount = 12;
  
  const progressBars = useMemo(() => {
    const progress = (value / maxValue) * 100;
    const barCount = Math.floor((value / maxValue) * maxBarCount);
    const remainingProgress = progress - barCount * (100 / maxBarCount);
    const finalBarProgress = (remainingProgress / (100 / maxBarCount)) * 100;
    
    return Array(maxBarCount)
      .fill(0)
      .map((_, index) => {
        if (index < barCount) {
          return 100;
        } else if (index === barCount) {
          return finalBarProgress;
        } else {
          return 0;
        }
      });
  }, [value, maxValue]);

  const containerStyle = useMemo(() => ({
    width: width / 2 - 6,
    height: "100%",
  }), [width]);

  return (
    <View className="relative" style={containerStyle}>
      <View className="w-full relative">
        <BackgroundCanvas />
        <ProgressBarsContainer progressBars={progressBars} />
      </View>
      <BottomInfo label={label} fees={fees} />
      <PlaqueDisplay value={value} maxValue={maxValue} />
    </View>
  );
});

L2ProgressView.displayName = 'L2ProgressView';
