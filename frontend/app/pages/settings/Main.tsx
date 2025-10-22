import { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BasicButton from "../../components/buttons/Basic";
import { ConfirmationModal } from "../../components/ConfirmationModal";

import { useSound } from "../../stores/useSoundStore";
import { useAnimations } from "../../stores/useAnimationsStore";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useFocEngine } from "@/app/context/FocEngineConnector";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { useTutorialStore } from "../../stores/useTutorialStore";
import { useGameStore } from "../../stores/useGameStore";
import { useBalanceStore } from "../../stores/useBalanceStore";
import { useTransactionsStore } from "../../stores/useTransactionsStore";
import { useTransactionPauseStore } from "../../stores/useTransactionPauseStore";
import { useL2Store } from "../../stores/useL2Store";
import { useAchievementsStore } from "../../stores/useAchievementsStore";
import { useUpgradesStore } from "../../stores/useUpgradesStore";
import { useOnchainActions } from "../../stores/useOnchainActions";

export type SettingsMainSectionProps = {
  setSettingTab: (
    tab: "Account" | "About" | "Credits" | "ClaimReward" | "TermsOfUse",
  ) => void;
  goBackToLogin: () => void;
};

const SettingsMainSection: React.FC<SettingsMainSectionProps> = ({
  setSettingTab,
  goBackToLogin,
}) => {
  const { navigate } = useNavigation();
  const {
    isSoundOn,
    isMusicOn,
    isHapticsOn,
    toggleSound,
    toggleMusic,
    toggleHaptics,
  } = useSound();
  const { animationLevel, setAnimationLevel } = useAnimations();
  const { disconnectAccount, clearPrivateKeys } = useStarknetConnector();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);
  const { user, disconnectUser } = useFocEngine();
  const isAuthenticated = user && user.account.username !== "";
  const { currentPrestige } = useUpgrades();
  const { resetTutorial } = useTutorialStore();
  const { clearQueue } = useOnchainActions();

  useEffect(() => {
    const loadClaimedState = async () => {
      try {
        const claimedTxHash = await AsyncStorage.getItem("rewardClaimedTxHash");
        console.log("claimedTxHash", claimedTxHash);
        setIsRewardClaimed(false); // TODO: Re-enable when we have claim setup
      } catch (error) {
        console.error("Error loading claimed state:", error);
      }
    };
    loadClaimedState();
  }, []);

  const handleResetGame = async () => {
    setShowResetConfirmation(false);

    // Reset all game stores first to clear in-memory state
    useGameStore.getState().resetGameStore();
    useBalanceStore.getState().resetBalance();
    useUpgradesStore.getState().resetUpgrades();
    useTransactionsStore.getState().resetTransactions();
    useTransactionPauseStore.getState().resetPauseStore();
    useL2Store.getState().resetL2Store();

    // Reset achievements with current account
    const currentAccount = user?.account_address || "default";
    await useAchievementsStore
      .getState()
      .resetAchievementsState(currentAccount);

    // Reset tutorial
    resetTutorial();

    // Clear any pending on-chain actions
    clearQueue();

    // Clear authentication and keys
    disconnectUser(); // Disconnect from FocEngine
    clearPrivateKeys("pow_game");
    disconnectAccount(); // Disconnect from Starknet

    // Navigate back to login after a short delay to ensure cleanup
    setTimeout(() => {
      goBackToLogin();
    }, 100);
  };

  const settingsComponents: {
    label: string;
    tab?: "Account" | "About" | "Credits" | "ClaimReward" | "TermsOfUse";
    onPress?: () => void;
    icon?: string;
  }[] = [
    {
      label: "Reset Game",
      onPress: () => setShowResetConfirmation(true),
    },
    { label: "Review", onPress: () => StoreReview.requestReview() },
    { label: "Account", tab: "Account" },
    { label: "About", tab: "About" },
    { label: "Claim Reward", tab: "ClaimReward" },
      // ...(isAuthenticated && currentPrestige >= 1 && !isRewardClaimed
      //   ? [{ label: "Claim Reward", tab: "ClaimReward" as const }]
      //   : []),
    {
      label: "Back",
      onPress: () =>
        isAuthenticated ? (navigate as any)("Main") : goBackToLogin(),
    },
  ];

  return (
    <>
      <Animated.View className="flex-1" entering={FadeInDown}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="grow gap-3 justify-center py-8"
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
            label={isHapticsOn ? "Haptics On" : "Haptics Off"}
            onPress={toggleHaptics}
          />
          <BasicButton
            label={`Anims ${animationLevel === "full" ? "Full" : animationLevel === "reduced" ? "Less" : "Off"}`}
            onPress={() => {
              const nextLevel =
                animationLevel === "full"
                  ? "reduced"
                  : animationLevel === "reduced"
                    ? "off"
                    : "full";
              setAnimationLevel(nextLevel);
            }}
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
        </ScrollView>
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
