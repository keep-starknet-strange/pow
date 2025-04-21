import { Observer } from "../../context/EventManager";
import achievements from "../../configs/achievements.json";
import upgradesConfig from "../../configs/upgrades.json";
import { Upgrade } from "../../types/Upgrade";
import { Transaction } from "../../types/Transaction";
import { Block } from "../../types/Block";

type Achievement = typeof achievements[number];

export class AchievementObserver implements Observer {
  updateAchievement: (achievementId: number, progress: number) => void;
  achievementsByEvent: Map<string, Achievement[]>;
  completedAchievements: Set<number>;

  constructor(updateAchievement: (achievementId: number, progress: number) => void) {
    this.updateAchievement = (achievementId, progress) => {
      updateAchievement(achievementId, progress);
      if (progress >= 100) {
        this.completedAchievements.add(achievementId);
      }
    };
    this.achievementsByEvent = this.groupAchievementsByEvent();
    this.completedAchievements = new Set<number>();
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

  onNotify(eventName: string, data?: any): void {
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
        case "UpgradePurchased":
          this.handleUpgradePurchased(achievement, data.upgrade as Upgrade, data.allUpgrades);
          break;
        case "BlockFinalized":
          this.handleBlockFinalized(achievement, data.block as Block);
          break;
        case "TryMineBlock":
          this.handleTryMineBlock(achievement, data.isMined as boolean, data.mineCounter as number);
          break;
        default:
          break;
      }
    });
  }

  private handleTxAdded(achievement: Achievement, tx: Transaction) {
    if (achievement.name === "Get ₿100 from 1 TX" && tx.fee >= 100) {
      this.updateAchievement(achievement.id, 100);
    }
  }

  private handleBalanceUpdated(achievement: Achievement, balance: number) {
    const balanceTargets: Record<string, number> = {
      "Reach ₿500": 500,
      "Reach ₿10K": 10000,
      "Reach ₿10M": 10000000,
    };
    const target = balanceTargets[achievement.name];
    if (target) {
      const progress = Math.min((balance / target) * 100, 100);
      this.updateAchievement(achievement.id, progress);
    }
  }

  private handleUpgradePurchased(achievement: Achievement, upgrade: Upgrade, currentUpgrades: Record<number, Upgrade>) {
    if ("targetUpgradeId" in achievement && achievement.targetUpgradeId !== undefined) {
      const targetUpgrade = upgradesConfig.L1.find(u => u.id === achievement.targetUpgradeId);
      const currentUpgrade = currentUpgrades[achievement.targetUpgradeId];

      if (targetUpgrade?.costs.length && currentUpgrade?.level !== undefined) {
        const progress = Math.min((currentUpgrade.level / targetUpgrade.costs.length) * 100, 100);
        this.updateAchievement(achievement.id, progress);
      } else if (currentUpgrade) {
        this.updateAchievement(achievement.id, 100);
      }
    } else {
      switch (achievement.name) {
        case "Get an Antminer Rig":
          if (upgrade.name === "Antminer") {
            this.updateAchievement(achievement.id, 100);
          }
          break;
        case "Achieve SNARK Scaling":
          if (upgrade.name === "SNARK") {
            this.updateAchievement(achievement.id, 100);
          }
          break;
        case "Achieve STARK Scaling":
          if (upgrade.name === "STARK") {
            this.updateAchievement(achievement.id, 100);
          }
          break;
        case "Maxed out upgrades": {
          const progress = (upgradesConfig.L1.filter(cfg => {
            const upg = currentUpgrades[cfg.id];
            return cfg.costs.length ? upg?.level === cfg.costs.length : !!upg;
          }).length / upgradesConfig.L1.length) * 100;
          this.updateAchievement(achievement.id, progress);
          break;
        }
        case "Prestige!":
          if (upgrade.name === "Prestige") {
            this.updateAchievement(achievement.id, 100);
          }
          break;
        default:
          console.log("Unknown achievement", achievement.name);
      }
    }
  }

  private handleBlockFinalized(achievement: Achievement, block: Block) {
    const blockTargets: Record<string, number> = {
      "Reach Block 1000": 1000,
      "Reach Block 1M": 1_000_000,
      "Reach Block 1B": 1_000_000_000,
    };
    const target = blockTargets[achievement.name];
    if (target) {
      const progress = Math.min((block.id / target) * 100, 100);
      this.updateAchievement(achievement.id, progress);
    }
  }

  private handleTryMineBlock(achievement: Achievement, isMined: boolean, mineCounter: number) {
    if (achievement.name === "Mine a block first try" && isMined && mineCounter === 1) {
      this.updateAchievement(achievement.id, 100);
    }
  }
}
