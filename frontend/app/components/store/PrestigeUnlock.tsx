import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { UnlockView } from "./UnlockView";

export const PrestigeUnlock: React.FC = () => {
  const { prestige, getNextPrestigeCost, canPrestige, currentPrestige } =
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
        <UnlockView
          icon={`prestige.${currentPrestige + 1}`}
          label="Prestige"
          description="Reset and build bigger!"
          cost={getNextPrestigeCost()}
          onPress={() => prestige()}
        />
      )}
    </View>
  );
};
