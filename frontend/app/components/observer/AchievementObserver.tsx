import { Observer } from "../../context/EventManager";
import achievments from "../../configs/achievements.json";

import { Upgrade } from "../../types/Upgrade";
import { Transaction } from "../../types/Transaction";
import { Block } from "../../types/Block";

export class AchievementObserver implements Observer {
  updateAchievement: (achievementId: number, progress: number) => void;

  constructor(updateAchievement: (achievementId: number, progress: number) => void) {
    this.updateAchievement = updateAchievement;
  }

  onNotify(eventName: string, data?: any): void {
    switch (eventName) {
      case "TxAdded":
        if (data && data.tx) {
          const tx = data.tx as Transaction;
          const achievementsToCheck = achievments.filter(achievement =>
            achievement.updateOn === "TxAdded"
          );
          achievementsToCheck.forEach(achievement => {
            switch (achievement.name) {
              case "Get 100BTC from 1 TX":
                if (tx.fee >= 100) {
                  this.updateAchievement(achievement.id, 100);
                }
                break;
              default:
                console.log("AchievementObserver: Unknown achievement", achievement.name);
                break;
            }
          });
        }
        break;
      case "BalanceUpdated":
        if (data && data.balance) {
          const balance = data.balance as number;
          // TODO: Filter out completed achievements
          const achievementsToCheck = achievments.filter(achievement =>
            achievement.updateOn === "BalanceUpdated"
          );
          achievementsToCheck.forEach(achievement => {
            switch (achievement.name) {
              case "Reach 500 BTC":
                this.updateAchievement(achievement.id, balance >= 500 ? 100 : (balance / 500) * 100);
                break;
              case "Reach 10K BTC":
                this.updateAchievement(achievement.id, balance >= 10000 ? 100 : (balance / 10000) * 100);
                break;
              case "Reach 10M BTC":
                this.updateAchievement(achievement.id, balance >= 10000000 ? 100 : (balance / 10000000) * 100);
                break;
              default:
                console.log("AchievementObserver: Unknown achievement", achievement.name);
                break;
            }
          });
        }
        break;
      case "UpgradePurchased":
        if (data && data.upgrade) {
          const upgrade = data.upgrade as Upgrade;
          const achievementsToCheck = achievments.filter(achievement =>
            achievement.updateOn === "UpgradePurchased"
          );
          achievementsToCheck.forEach(achievement => {
            switch (achievement.name) {
              case "Get an Antminer Rig":
                if (upgrade.effect === "Antminer") {
                  this.updateAchievement(achievement.id, 100);
                }
                break;
              case "Achieve SNARK Scaling":
                if (upgrade.effect === "SNARK") {
                  this.updateAchievement(achievement.id, 100);
                }
                break;
              case "Achieve STARK Scaling":
                if (upgrade.effect === "STARK") {
                  this.updateAchievement(achievement.id, 100);
                }
                break;
              case "Prestige!":
                if (upgrade.effect === "Prestige") {
                  this.updateAchievement(achievement.id, 100);
                }
                break;
              default:
                console.log("AchievementObserver: Unknown achievement", achievement.name);
                break;
            }
          });
        }
        break;
      case "BlockMined":
        if (data && data.block) {
          const block = data.block as Block;
          const achievementsToCheck = achievments.filter(achievement =>
            achievement.updateOn === "BlockMined"
          );
          achievementsToCheck.forEach(achievement => {
            switch (achievement.name) {
              case "Reach Block 1000":
                this.updateAchievement(achievement.id, block.id >= 1000 ? 100 : (block.id / 1000) * 100);
                break;
              case "Reach Block 1M":
                this.updateAchievement(achievement.id, block.id >= 1000000 ? 100 : (block.id / 1000000) * 100);
                break;
              case "Reach Block 1B":
                this.updateAchievement(achievement.id, block.id >= 1000000000 ? 100 : (block.id / 1000000000) * 100);
                break;
              default:
                console.log("AchievementObserver: Unknown achievement", achievement.name);
                break;
            }
          });
        }
        break;
      case "TryMineBlock":
        if (data) {
          const isMined = data.isMined as boolean;
          const mineCounter = data.mineCounter as number;
          const achievementsToCheck = achievments.filter(achievement =>
            achievement.updateOn === "TryMineBlock"
          );
          achievementsToCheck.forEach(achievement => {
            switch (achievement.name) {
              case "Mine a block first try":
                if (isMined && mineCounter === 1) {
                  this.updateAchievement(achievement.id, 100);
                }
                break;
              default:
                console.log("AchievementObserver: Unknown achievement", achievement.name);
                break;
            }
          });
        }
        break;
      default:
        break;
    }
  }
}
