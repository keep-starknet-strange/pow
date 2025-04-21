import blockDifficultyIcon from "../../assets/images/upgrades/blockDifficulty.png";
import blockSizeIcon from "../../assets/images/upgrades/blockSize.png";
import blockRewardIcon from "../../assets/images/upgrades/blockReward.png";
import mevBoostIcon from "../../assets/images/upgrades/mevBoost.png";
import recursiveProvingIcon from "../../assets/images/upgrades/recursiveProof.png";
import daCompressionIcon from "../../assets/images/upgrades/daCompression.png";
import cpuMinerIcon from "../../assets/images/upgrades/cpu.png";
import gpuMinerIcon from "../../assets/images/upgrades/gpu.png";
import asicMinerIcon from "../../assets/images/upgrades/asic.png";
import antminerIcon from "../../assets/images/upgrades/antMiner.png";
import bitmainIcon from "../../assets/images/upgrades/bitmain.png";
import quantumMinerIcon from "../../assets/images/upgrades/block.png";
import decentralizedSeqIcon from "../../assets/images/upgrades/decentralized.png";
import baseSeqIcon from "../../assets/images/upgrades/cpu.png";
import improvedSeqIcon from "../../assets/images/upgrades/gpu.png";
import cloudSeqIcon from "../../assets/images/upgrades/asic.png";
import cairoNativeSeqIcon from "../../assets/images/upgrades/antMiner.png";
import parallelizedSeqIcon from "../../assets/images/upgrades/bitmain.png";
import optimisticProverIcon from "../../assets/images/upgrades/cpu.png";
import zkSnarkProverIcon from "../../assets/images/upgrades/gpu.png";
import zkStarkProverIcon from "../../assets/images/upgrades/asic.png";
import starkStoneProverIcon from "../../assets/images/upgrades/antMiner.png";
import starkStwoProverIcon from "../../assets/images/upgrades/bitmain.png";
import calldataIcon from "../../assets/images/upgrades/cpu.png";
import blobsIcon from "../../assets/images/upgrades/gpu.png";
import compressionIcon from "../../assets/images/upgrades/asic.png";
import dasIcon from "../../assets/images/upgrades/antMiner.png";
import volitionIcon from "../../assets/images/upgrades/bitmain.png";

export const getUpgradeIcons = (chain: number) => {
  const layerIcons: any = {
    1: {
      "Block Difficulty": blockDifficultyIcon,
      "Block Size": blockSizeIcon,
      "Block Reward": blockRewardIcon,
      "MEV Boost": mevBoostIcon,
    },
    2: {
      "L2 Finality": blockDifficultyIcon,
      "Block Size": blockSizeIcon,
      "Block Reward": blockRewardIcon,
      "MEV Boost": mevBoostIcon,
      "Recursive Proving": recursiveProvingIcon,
      "DA compression": daCompressionIcon,
    },
  };
  return layerIcons[chain];
}

export const getAutomationIcons = (chain: number) => {
  const automationIcons: any = {
    1: {
      "Miner": {
        "CPU": cpuMinerIcon,
        "GPU": gpuMinerIcon,
        "ASIC": asicMinerIcon,
        "Antminer": antminerIcon,
        "Bitmain": bitmainIcon,
        "Quantum": quantumMinerIcon,
      }
    },
    2: {
      "Sequencer": {
        "Base": baseSeqIcon,
        "Improved": improvedSeqIcon,
        "Cloud": cloudSeqIcon,
        "Cairo-native": cairoNativeSeqIcon,
        "Parallelized": parallelizedSeqIcon,
        "Decentralized": decentralizedSeqIcon,
      },
      "Prover": {
        "Optimistic": optimisticProverIcon,
        "ZK SNARK": zkSnarkProverIcon,
        "ZK STARK": zkStarkProverIcon,
        "STARK Stone": starkStoneProverIcon,
        "STARK STWO": starkStwoProverIcon,
      },
      "DA": {
        "Calldata": calldataIcon,
        "Blobs": blobsIcon,
        "Compression": compressionIcon,
        "DAS": dasIcon,
        "Volition": volitionIcon,
      }
    }
  };
  return automationIcons[chain];
}
