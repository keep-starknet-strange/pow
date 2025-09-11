import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { FeatureUnlockView } from "../FeatureUnlockView";

export const PrestigeUnlock: React.FC = () => {
  const { prestige, getNextPrestigeCost, canPrestige } =
    useUpgrades();
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    if (!canPrestige) {
      setShowUnlock(false);
      return;
    }
    setShowUnlock(true);
  }, [canPrestige]);

  return (
    <View>
      {showUnlock && (
        <FeatureUnlockView
          label="Prestige"
          description="Reset and build bigger!"
          cost={getNextPrestigeCost()}
          onPress={() => prestige()}
        />
      )}
    </View>
  );
};
