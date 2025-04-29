import "./global.css";

import { useState, useEffect } from "react";
import { View } from "react-native";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

import { MainPage } from "./pages/MainPage";
import { StorePage } from "./pages/StorePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StakingPage } from "./pages/StakingPage";

import { useEventManager } from "./context/EventManager";
import { useSound } from "./context/Sound";
import { useAchievement } from "./context/Achievements";
import { useGameState } from "./context/GameState";
import { AchievementObserver } from "./components/observer/AchievementObserver";
import { SoundObserver } from "./observers/SoundObserver";

export default function game() {
  const { registerObserver, unregisterObserver } = useEventManager();
  const { updateAchievement } = useAchievement();
  const { upgradableGameState } = useGameState();
  useEffect(() => {
    registerObserver(new AchievementObserver(updateAchievement));
  }, []);

  const { playSoundEffect } = useSound();
  const [soundObserver, setSoundObserver] = useState<null | number>(null);
  useEffect(() => {
    if (soundObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(soundObserver);
    }
    setSoundObserver(registerObserver(new SoundObserver(playSoundEffect)));
  }, [playSoundEffect]);

  const pages = [{
    name: "Main",
    component: MainPage
  },{
    name: "Store",
    component: StorePage
  }, {
    name: "Leaderboard",
    component: LeaderboardPage
  }, {
    name: "Achievements",
    component: AchievementsPage
  }, {
    name: "Settings",
    component: SettingsPage
  }, 
  ...(upgradableGameState.staking ? [{ name: "Staking", component: StakingPage }] : [])
];

  const [currentPage, setCurrentPage] = useState(pages[0]);
  const [currentBasePage, setCurrentBasePage] = useState(pages[0]);
  const basePages = ["Main", "Sequencing", "Mining"];
  const tabs = [{
    name: "Main",
    icon: "🎮"
  }, 
  ...(upgradableGameState.staking ?
   [{ 
    name: "Staking",
    icon: "🥩" }
    ] : []), {
    name: "Store",
    icon: "🛒"
  }, {
    name: "Leaderboard",
    icon: "🏆"
  }, {
    name: "Achievements",
    icon: "🎉"
  }, {
    name: "Settings",
    icon: "⚙️"
  }];
  const switchPage = (name: string) => {
    if (!basePages.includes(name) && basePages.includes(currentPage.name)) {
      setCurrentBasePage(currentPage);
    }
    setCurrentPage(pages.find(page => page.name === name) || pages[0]);
  }
  const closeTab = () => {
    setCurrentPage(currentBasePage);
  }

  const props = {
    switchPage: switchPage,
    closeTab: closeTab
  };

  return (
    <View className="flex-1 bg-[#171717] relative">
        <Header />
        <currentPage.component {...props} />
        <Footer {...props} tabs={tabs} />
    </View>
  );
}
