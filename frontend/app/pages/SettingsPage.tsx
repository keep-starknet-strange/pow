import { useState } from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import background from "../../assets/background.png";

import AboutSection from "./settings/About";
import CreditsSection from "./settings/Credits";
import HelpSection from "./settings/Help";
import SettingsMainSection from "./settings/Main";
import { ClaimRewardSection } from "./settings/ClaimReward";

const tabs = {
  Main: SettingsMainSection,
  About: AboutSection,
  Credits: CreditsSection,
  Help: HelpSection,
  ClaimReward: ClaimRewardSection,
};

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof tabs>("Main");

  const ActiveComponent = tabs[activeTab];

  return (
    <ImageBackground
      className="flex-1 flex flex-col gap-2 pt-10 px-8"
      source={background}
      resizeMode="cover"
    >
      <ActiveComponent setSettingTab={setActiveTab} />
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
    </ImageBackground>
  );
};

export default SettingsPage;
