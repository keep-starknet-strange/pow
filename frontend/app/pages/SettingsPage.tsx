import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import background from "../../assets/background.png";

import AboutSection from "./settings/About";
import CreditsSection from "./settings/Credits";
import HelpSection from "./settings/Help";
import SettingsMainSection from "./settings/Main";
import { ClaimRewardSection } from "./settings/ClaimReward";
import MainBackground from "../components/MainBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs = {
  Main: SettingsMainSection,
  About: AboutSection,
  Credits: CreditsSection,
  Help: HelpSection,
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

  return (
    <View className="flex-1 relative">
      <MainBackground />
      <ScrollView
        contentContainerStyle={{
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
          <TouchableOpacity
            onPress={() => {
              setActiveTab("Main");
            }}
            className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
          >
            <Text className="text-4xl">Back to Settings ⚙️</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default SettingsPage;
