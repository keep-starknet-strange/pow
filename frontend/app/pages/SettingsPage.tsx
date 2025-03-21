import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import AboutSection from "./settings/About";
import CreditsSection from "./settings/Credits";
import HelpSection from "./settings/Help";
import SettingsMainSection from "./settings/Main"; 

export type SettingsPageProps = {
  closeHeaderTab: () => void;
};


const tabs = {
  Main: SettingsMainSection,
  About: AboutSection,
  Credits: CreditsSection,
  Help: HelpSection,
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ closeHeaderTab }) => {
  const [activeTab, setActiveTab] = useState<keyof typeof tabs>("Main");

  const ActiveComponent = tabs[activeTab];

  return (
    <View className="flex-1 flex flex-col gap-2 mt-10 px-8">
      <ActiveComponent setSettingTab={setActiveTab} />
      {activeTab !== "Main" && (
        <TouchableOpacity
          onPress={() => {
            setActiveTab("Main");
          }}
          className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
        >
          <Text className="text-4xl">
            Back to Settings ⚙️
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SettingsPage;
