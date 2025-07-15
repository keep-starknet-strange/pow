import blockDifficultyIcon from "../../assets/images/upgrades/blockDifficulty.png";
import blockSizeIcon from "../../assets/images/upgrades/blockSize.png";
import blockRewardIcon from "../../assets/images/upgrades/blockReward.png";
import mevBoostIcon from "../../assets/images/upgrades/mevBoost.png";
import recursiveProvingIcon from "../../assets/images/upgrades/recursiveProof.png";
import daCompressionIcon from "../../assets/images/upgrades/daCompression.png";

export const getUpgradeIcons = (chainId: number) => {
  const layerIcons: any = {
    0: {
      "Block Difficulty": blockDifficultyIcon,
      "Block Size": blockSizeIcon,
      "Block Reward": blockRewardIcon,
      "MEV Boost": mevBoostIcon,
    },
    1: {
      "L2 Finality": blockDifficultyIcon,
      "Block Size": blockSizeIcon,
      "Block Reward": blockRewardIcon,
      "MEV Boost": mevBoostIcon,
      "Recursive Proving": recursiveProvingIcon,
      "DA compression": daCompressionIcon,
    },
  };
  return layerIcons[chainId];
};

export const getAutomationIcon = (
  chainId: number,
  automationName: string,
  levelId: number,
) => {
  switch (automationName) {
    case "Miner":
      switch (levelId) {
        case -1:
          return "shop.lock";
        case 0:
          return "shop.automation.miner.0";
        case 1:
          return "shop.automation.miner.1";
        case 2:
          return "shop.automation.miner.2";
        case 3:
          return "shop.automation.miner.3";
        case 4:
          return "shop.automation.miner.4";
        case 5:
          return "shop.automation.miner.5";
        case 6:
          return "shop.automation.miner.6";
        default:
          return "unknown";
      }
    case "Sequencer":
      switch (levelId) {
        case -1:
          return "shop.lock";
        case 0:
          return "shop.automation.sequencer.0";
        case 1:
          return "shop.automation.sequencer.1";
        case 2:
          return "shop.automation.sequencer.2";
        case 3:
          return "shop.automation.sequencer.3";
        case 4:
          return "shop.automation.sequencer.4";
        case 5:
          return "shop.automation.sequencer.5";
        default:
          return "unknown";
      }
    case "DA":
      switch (levelId) {
        case -1:
          return "shop.lock";
        case 0:
          return "shop.automation.da.0";
        case 1:
          return "shop.automation.da.1";
        case 2:
          return "shop.automation.da.2";
        case 3:
          return "shop.automation.da.3";
        case 4:
          return "shop.automation.da.4";
        default:
          return "unknown";
      }
    case "Prover":
      switch (levelId) {
        case -1:
          return "shop.lock";
        case 0:
          return "shop.automation.prover.0";
        case 1:
          return "shop.automation.prover.1";
        case 2:
          return "shop.automation.prover.2";
        case 3:
          return "shop.automation.prover.3";
        case 4:
          return "shop.automation.prover.4";
        case 5:
          return "shop.automation.prover.5";
        default:
          return "unknown";
      }
    default:
      return "unknown";
  }
};
