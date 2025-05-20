import "./global.css";

import { useState, useEffect } from "react";
import { View } from "react-native";

import { Header } from "./components/Header";
import { InAppNotification } from "./components/InAppNotification";
import { Footer } from "./components/Footer";
import { TutorialOverlay } from "./components/TutorialOverlay";

import { MainPage } from "./pages/MainPage";
import { StorePage } from "./pages/StorePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StakingPage } from "./pages/StakingPage";
import { LoginPage } from "./pages/LoginPage";

import { useEventManager } from "./context/EventManager";
import { useSound } from "./context/Sound";
import { useStarknetConnector } from "./context/StarknetConnector";
import { useGame } from "./context/Game";
import { useInAppNotifications } from "./context/InAppNotifications";
import { useAchievement } from "./context/Achievements";
import { useStaking } from "./context/Staking";
import { useTutorial } from "./context/Tutorial";
import { InAppNotificationsObserver } from "./observers/InAppNotificationsObserver";
import { AchievementObserver } from "./observers/AchievementObserver";
import { SoundObserver } from "./observers/SoundObserver";
import { TxBuilderObserver } from "./observers/TxBuilderObserver";

export default function game() {
  const { registerObserver, unregisterObserver } = useEventManager();
  const { account } = useStarknetConnector();
  const { stakingUnlocked } = useStaking();
  const { isTutorialActive } = useTutorial();

  const { sendInAppNotification } = useInAppNotifications();
  const [inAppNotificationObserver, setInAppNotificationObserver] = useState<null | number>(null);
  useEffect(() => {
    if (inAppNotificationObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(inAppNotificationObserver);
    }
    setInAppNotificationObserver(registerObserver(new InAppNotificationsObserver(sendInAppNotification)));
  }, [sendInAppNotification]);

  const { updateAchievement } = useAchievement();
  const [achievementObserver, setAchievementObserver] = useState<null | number>(null);
  useEffect(() => {
    if (achievementObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(achievementObserver);
    }
    setAchievementObserver(registerObserver(new AchievementObserver(updateAchievement)));
  }, [updateAchievement]);

  const { getWorkingBlock } = useGame();
  const { addToMultiCall } = useStarknetConnector();
  const [txBuilderObserver, setTxBuilderObserver] = useState<null | number>(null);
  useEffect(() => {
    if (txBuilderObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(txBuilderObserver);
    }
    setTxBuilderObserver(registerObserver(new TxBuilderObserver(addToMultiCall, getWorkingBlock)));
  }, [addToMultiCall, getWorkingBlock]);
  const { playSoundEffect } = useSound();
  const [soundObserver, setSoundObserver] = useState<null | number>(null);
  useEffect(() => {
    if (soundObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(soundObserver);
    }
    setSoundObserver(registerObserver(new SoundObserver(playSoundEffect)));
  }, [playSoundEffect]);

  const tabs = [{
    name: "Main",
    icon: "🎮",
    component: MainPage
  },
  ...(stakingUnlocked ? [{
    name: "Staking",
    icon: "🥩",
    component: StakingPage
  }] : []),
  {
    name: "Store",
    icon: "🛒",
    component: StorePage
  }, {
    name: "Leaderboard",
    icon: "🏆",
    component: LeaderboardPage
  }, {
    name: "Achievements",
    icon: "🎉",
    component: AchievementsPage
  }, {
    name: "Settings",
    icon: "⚙️",
    component: SettingsPage
  }];
  const [currentPage, setCurrentPage] = useState(tabs[0]);
  const switchPage = (name: string) => {
    if (!tabs.some(tab => tab.name === name)) {
      console.warn(`Tab with name "${name}" does not exist.`);
      return;
    }
    setCurrentPage(tabs.find(tab => tab.name === name) || currentPage);
  }

  return (
    <View className="flex-1 bg-[#010a12ff] relative">
        {account ? (
          <View className="flex-1">
            { isTutorialActive && <TutorialOverlay/> }
            <Header />
            <InAppNotification />
            <currentPage.component/>
            <Footer tabs={tabs} switchPage={switchPage} />
          </View>
        ) : (
          <View className="flex-1">
            <LoginPage />
          </View>
        )}
    </View>
  );
}
