import React, { memo, useMemo, useState } from "react";
import { View } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { FeatureUnlockView } from "../FeatureUnlockView";
import { useGameStore } from "@/app/stores/useGameStore";
import { ConfirmationModal } from "../ConfirmationModal";
import { MaxPrestigeView } from "./MaxPrestigeView";
import prestigeConfig from "../../configs/prestige.json";

export type PrestigeUnlockProps = {
  disableMinimize?: boolean;
  marginHorizontal?: number;
};

export const PrestigeUnlock: React.FC<PrestigeUnlockProps> = memo((props) => {
  const {
    prestige,
    getNextPrestigeCost,
    canPrestige,
    currentPrestige,
    isMaxPrestige,
  } = useUpgrades();
  const { workingBlocks } = useGameStore();
  const miningBlock = workingBlocks[1];
  const [showPrestigeConfirmation, setShowPrestigeConfirmation] =
    useState(false);

  // Get the next prestige scaler value
  const nextPrestigeLevel = currentPrestige + 1;
  const nextPrestigeConfig = prestigeConfig.find(
    (p) => p.id === nextPrestigeLevel,
  );
  const prestigeScaler = nextPrestigeConfig?.scaler || 1;

  const handlePrestigePress = () => {
    setShowPrestigeConfirmation(true);
  };

  const handleConfirmPrestige = async () => {
    setShowPrestigeConfirmation(false);
    await prestige();
  };

  const showUnlock = canPrestige;

  // Show max prestige view if at max level
  if (isMaxPrestige()) {
    return (
      <MaxPrestigeView
        prestigeLevel={currentPrestige}
        marginHorizontal={props.marginHorizontal}
      />
    );
  }

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
