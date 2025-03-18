import "./global.css";

import { useState, useEffect } from "react";
import { View } from "react-native";

import { Header } from "./components/Header";

import { Upgrades } from "./types/Upgrade";
import { Block, newBlock } from "./types/Block";

import { SequencingPage } from "./pages/SequencingPage";
import { MiningPage } from "./pages/MiningPage";
import { StorePage } from "./pages/StorePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { SettingsPage } from "./pages/SettingsPage";

import { getGameState } from "./api/state";
import { mockAddress } from "./api/mock";

export default function Index() {
  const [upgrades, setUpgrades] = useState<Upgrades>({
    "Tx sorting": { cost: 10, effect: "sort transactions by fee", purchased: false },
    "Lower Block Difficulty": { cost: 20, effect: "make block easier to mine", purchased: false },
  });
  const baseDifficulty = 8;
  const [difficulty, setDifficulty] = useState(upgrades["Lower Block Difficulty"]?.purchased ? baseDifficulty - 1 : baseDifficulty);
  const [blockReward, setBlockReward] = useState(5);
  const [blockSize, setBlockSize] = useState(8*8);
  const [lastBlock, setLastBlock] = useState<Block | null>(null);
  const [currentBlock, setCurrentBlock] = useState(newBlock(0, blockReward, blockSize, difficulty));
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    const getNewGameState = async () => {
      const newGameState = await getGameState(mockAddress);
      if (!newGameState) return;
      setUserBalance(newGameState.balance);
      setLastBlock(newGameState.chains[0].lastBlock);
      setCurrentBlock(newGameState.chains[0].currentBlock);
    }
    getNewGameState();
  }, []);

  // Finalize Mined Block
  const finalizeBlock = () => {
    const finalizedBlock = { ...currentBlock };
    setLastBlock(finalizedBlock);
    setCurrentBlock(newBlock(finalizedBlock.id + 1, blockReward, blockSize, difficulty));
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
    lastBlock: lastBlock,
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
