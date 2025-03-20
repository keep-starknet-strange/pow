import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import ToggleButton from "../../components/buttons/Toggle";
import ResetTutorialButton from "./ResetTutorial";

import { useSound } from "../../context/Sound";

export type SettingsMainSectionProps = {
  setSettingTab: (tab: "About" | "Credits" | "Help") => void;
};

const SettingsMainSection: React.FC<SettingsMainSectionProps> = ({ setSettingTab }) => {
  const { isSoundOn, isMusicOn, toggleSound, toggleMusic } = useSound();
  const [notifs, setNotifs] = useState(true);

  const toggleNotifs = () => setNotifs(!notifs);

  const settingsComponents: { label: string; tab: "About" | "Credits" | "Help" | null }[] = [
    { label: "About 📖", tab: "About" },
    { label: "Credits 🎉", tab: "Credits" },
    { label: "Help ❓", tab: "Help" },
    { label: "Review 📝", tab: null },
    { label: "Logout 🚪", tab: null },
  ];

  return (
    <View className="flex flex-col gap-4 mt-4 w-full">

      <View className="flex flex-row justify-around mt-4 gap-4 w-full">
        <ToggleButton label="Sound" isOn={isSoundOn} onToggle={toggleSound} onSymbol="🔊" offSymbol="🔇" />
        <ToggleButton label="Music" isOn={isMusicOn} onToggle={toggleMusic} onSymbol="🔊" offSymbol="🔇" />
      </View>

      <ToggleButton label="Notifications" isOn={notifs} onToggle={toggleNotifs} onSymbol="🔔" offSymbol="🔕" />

      <ResetTutorialButton />

      {settingsComponents.map(({ label, tab }) => (
        <TouchableOpacity
          key={label}
          className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
          onPress={() => tab && setSettingTab(tab)} // Only navigate if there's a tab
        >
          <Text className="text-4xl">{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SettingsMainSection;
