import { View } from "react-native";
import { UpgradeButton } from "./UpgradeButton";
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "@/app/stores/useTutorialStore";

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
  const { ref: feeRef, onLayout: onLayoutFee } = useTutorialLayout(
    "feeUpgradeButton" as TargetId,
  );
  const { ref: speedRef, onLayout: onLayoutSpeed } = useTutorialLayout(
    "speedUpgradeButton" as TargetId,
  );
  return locked ? (
    <UpgradeButton
      icon={"shop.btc"}
      label={`Unlock New Tx`}
      level={0}
      maxLevel={1}
      nextCost={nextCost}
      onPress={onBuyPress}
      bgImage={"shop.tx.buy"}
    />
  ) : (
    <View className="flex flex-col gap-1">
      {feeProps && (
        <View ref={feeRef} onLayout={onLayoutFee} className="">
          <UpgradeButton
            icon={"shop.btc"}
            label={`Upgrade Value`}
            level={feeProps.level}
            maxLevel={feeProps.maxLevel}
            nextCost={feeProps.nextCost}
            onPress={feeProps.onPress}
            bgImage={"shop.tx.buy"}
          />
        </View>
      )}
      {speedProps && (
        <View ref={speedRef} onLayout={onLayoutSpeed} className="">
          <UpgradeButton
            icon={"shop.clock"}
            label={`Upgrade Speed`}
            level={speedProps.level}
            maxLevel={speedProps.maxLevel}
            nextCost={speedProps.nextCost}
            onPress={speedProps.onPress}
            bgImage={"shop.tx.buy"}
          />
        </View>
      )}
    </View>
  );
};
