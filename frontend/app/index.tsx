import "./global.css";

import { useState } from "react";
import { View } from "react-native";

import { Header } from "./components/Header";

import { newBlock } from "./types/Block";

import { SequencingPage } from "./pages/SequencingPage";
import { MiningPage } from "./pages/MiningPage";
import { StorePage } from "./pages/StorePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function Index() {
  const blockReward = 5;
  const [currentBlock, setCurrentBlock] = useState(newBlock(0, blockReward));
  const [userBalance, setUserBalance] = useState(0);
  const [upgrades, setUpgrades] = useState([
    { name: "Tx sorting", cost: 10, effect: "sort transactions by fee", purchased: false },
    { name: "Lower Block Difficulty", cost: 20, effect: "make block easier to mine", purchased: false },
  ]);

  // Finalize Mined Block
  const finalizeBlock = () => {
    const finalizedBlock = { ...currentBlock };
    setCurrentBlock(newBlock(finalizedBlock.id + 1, blockReward));
    setUserBalance(userBalance + finalizedBlock.reward + finalizedBlock.fees);
    switchPage("Sequencing");
  };

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
    balance: userBalance,
    setBalance: setUserBalance,
    block: { ...currentBlock },
    setBlock: setCurrentBlock,
    finalizeBlock: finalizeBlock,
    switchPage: switchPage,
    closeHeaderTab: closeHeaderTab,
    upgrades: upgrades,
    setUpgrades: setUpgrades
  };

  return (
    <View className="flex-1 bg-[#171717]">
      <Header {...props} tabs={headerTabs} />
      <currentPage.component {...props} />
    </View>
  );
}
