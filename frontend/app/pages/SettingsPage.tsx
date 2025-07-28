import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useIsFocused } from '@react-navigation/native';

import AboutSection from "./settings/About";
import CreditsSection from "./settings/Credits";
import SettingsMainSection from "./settings/Main";
import { ClaimRewardSection } from "./settings/ClaimReward";
import MainBackground from "../components/MainBackground";
import BasicButton from "../components/buttons/Basic";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs = {
  Main: SettingsMainSection,
  About: AboutSection,
  Credits: CreditsSection,
  ClaimReward: ClaimRewardSection,
};

type SettingsProps = {
  setLoginPage: ((page: string) => void) | null;
};

export const SettingsPage: React.FC<SettingsProps> = ({ setLoginPage }) => {
  const [activeTab, setActiveTab] = useState<keyof typeof tabs>("Main");
  const insets = useSafeAreaInsets();

  const ActiveComponent = tabs[activeTab];

  const isInLoginMode = setLoginPage !== null;

  const isFocused = useIsFocused();
  if (!isFocused) {
    return <View className="flex-1 bg-[#101119]"></View>; // Return empty view if not focused
  }

  console.log("Rendering SettingsPage with activeTab:", activeTab);
  return (
    <View className="flex-1 relative w-full h-full">
      <MainBackground />
      <View
        className="w-full h-full flex-1 items-center justify-center"
        style={{
          paddingTop: isInLoginMode ? insets.top + 32 : 32,
          paddingBottom: isInLoginMode ? insets.bottom + 32 : 32,
          paddingHorizontal: 32,
          gap: 8,
        }}
      >
        <ActiveComponent
          setSettingTab={setActiveTab}
          goBackToLogin={() => {
            setLoginPage?.("login");
          }}
        />
        {activeTab !== "Main" && (
          <Animated.View entering={FadeInDown}>
            <BasicButton
              label="Back"
              onPress={() => setActiveTab("Main")}
              style={{ marginTop: 32 }}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default SettingsPage;
