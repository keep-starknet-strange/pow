import React from "react";
import { View, StyleSheet } from "react-native";
import { ClaimRewardAction } from "./ClaimRewardAction";

type Props = {
  onPressReady: () => void;
  onPressBraavos: () => void;
};

export const WalletButtonRow: React.FC<Props> = ({
  onPressReady,
  onPressBraavos,
}) => {
  return (
    <View style={styles.buttonRow}>
      <ClaimRewardAction
        action={onPressReady}
        label="READY"
        style={styles.equalButton}
      />
      <ClaimRewardAction
        action={onPressBraavos}
        label="BRAAVOS"
        style={styles.equalButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    columnGap: 16,
    marginBottom: 12,
  },
  equalButton: {
    flex: 1,
  },
});
