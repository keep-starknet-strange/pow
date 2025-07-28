import React, { useEffect } from "react";
import { View } from "react-native";
import { useL2Store } from "@/app/stores/useL2Store";
import { L1Phase } from "./main/L1Phase";
import { L2Phase } from "./main/L2Phase";
import { MainBackground } from "../components/MainBackground";
import { L1L2Switch } from "../components/L1L2Switch";

export const MainPage: React.FC = () => {
  const { l2 } = useL2Store();

  const [currentView, setCurrentView] = React.useState<"L1" | "L2">(
    l2 ? "L2" : "L1",
  );
  useEffect(() => {
    setCurrentView(l2 ? "L2" : "L1");
  }, [l2]);

  return (
    <View className="flex-1 relative">
      <MainBackground />
      {l2 && (
        <L1L2Switch
          currentView={currentView}
          setCurrentView={(view: "L1" | "L2") => setCurrentView(view)}
        />
      )}
      {currentView === "L2" ? <L2Phase /> : <L1Phase />}
    </View>
  );
};

export default MainPage;
