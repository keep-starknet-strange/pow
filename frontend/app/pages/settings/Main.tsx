import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import ToggleButton from "../../components/buttons/Toggle";
import BasicButton from "../../components/buttons/Basic";
import ResetTutorialButton from "./ResetTutorial";

import { useSound } from "../../stores/useSoundStore";
import { useStarknetConnector } from "../../context/StarknetConnector";

export type SettingsMainSectionProps = {
  setSettingTab: (tab: "About" | "Credits" | "Help" | "ClaimReward") => void;
};

const SettingsMainSection: React.FC<SettingsMainSectionProps> = ({
  setSettingTab,
}) => {
  const { isSoundOn, isMusicOn, toggleSound, toggleMusic } = useSound();
  const { disconnectAccount, clearPrivateKeys, disconnectAndDeleteAccount } =
    useStarknetConnector();
  const [notifs, setNotifs] = useState(true);

  const toggleNotifs = () => setNotifs(!notifs);

  const settingsComponents: {
    label: string;
    tab?: "About" | "Credits" | "Help" | "ClaimReward";
    onPress?: () => void;
    icon?: string;
  }[] = [
    { label: "About", tab: "About", icon: "📖" },
    { label: "Credits", tab: "Credits", icon: "🎉" },
    { label: "Help", tab: "Help", icon: "❓" },
    { label: "Review", icon: "📝" },
    { label: "Claim Reward", tab: "ClaimReward", icon: "🎁" },
    { label: "Reset Account", onPress: disconnectAndDeleteAccount, icon: "🔄" },
    {
      label: "Reset All",
      onPress: () => clearPrivateKeys("pow_game"),
      icon: "🗑️",
    },
    { label: "Logout", onPress: disconnectAccount, icon: "🚪" },
  ];

  return (
    <View className="flex flex-col gap-2 mt-4 w-full justify-center">
      <View className="flex flex-row justify-around gap-4 w-full">
        <ToggleButton
          label="Sound"
          isOn={isSoundOn}
          onToggle={toggleSound}
          onSymbol="🔊"
          offSymbol="🔇"
          style={{ flex: 1 }}
        />
        <ToggleButton
          label="Music"
          isOn={isMusicOn}
          onToggle={toggleMusic}
          onSymbol="🔊"
          offSymbol="🔇"
          style={{ flex: 1 }}
        />
      </View>

      <ToggleButton
        label="Notifications"
        isOn={notifs}
        onToggle={toggleNotifs}
        onSymbol="🔔"
        offSymbol="🔕"
      />
      <ResetTutorialButton />

      {settingsComponents.map(({ label, tab, onPress, icon }) => (
        <BasicButton
          key={label}
          label={label}
          icon={icon}
          onPress={() => {
            if (tab) setSettingTab(tab);
            if (onPress) onPress();
          }}
        />
      ))}
    </View>
  );
};

export default SettingsMainSection;
