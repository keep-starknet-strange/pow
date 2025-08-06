import React, { useEffect, memo, useCallback } from "react";
import { View } from "react-native";
import { useL2Store } from "@/app/stores/useL2Store";
import { L1Phase } from "./main/L1Phase";
import { L2Phase } from "./main/L2Phase";
import { MainBackground } from "../components/MainBackground";
import { L1L2Switch } from "../components/L1L2Switch";

export const MainPage: React.FC = memo(() => {
  const { isL2Unlocked } = useL2Store();

  const [currentView, setCurrentView] = React.useState<"L1" | "L2">(
    isL2Unlocked ? "L2" : "L1",
  );
  useEffect(() => {
    setCurrentView(isL2Unlocked ? "L2" : "L1");
  }, [isL2Unlocked]);

  return (
    <View className="flex-1 relative">
      <MainBackground />
      {isL2Unlocked && (
        <L1L2Switch
          currentView={currentView}
          setCurrentView={useCallback(
            (view: "L1" | "L2") => setCurrentView(view),
            [],
          )}
          isStore={false}
        />
      )}
      {currentView === "L2" ? <L2Phase /> : <L1Phase />}
    </View>
  );
});

export default MainPage;
