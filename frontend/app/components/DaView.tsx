/* eslint-disable react-hooks/react-compiler */
import { View } from "react-native";
import { useL2Store } from "@/app/stores/useL2Store";
import { useDAConfirmer } from "../hooks/useDAConfirmer";
import { L2ProgressView } from "./L2ProgressView";
import { DAConfirm } from "./DAConfirm";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useCompletionAnimation } from "../hooks/useCompletionAnimation";

export const DaView = () => {
  const { getDa, onDaConfirmed } = useL2Store();
  const da = getDa();

  const { localIsBuilt, animatedStyle } = useCompletionAnimation(da?.isBuilt);

  // DA shake animation
  const daShakeAnim = useSharedValue(0);
  const triggerDAShake = () => {
    daShakeAnim.value = withSequence(
      withSpring(-2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(-2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(0, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
    );
  };
  const daShakeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${daShakeAnim.value}deg` }],
  }));

  // Use DA hook with animation callback for automation
  const { daProgress, daConfirm } = useDAConfirmer(
    onDaConfirmed,
    triggerDAShake,
  );

  return (
    <View>
      <L2ProgressView
        value={da?.blocks.length || 0}
        maxValue={da?.maxSize || 1}
        fees={da?.blockFees || 0}
        label="Data"
      />
      {localIsBuilt && (
        <Animated.View
          className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]"
          style={[animatedStyle, daShakeStyle]}
        >
          <DAConfirm
            triggerAnim={triggerDAShake}
            daProgress={daProgress}
            daConfirm={daConfirm}
          />
        </Animated.View>
      )}
    </View>
  );
};
