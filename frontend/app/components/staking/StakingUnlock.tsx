import { View } from "react-native";
import { UnlockView } from "../store/UnlockView";

export type StakingUnlockProps = {
  alwaysShow?: boolean;
};

export const StakingUnlock: React.FC<StakingUnlockProps> = ({ alwaysShow }) => {
  return (
    <View>
      <UnlockView
        icon={"logo.starknet"}
        label="Unlock Staking"
        description="participate in governance."
        cost={42069}
        onPress={() => {
          console.log("med rare steak");
        }}
      />
    </View>
  );
};
