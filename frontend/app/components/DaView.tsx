import { View } from "react-native";
import { useL2Store } from "@/app/stores/useL2Store";
import { L2ProgressView } from "./L2ProgressView";
import { DAConfirm } from "./DAConfirm";

export const DaView = () => {
  const { getDa } = useL2Store();
  const da = getDa();

  return (
    <View>
      <L2ProgressView
        value={da?.blocks.length || 0}
        maxValue={da?.maxSize || 1}
        fees={da?.blockFees || 0}
        label="Data"
      />
      {da?.isBuilt && (
        <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
          <DAConfirm />
        </View>
      )}
    </View>
  );
};
