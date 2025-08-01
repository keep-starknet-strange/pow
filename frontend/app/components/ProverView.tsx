import { View } from "react-native";
import { L2ProgressView } from "./L2ProgressView";
import { useL2Store } from "@/app/stores/useL2Store";
import { Prover } from "./Prover";
import Animated from "react-native-reanimated";
import { useCompletionAnimation } from "../hooks/useCompletionAnimation";

export const ProverView = () => {
  const { getProver } = useL2Store();
  const prover = getProver();

  const { localIsBuilt, animatedStyle } = useCompletionAnimation(
    prover?.isBuilt,
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
          style={animatedStyle}
        >
          <Prover />
        </Animated.View>
      )}
    </View>
  );
};
