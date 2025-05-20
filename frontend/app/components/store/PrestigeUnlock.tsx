import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useUpgrades } from "../../context/Upgrades";
import { UnlockView } from "./UnlockView";
import prestigeIcon from "../../../assets/images/prestige/0.png";

export const PrestigeUnlock: React.FC = () => {
  const { prestige, getNextPrestigeCost } = useUpgrades();
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    setShowUnlock(true);
  }, []);

  return (
    <View>
      {showUnlock && (
        <UnlockView icon={prestigeIcon} name="Prestige" description="Reset and build bigger!" cost={getNextPrestigeCost()} onPress={() => prestige()}
          style={{ marginTop: 26, marginBottom: 0 }} />
      )}
    </View>
  );
}
