import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import AboutSection from "./settings/About";
import CreditsSection from "./settings/Credits";
import HelpSection from "./settings/Help";
import SettingsMainSection from "./settings/Main";
import { ClaimRewardSection } from "./settings/ClaimReward";
import MainBackground from "../components/MainBackground";

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

  const ActiveComponent = tabs[activeTab];

  return (
    <View className="flex-1 relative">
      <MainBackground />
      <View className="flex flex-col gap-2 px-8">
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
      </View>
    </View>
  );
};

export default SettingsPage;
