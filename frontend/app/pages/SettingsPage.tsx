import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";

import AboutSection from "./settings/About";
import AccountSection from "./settings/Account";
import CreditsSection from "./settings/Credits";
import SettingsMainSection from "./settings/Main";
import { ClaimRewardSection } from "./settings/ClaimReward";
import TermsOfUse from "./settings/TermsOfUse";
import MainBackground from "../components/MainBackground";
import BasicButton from "../components/buttons/Basic";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs = {
  Main: SettingsMainSection,
  Account: AccountSection,
  About: AboutSection,
  Credits: CreditsSection,
  ClaimReward: ClaimRewardSection,
  TermsOfUse: TermsOfUse,
};

type SettingsProps = {
  setLoginPage: ((page: string) => void) | null;
  initialTab?: string;
};

export const SettingsPage: React.FC<SettingsProps> = ({
  setLoginPage,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<keyof typeof tabs>(
    (initialTab as keyof typeof tabs) || "Main",
  );
  const insets = useSafeAreaInsets();

  const ActiveComponent = tabs[activeTab];

  const isInLoginMode = setLoginPage !== null;

  const isFocused = useIsFocused();
  if (!isFocused) {
    return <View className="flex-1 bg-[#101119]"></View>; // Return empty view if not focused
  }

  return (
    <View className="flex-1 relative w-full h-full">
      <MainBackground />
      <View
        className="w-full h-full flex-1 items-center justify-center"
        style={{
          paddingTop: isInLoginMode ? insets.top : 0,
          paddingBottom: isInLoginMode ? insets.bottom : 0,
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
              onPress={() => {
                // If we're in login mode and came from login page, go back to login
                if (isInLoginMode && initialTab === "About") {
                  setLoginPage?.("login");
                } else {
                  setActiveTab("Main");
                }
              }}
              style={{ marginVertical: 16 }}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default SettingsPage;
