import blockDifficultyIcon from "../../assets/images/upgrades/blockDifficulty.png";
import blockSizeIcon from "../../assets/images/upgrades/blockSize.png";
import blockRewardIcon from "../../assets/images/upgrades/blockReward.png";
import mevBoostIcon from "../../assets/images/upgrades/mevBoost.png";
import recursiveProvingIcon from "../../assets/images/upgrades/recursiveProof.png";
import daCompressionIcon from "../../assets/images/upgrades/daCompression.png";
import baseMinerIcon from "../../assets/images/miners/baseMiner.png";
import cpuMinerIcon from "../../assets/images/miners/cpuMiner.png";
import gpuMinerIcon from "../../assets/images/miners/gpuMiner.png";
import asicMinerIcon from "../../assets/images/miners/asicMiner.png";
import antminerIcon from "../../assets/images/miners/antMiner.png";
import bitmainIcon from "../../assets/images/miners/bitmainMiner.png";
import quantumMinerIcon from "../../assets/images/miners/quantumMiner.png";
import decentralizedSeqIcon from "../../assets/images/upgrades/decentralized.png";
import baseSeqIcon from "../../assets/images/sequencers/base.png";
import improvedSeqIcon from "../../assets/images/sequencers/improved.png";
import cloudSeqIcon from "../../assets/images/sequencers/cloud.png";
import cairoNativeSeqIcon from "../../assets/images/sequencers/cairo.png";
import parallelizedSeqIcon from "../../assets/images/sequencers/parallel.png";
import optimisticProverIcon from "../../assets/images/provers/optimistic.png";
import zkSnarkProverIcon from "../../assets/images/provers/snark.png";
import zkStarkProverIcon from "../../assets/images/provers/stark.png";
import starkStoneProverIcon from "../../assets/images/provers/stone.png";
import starkStwoProverIcon from "../../assets/images/provers/stwo.png";
import calldataIcon from "../../assets/images/da/calldata.png";
import blobsIcon from "../../assets/images/da/blobs.png";
import compressionIcon from "../../assets/images/da/compression.png";
import dasIcon from "../../assets/images/da/das.png";
import volitionIcon from "../../assets/images/da/volition.png";

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

export const getAutomationIcons = (chainId: number) => {
  const automationIcons: any = {
    0: {
      Miner: {
        None: baseMinerIcon,
        CPU: cpuMinerIcon,
        GPU: gpuMinerIcon,
        ASIC: asicMinerIcon,
        Antminer: antminerIcon,
        Bitmain: bitmainIcon,
        Quantum: quantumMinerIcon,
      },
    },
    1: {
      Sequencer: {
        None: baseSeqIcon,
        Base: baseSeqIcon,
        Rust: improvedSeqIcon,
        Cloud: cloudSeqIcon,
        Cairo: cairoNativeSeqIcon,
        Parallel: parallelizedSeqIcon,
        Decentralized: decentralizedSeqIcon,
      },
      Prover: {
        None: optimisticProverIcon,
        Optimistic: optimisticProverIcon,
        SNARK: zkSnarkProverIcon,
        STARK: zkStarkProverIcon,
        Stone: starkStoneProverIcon,
        STWO: starkStwoProverIcon,
      },
      DA: {
        None: calldataIcon,
        Calldata: calldataIcon,
        Blobs: blobsIcon,
        Zip: compressionIcon,
        DAS: dasIcon,
        Volition: volitionIcon,
      },
    },
  };
  return automationIcons[chainId];
};
