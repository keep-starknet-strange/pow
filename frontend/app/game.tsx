import "./global.css";

import { useState, useEffect } from "react";
import { View } from "react-native";

import { Header } from "./components/Header";

import { SequencingPage } from "./pages/SequencingPage";
import { MiningPage } from "./pages/MiningPage";
import { StorePage } from "./pages/StorePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { SettingsPage } from "./pages/SettingsPage";

import { useEventManager } from "./context/EventManager";
import { useAchievement } from "./context/Achievements";
import { useUpgrades } from "./context/Upgrades";
import { AchievementObserver } from "./components/observer/AchievementObserver";

export default function game() {
  const { upgrades } = useUpgrades();
  const { registerObserver } = useEventManager();
  const { updateAchievement } = useAchievement();
  useEffect(() => {
    registerObserver(new AchievementObserver(updateAchievement));
  }, []);

  const pages = [{
    name: "Sequencing",
    component: SequencingPage
  }, {
    name: "Mining",
    component: MiningPage
  }, {
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
  }];

  const [currentPage, setCurrentPage] = useState(pages[0]);
  const [currentBasePage, setCurrentBasePage] = useState(pages[0]);
  const basePages = ["Sequencing", "Mining"];
  const headerTabs = [{
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
  const closeHeaderTab = () => {
    setCurrentPage(currentBasePage);
  }

  const props = {
    switchPage: switchPage,
    closeHeaderTab: closeHeaderTab,
    upgrades: upgrades,
  };

  return (
    <View className="flex-1 bg-[#171717]">
        <Header {...props} tabs={headerTabs} />
        <currentPage.component {...props} />
    </View>
  );
}
