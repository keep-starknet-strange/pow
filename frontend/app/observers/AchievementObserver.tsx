import AsyncStorage from "@react-native-async-storage/async-storage";
import { Observer, EventType } from "@/app/stores/useEventManager";
import achievements from "../configs/achievements.json";
import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";
import upgradesJson from "../configs/upgrades.json";
import automationsJson from "../configs/automations.json";
import prestigeJson from "../configs/prestige.json";
import { Transaction, Block } from "../types/Chains";

type Achievement = (typeof achievements)[number];

export class AchievementObserver implements Observer {
  updateAchievement: (achievementId: number, progress: number) => void;
  achievementsByEvent: Map<string, Achievement[]>;
  completedAchievements: Set<number>;

  constructor(
    updateAchievement: (achievementId: number, progress: number) => void,
  ) {
    this.updateAchievement = (achievementId, progress) => {
      updateAchievement(achievementId, progress);
      if (progress >= 100) {
        this.completedAchievements.add(achievementId);
      }
    };
    this.achievementsByEvent = this.groupAchievementsByEvent();
    this.completedAchievements = new Set<number>();
    // Load completed achievements from local storage
    achievements.forEach((achievement) => {
      AsyncStorage.getItem(`achievement_${achievement.id}`)
        .then((value) => {
          if (value !== null) {
            const parsedProgress = parseInt(value, 10);
            if (parsedProgress >= 100) {
              this.completedAchievements.add(achievement.id);
            }
          }
        })
        .catch((error) => {
          console.error(
            "Error loading achievements from local storage:",
            error,
          );
        });
    });
  }

  private groupAchievementsByEvent(): Map<string, Achievement[]> {
    const map = new Map<string, Achievement[]>();
    achievements.forEach((achievement) => {
      if (!map.has(achievement.updateOn)) {
        map.set(achievement.updateOn, []);
      }
      map.get(achievement.updateOn)!.push(achievement);
    });
    return map;
  }

  async onNotify(eventName: EventType, data?: any): Promise<void> {
    const relevantAchievements = this.achievementsByEvent.get(eventName);
    if (!relevantAchievements || !data) return;

    relevantAchievements.forEach((achievement) => {
      if (this.completedAchievements.has(achievement.id)) return; // Skip completed achievements

      switch (eventName) {
        case "TxAdded":
          this.handleTxAdded(achievement, data.tx as Transaction);
          break;
        case "BalanceUpdated":
          this.handleBalanceUpdated(achievement, data.balance as number);
          break;
        case "MineDone":
          this.handleMineDone(achievement, data.block as Block);
          break;
        case "MineClicked":
          this.handleMineClicked(achievement, data);
          break;
        case "SequenceDone":
          this.handleSequenceDone(achievement, data.block as Block);
          break;
        case "TxUpgradePurchased":
          this.handleTxUpgradePurchased(achievement, data);
          break;
        case "UpgradePurchased":
          this.handleUpgradePurchased(achievement, data);
          break;
        case "AutomationPurchased":
          this.handleAutomationPurchased(achievement, data);
          break;
        case "StakingPurchased":
          this.handleStakingPurchased(achievement);
          break;
        case "L2Purchased":
          this.handleL2Purchased(achievement);
          break;
        case "PrestigePurchased":
          this.handlePrestigePurchased(achievement, data);
          break;
        default:
          break;
      }
    });
  }

  private handleTxAdded(achievement: Achievement, tx: Transaction) {
    if (achievement.name === "Get ₿100 in 1 Transaction" && tx.fee >= 100) {
      this.updateAchievement(achievement.id, 100);
    } else if (
      achievement.name === "Get ₿1K in 1 Transaction" &&
      tx.fee >= 1000
    ) {
      this.updateAchievement(achievement.id, 100);
    }
  }

  private handleBalanceUpdated(achievement: Achievement, balance: number) {
    const balanceTargets: Record<string, number> = {
      "Reach ₿100": 100,
      "Reach ₿10K": 10_000,
      "Reach ₿1M": 1_000_000,
      "Reach ₿100M": 100_000_000,
      "STRK Reward Unlocked": 1_000_000_000,
    };
    const target = balanceTargets[achievement.name];
    if (target) {
      const progress = Math.min((balance / target) * 100, 100);
      this.updateAchievement(achievement.id, progress);
    }
  }

  private handleMineDone(achievement: Achievement, block: Block) {
    const blockTargets: Record<string, number> = {
      "Reach L1 Block 10": 10,
      "Reach L1 Block 100": 100,
      "Reach L1 Block 1000": 1_000,
      "Reach L1 Block 10K": 10_000,
    };
    const target = blockTargets[achievement.name];
    if (target) {
      const progress = Math.min((block.blockId / target) * 100, 100);
      this.updateAchievement(achievement.id, progress);
    }
  }

  private handleMineClicked(achievement: Achievement, data: any) {
    const { counter, difficulty } = data;
    if (achievement.name === "Mine a block 1st try") {
      if (counter === 1 && counter >= difficulty) {
        this.updateAchievement(achievement.id, 100);
      }
    }
  }

  private handleSequenceDone(achievement: Achievement, block: Block) {
    const blockTargets: Record<string, number> = {
      "Reach L2 Block 10": 10,
      "Reach L2 Block 100": 100,
      "Reach L2 Block 1000": 1_000,
      "Reach L2 Block 10K": 10_000,
    };
    const target = blockTargets[achievement.name];
    if (target) {
      const progress = Math.min((block.blockId / target) * 100, 100);
      this.updateAchievement(achievement.id, progress);
    }
  }

  private handleTxUpgradePurchased(achievement: Achievement, data: any) {
    const { chainId, txId, isDapp, level } = data;
    // Map: achievement.name => [chainId, isDapp]
    const achievementFilter: Record<string, [number, boolean]> = {
      "Unlock all L1 Transactions": [0, false],
      "Unlock all L2 Transactions": [1, false],
      "Unlock all L1 Dapps": [0, true],
      "Unlock all L2 Dapps": [1, true],
    };
    const checkFilter = (name: string) => {
      const filter = achievementFilter[name];
      return filter ? filter[0] === chainId && filter[1] === isDapp : false;
    };
    if (!checkFilter(achievement.name)) return;

    if (isDapp) {
      const txConfigJson =
        chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
      const lastUnlockableTxId = txConfigJson[txConfigJson.length - 1].id + 1;
      // Update progress if new txId unlocked
      if (level === 0) {
        const progress = Math.min(((txId + 1) / lastUnlockableTxId) * 100, 100);
        this.updateAchievement(achievement.id, progress);
      }
    } else {
      const txConfigJson =
        chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
      const lastUnlockableTxId = txConfigJson[txConfigJson.length - 1].id + 1;
      // Update progress if new txId unlocked
      if (level === 0) {
        const progress = Math.min(((txId + 1) / lastUnlockableTxId) * 100, 100);
        this.updateAchievement(achievement.id, progress);
      }
    }
  }

  private handleUpgradePurchased(achievement: Achievement, data: any) {
    const { chainId, newUpgrades } = data;
    if (achievement.name === "Max All L1 Upgrades" && chainId === 1) return;
    if (achievement.name === "Max All L2 Upgrades" && chainId === 0) return;
    const upgradeConfigJson = chainId === 0 ? upgradesJson.L1 : upgradesJson.L2;
    const maxUpgradeLevelsCombined = Object.values(upgradeConfigJson).reduce(
      (acc, upgrade) => acc + upgrade.values.length,
      0,
    );
    const currentUpgrades = newUpgrades[chainId] as Record<number, number>;
    const currentLevelsCombined = Object.values(currentUpgrades).reduce(
      (acc, level) => acc + level + 1,
      0,
    );
    const progress = Math.min(
      (currentLevelsCombined / maxUpgradeLevelsCombined) * 100,
      100,
    );
    this.updateAchievement(achievement.id, progress);
  }

  private handleAutomationPurchased(achievement: Achievement, data: any) {
    // notify("AutomationPurchased", { chainId, automationId, level: newAutomations[chainId][automationId] });
    const { chainId, automationId, level } = data;
    const automationConfigJson =
      chainId === 0 ? automationsJson.L1 : automationsJson.L2;
    const automationName = automationConfigJson.find(
      (automation) => automation.id === automationId,
    )?.name;
    // Map: achievement.name => automationName
    const achievementFilter: Record<string, string> = {
      "Get a Quantum Miner": "Miner",
      "Decentralize the Sequencer": "Sequencer",
      "Achieve STWO Scaling": "Prover",
      "Scale with DA Volition": "DA",
    };
    const checkFilter = (name: string) => {
      const filter = achievementFilter[name];
      return filter ? filter === automationName : false;
    };
    if (!checkFilter(achievement.name)) return;

    const maxLevel = automationConfigJson.find(
      (automation) => automation.id === automationId,
    )?.levels.length;
    if (!maxLevel) return;
    const progress = Math.min(((level + 1) / maxLevel) * 100, 100);
    this.updateAchievement(achievement.id, progress);
  }

  private handleStakingPurchased(achievement: Achievement) {
    this.updateAchievement(achievement.id, 100);
  }

  private handleL2Purchased(achievement: Achievement) {
    this.updateAchievement(achievement.id, 100);
  }

  private handlePrestigePurchased(achievement: Achievement, data: any) {
    const { prestigeLevel } = data;
    if (achievement.name === "Prestige!") {
      this.updateAchievement(achievement.id, 100);
      return;
    } else if (achievement.name === "Reach Max Prestige") {
      const prestigeConfigJson = prestigeJson;
      const maxPrestigeLevel = prestigeConfigJson.length - 1;
      const progress = Math.min((prestigeLevel / maxPrestigeLevel) * 100, 100);
      this.updateAchievement(achievement.id, progress);
    }
  }
}
