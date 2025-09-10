import React, { memo, useCallback, useState } from "react";
import { View } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { FeatureUnlockView } from "../FeatureUnlockView";
import { useGameStore } from "@/app/stores/useGameStore";
import { useBalanceStore } from "@/app/stores/useBalanceStore";
import { useEventManager } from "@/app/stores/useEventManager";
import { ConfirmationModal } from "../ConfirmationModal";
import { MaxPrestigeView } from "./MaxPrestigeView";
import prestigeConfig from "../../configs/prestige.json";

export type PrestigeUnlockProps = {
  disableMinimize?: boolean;
  marginHorizontal?: number;
};

export const PrestigeUnlock: React.FC<PrestigeUnlockProps> = memo((props) => {
  const { prestige, getNextPrestigeCost, canPrestige, currentPrestige } =
    useUpgrades();
  const { workingBlocks } = useGameStore();
  const { balance } = useBalanceStore();
  const { notify } = useEventManager();
  const miningBlock = workingBlocks[1];
  const [showPrestigeConfirmation, setShowPrestigeConfirmation] =
    useState(false);

  // Get the next prestige scaler value
  const nextPrestigeLevel = currentPrestige + 1;
  const nextPrestigeConfig = prestigeConfig.find(
    (p) => p.id === nextPrestigeLevel,
  );
  const prestigeScaler = nextPrestigeConfig?.scaler || 1;

  const handlePrestigePress = useCallback(() => {
    // Check if user has enough balance
    const cost = getNextPrestigeCost();
    if (balance < cost) {
      console.warn(
        `Not enough balance for prestige. Need ${cost}, have ${balance}`,
      );
      notify("InvalidPurchase");
      return;
    }
    setShowPrestigeConfirmation(true);
  }, [balance, getNextPrestigeCost, notify]);

  const handleConfirmPrestige = async () => {
    setShowPrestigeConfirmation(false);
    await prestige();
  };

  const showUnlock = canPrestige;

  return (
    <View>
      {showUnlock && (
        <>
          <FeatureUnlockView
            label="Prestige"
            description="Build bigger!"
            cost={getNextPrestigeCost()}
            onPress={handlePrestigePress}
            hidden={miningBlock?.isBuilt}
            disableMinimize={props.disableMinimize}
            marginHorizontal={props.marginHorizontal}
          />

          <ConfirmationModal
            visible={showPrestigeConfirmation}
            title="Ready to Prestige?"
            message={`All progress will be reset!\nHowever, you'll permanently boost fees by ${prestigeScaler}x.\n\nBuild bigger, faster!`}
            confirmLabel="Prestige"
            cancelLabel="Cancel"
            onConfirm={handleConfirmPrestige}
            onCancel={() => setShowPrestigeConfirmation(false)}
            dangerous={true}
          />
        </>
      )}
    </View>
  );
});
