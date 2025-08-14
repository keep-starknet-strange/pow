import { useState } from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as StoreReview from "expo-store-review";

import BasicButton from "../../components/buttons/Basic";
import { ConfirmationModal } from "../../components/ConfirmationModal";

import { useSound } from "../../stores/useSoundStore";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useFocEngine } from "@/app/context/FocEngineConnector";
import { useUpgrades } from "../../stores/useUpgradesStore";

export type SettingsMainSectionProps = {
  setSettingTab: (
    tab: "About" | "Credits" | "ClaimReward" | "TermsOfUse",
  ) => void;
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
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const { user } = useFocEngine();
  const isAuthenticated = user && user.account.username !== "";
  const { currentPrestige } = useUpgrades();

  const toggleNotifs = () => setNotifs(!notifs);

  const handleResetGame = () => {
    setShowResetConfirmation(false);
    clearPrivateKeys("pow_game");
    disconnectAccount();
  };

  const settingsComponents: {
    label: string;
    tab?: "About" | "Credits" | "ClaimReward" | "TermsOfUse";
    onPress?: () => void;
    icon?: string;
  }[] = [
    {
      label: "Reset Game",
      onPress: () => setShowResetConfirmation(true),
    },
    { label: "Review", onPress: () => StoreReview.requestReview() },
    { label: "Terms of Use", tab: "TermsOfUse" },
    { label: "About", tab: "About" },
    { label: "Credits", tab: "Credits" },
    ...(currentPrestige >= 1
      ? [{ label: "Claim Reward", tab: "ClaimReward" as const }]
      : []),
    {
      label: "Back",
      onPress: () =>
        isAuthenticated ? (navigate as any)("Main") : goBackToLogin(),
    },
  ];

  return (
    <>
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

      <ConfirmationModal
        visible={showResetConfirmation}
        title="Reset Game Data?"
        message="This will permanently erase all your game progress, including blocks mined, upgrades purchased, and achievements earned. This action cannot be undone."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        onConfirm={handleResetGame}
        onCancel={() => setShowResetConfirmation(false)}
        dangerous={true}
      />
    </>
  );
};

export default SettingsMainSection;
