import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as StoreReview from "expo-store-review";

import BasicButton from "../../components/buttons/Basic";

import { useSound } from "../../stores/useSoundStore";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useFocEngine } from "@/app/context/FocEngineConnector";

export type SettingsMainSectionProps = {
  setSettingTab: (tab: "About" | "Credits" | "Help" | "ClaimReward") => void;
  goBackToLogin: () => void;
};

const SettingsMainSection: React.FC<SettingsMainSectionProps> = ({
  setSettingTab,
  goBackToLogin,
}) => {
  const { navigate } = useNavigation();
  const { isSoundOn, isMusicOn, toggleSound, toggleMusic } = useSound();
  const { disconnectAccount, clearPrivateKeys, disconnectAndDeleteAccount } =
    useStarknetConnector();
  const [notifs, setNotifs] = useState(true);
  const { user } = useFocEngine();
  const isAuthenticated = user && user.account.username !== "";

  const toggleNotifs = () => setNotifs(!notifs);

  const settingsComponents: {
    label: string;
    tab?: "About" | "Credits" | "ClaimReward";
    onPress?: () => void;
    icon?: string;
  }[] = [
    { label: "About", tab: "About" },
    { label: "Credits", tab: "Credits" },
    { label: "Review", onPress: () => StoreReview.requestReview() },
    { label: "Claim Reward", tab: "ClaimReward" },
    {
      label: "Reset Game",
      onPress: () => {
        clearPrivateKeys("pow_game");
        disconnectAccount();
      },
    },
    {
      label: "Back",
      onPress: () => (isAuthenticated ? navigate("Main") : goBackToLogin()),
    },
  ];

  return (
    <Animated.View
      className="flex flex-col gap-3 h-full w-full justify-center items-center"
      entering={FadeInDown}
    >
      <BasicButton
        label={isSoundOn ? "Sound On" : "Sound Off"}
        onPress={toggleSound}
      />
      <BasicButton
        label={isMusicOn ? "Music On" : "Music Off"}
        onPress={toggleMusic}
      />
      <BasicButton
        label={notifs ? "Notifs On" : "Notifs Off"}
        onPress={toggleNotifs}
      />

      {settingsComponents.map(({ label, tab, onPress }) => (
        <BasicButton
          key={label}
          label={label}
          onPress={() => {
            if (tab) setSettingTab(tab);
            if (onPress) onPress();
          }}
        />
      ))}
    </Animated.View>
  );
};

export default SettingsMainSection;
