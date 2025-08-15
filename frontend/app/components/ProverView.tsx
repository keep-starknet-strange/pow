import { View } from "react-native";
import { L2ProgressView } from "./L2ProgressView";
import { useL2Store } from "@/app/stores/useL2Store";
import { useProver } from "../hooks/useProver";
import { Prover } from "./Prover";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useCompletionAnimation } from "../hooks/useCompletionAnimation";

export const ProverView = () => {
  const { getProver, onProverConfirmed } = useL2Store();
  const prover = getProver();

  const { localIsBuilt, animatedStyle } = useCompletionAnimation(
    prover?.isBuilt,
  );

  // Prover shake animation
  const proverShakeAnim = useSharedValue(0);
  const triggerProverShake = () => {
    proverShakeAnim.value = withSequence(
      withSpring(-2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(-2, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
      withSpring(0, { duration: 100, dampingRatio: 0.5, stiffness: 100 }),
    );
  };
  const proverShakeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${proverShakeAnim.value}deg` }],
  }));

  // Use prover hook with animation callback for automation
  const { prove } = useProver(
    onProverConfirmed,
    triggerProverShake,
  );

  return (
    <View>
      <L2ProgressView
        value={prover?.blocks.length || 0}
        maxValue={prover?.maxSize || 0}
        fees={prover?.blockFees || 0}
        label="Proving"
      />
      {localIsBuilt && (
        <Animated.View
          className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]"
          style={[animatedStyle, proverShakeStyle]}
        >
          <Prover
            triggerAnim={triggerProverShake}
            prove={prove}
          />
        </Animated.View>
      )}
    </View>
  );
};
