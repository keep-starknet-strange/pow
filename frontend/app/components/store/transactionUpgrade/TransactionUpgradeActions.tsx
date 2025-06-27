import { View } from "react-native";
import { UpgradeButton } from "./UpgradeButton";
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "@/app/context/Tutorial";
import { shortMoneyString } from "../../../utils/helpers";

type ActionsProps = {
  locked: boolean;
  nextCost: number;
  onBuyPress: () => void;
  feeProps?: {
    level: number;
    maxLevel: number;
    nextCost: number;
    onPress: () => void;
    icon: any;
    color: string;
  };
  speedProps?: {
    level: number;
    maxLevel: number;
    nextCost: number;
    onPress: () => void;
    icon: any;
    color: string;
  };
};

export const TransactionUpgradeActions: React.FC<ActionsProps> = ({
  locked,
  nextCost,
  onBuyPress,
  feeProps,
  speedProps,
}) => {
  // First transfer color
  const enabled =
    feeProps?.color == "#60f760f0" && speedProps?.color == "#60f760f0";
  const { ref: feeRef, onLayout: onLayoutFee } = useTutorialLayout(
    "feeUpgradeButton" as TargetId,
    enabled,
  );
  const { ref: speedRef, onLayout: onLayoutSpeed } = useTutorialLayout(
    "speedUpgradeButton" as TargetId,
    enabled,
  );
  return locked ? (
    <UpgradeButton
      label={`Unlock Transaction`}
      level={0}
      maxLevel={1}
      nextCost={nextCost}
      onPress={onBuyPress}
    />
  ) : (
    <View className="flex flex-col gap-1">
      {feeProps && (
        <View ref={feeRef} onLayout={onLayoutFee} className="">
          <UpgradeButton
            label={`Upgrade Value`}
            level={feeProps.level}
            maxLevel={feeProps.maxLevel}
            nextCost={feeProps.nextCost}
            onPress={feeProps.onPress}
          />
        </View>
      )}
      {speedProps && (
        <View ref={speedRef} onLayout={onLayoutSpeed} className="">
          <UpgradeButton
            label={`Upgrade Speed`}
            level={speedProps.level}
            maxLevel={speedProps.maxLevel}
            nextCost={speedProps.nextCost}
            onPress={speedProps.onPress}
          />
        </View>
      )}
    </View>
  );
};
