import { create } from "zustand";
import { Contract } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import { useBalanceStore } from "./useBalanceStore";
import { useChainsStore } from "./useChainsStore";
import { useL2Store } from "./useL2Store";
import { useEventManager } from "./useEventManager";
import { Transaction, Block, newBlock } from "../types/Chains";

interface GameStore {
  genesisBlockReward: number;
  workingBlocks: Block[];

  resetGameStore: () => void;
  initializeGameStore: (
    powContract: Contract | null,
    user: FocAccount | null,
    getUserMaxChainId: () => Promise<number | undefined>,
    getUserBlockNumber: (chainId: number) => Promise<number | undefined>,
    getUserBlockState: (
      chainId: number,
    ) => Promise<
      { size: number | undefined; fees: number | undefined } | undefined
    >,
  ) => void;
  getWorkingBlock: (chainId: number) => Block | undefined;
  addTransaction: (chainId: number, transaction: Transaction) => void;
  initL2WorkingBlock: () => void;

  /*
   * TODO: Move from context ?
  miningProgress: number;
  mineBlock: () => void;
  sequencingProgress: number;
  sequenceBlock: () => void;
  daProgress: number;
  daConfirm: () => void;
  proverProgress: number;
  prove: () => void;
  */
  onBlockMined: () => void;
  onBlockSequenced: () => void;

  getUpgradeValueDependency?: (chainId: number, upgradeName: string) => number;
  setGetUpgradeValueDependency: (
    getUpgradeValue: (chainId: number, upgradeName: string) => number,
  ) => void;
  initMyGameDependency?: () => void;
  setInitMyGameDependency: (initMyGame: () => void) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  genesisBlockReward: 1,
  workingBlocks: [],
  getUpgradeValueDependency: undefined,
  setGetUpgradeValueDependency: (getUpgradeValue) =>
    set({ getUpgradeValueDependency: getUpgradeValue }),
  initMyGameDependency: undefined,
  setInitMyGameDependency: (initMyGame) =>
    set({ initMyGameDependency: initMyGame }),

  resetGameStore: () => {
    const { getUpgradeValueDependency } = get();
    const blockSizeUpgrade = getUpgradeValueDependency ? getUpgradeValueDependency(0, "Block Size") : 4;
    const maxBlockSize = blockSizeUpgrade ** 2;
    const initBlock = newBlock(0, maxBlockSize, get().genesisBlockReward);
    initBlock.isBuilt = true; // Mark the genesis block as built
    set({
      workingBlocks: [initBlock],
    });
  },

  initializeGameStore: (
    powContract,
    user,
    getUserMaxChainId,
    getUserBlockNumber,
    getUserBlockState,
  ) => {
    const fetchGameState = async () => {
      if (powContract && user) {
        try {
          // TODO: Use foc engine?
          const maxChainId = (await getUserMaxChainId()) || 0;
          // Setup l1 state
          const blockNumber = (await getUserBlockNumber(0)) || 0;
          if (blockNumber === 0) {
            get().resetGameStore();
            return;
          }
          const { size: blockSize, fees: blockFees } = (await getUserBlockState(
            0,
          )) || { size: 0, fees: 0 };
          const { getUpgradeValueDependency } = get();
          const blockSizeUpgrade = getUpgradeValueDependency ? getUpgradeValueDependency(0, "Block Size") : 4;
          const maxBlockSize = blockSizeUpgrade ** 2;
          const l1WorkingBlock: Block = {
            blockId: blockNumber,
            fees: blockFees || 0,
            transactions: Array.from({ length: blockSize || 0 }, () => ({
              typeId: 0,
              fee: 0,
              isDapp: false,
            })),
            isBuilt: false,
            maxSize: maxBlockSize,
            reward: blockNumber === 0 ? get().genesisBlockReward : undefined,
          };
          if (maxChainId > 1) {
            // Setup l2 state
            const l2BlockNumber = (await getUserBlockNumber(1)) || 0;
            const { size: l2BlockSize, fees: l2BlockFees } =
              (await getUserBlockState(1)) || { size: 0, fees: 0 };
            const l2BlockSizeUpgrade = getUpgradeValueDependency ? getUpgradeValueDependency(1, "Block Size") : 5;
            const l2MaxBlockSize = l2BlockSizeUpgrade ** 2;
            const l2WorkingBlock: Block = {
              blockId: l2BlockNumber,
              fees: l2BlockFees || 0,
              transactions: Array.from({ length: l2BlockSize || 0 }, () => ({
                typeId: 0,
                fee: 0,
                isDapp: false,
              })),
              isBuilt: false,
              maxSize: l2MaxBlockSize,
              reward: l2BlockNumber === 0 ? get().genesisBlockReward : undefined,
            };
            set({
              workingBlocks: [l1WorkingBlock, l2WorkingBlock],
            });
          } else {
            set({
              workingBlocks: [l1WorkingBlock],
            });
          }
        } catch (error) {
          console.error("Error fetching game state:", error);
          get().resetGameStore();
        }
      } else {
        get().resetGameStore();
      }
    };
    fetchGameState();
  },

  getWorkingBlock: (chainId) => {
    return get().workingBlocks[chainId] || null;
  },

  addTransaction: (chainId, transaction) => {
    const workingBlocks = get().workingBlocks;
    if (workingBlocks[chainId]?.isBuilt) {
      useEventManager.getState().notify("BlockFull");
      return;
    }
    set((state) => {
      const newWorkingBlocks = [...state.workingBlocks];
      if (!newWorkingBlocks[chainId]) {
        console.warn(`No working block found for chainId ${chainId}`);
        return { workingBlocks: newWorkingBlocks };
      }
      const block = newWorkingBlocks[chainId];
      const maxBlockSize = block.maxSize; // Use the block's static maxSize
      if (block.transactions.length >= maxBlockSize) {
        block.isBuilt = true;
        return { workingBlocks: newWorkingBlocks };
      }
      block.transactions.push(transaction);
      block.fees += transaction.fee;
      if (block.transactions.length >= maxBlockSize) {
        block.isBuilt = true;
      }
      newWorkingBlocks[chainId] = block;
      useEventManager.getState().notify("TxAdded", {
        chainId,
        tx: transaction,
        progress: block.transactions.length / maxBlockSize,
      });
      return { workingBlocks: newWorkingBlocks };
    });
  },

  initL2WorkingBlock: () => {
    const { getUpgradeValueDependency } = get();
    const blockSizeUpgrade = getUpgradeValueDependency ? getUpgradeValueDependency(1, "Block Size") : 5;
    const maxBlockSize = blockSizeUpgrade ** 2;
    const newWorkingBlock = newBlock(0, maxBlockSize, get().genesisBlockReward);
    newWorkingBlock.isBuilt = true; // Mark the genesis block as built
    set((state) => {
      return { workingBlocks: [...state.workingBlocks, newWorkingBlock] };
    });
  },

  onBlockMined: () => {
    const { getUpgradeValueDependency, initMyGameDependency } = get();
    const completedBlock = get().workingBlocks[0];
    if (completedBlock.blockId === 0) {
      if (initMyGameDependency) {
        initMyGameDependency();
      }
    }
    const blockReward =
      completedBlock.reward ||
      (getUpgradeValueDependency
        ? getUpgradeValueDependency(0, "Block Reward")
        : 1);
    completedBlock.reward = blockReward;
    set((state) => {
      const newWorkingBlocks = [...state.workingBlocks];
      const blockSizeUpgrade = getUpgradeValueDependency ? getUpgradeValueDependency(0, "Block Size") : 4;
      const maxBlockSize = blockSizeUpgrade ** 2;
      const newBlockInstance = newBlock(completedBlock.blockId + 1, maxBlockSize);
      newWorkingBlocks[0] = newBlockInstance;
      return { workingBlocks: newWorkingBlocks };
    });
    useEventManager.getState().notify("MineDone", { block: completedBlock });
    useBalanceStore.getState().updateBalance(blockReward + completedBlock.fees);
    useChainsStore.getState().addBlock(0, completedBlock);
  },

  onBlockSequenced: () => {
    const { getUpgradeValueDependency } = get();
    const completedBlock = get().workingBlocks[1];
    const blockReward =
      completedBlock.reward ||
      (getUpgradeValueDependency
        ? getUpgradeValueDependency(1, "Block Reward")
        : 1);
    completedBlock.reward = blockReward;
    set((state) => {
      const newWorkingBlocks = [...state.workingBlocks];
      const blockSizeUpgrade = getUpgradeValueDependency ? getUpgradeValueDependency(1, "Block Size") : 5;
      const maxBlockSize = blockSizeUpgrade ** 2;
      const newBlockInstance = newBlock(completedBlock.blockId + 1, maxBlockSize);
      newWorkingBlocks[1] = newBlockInstance;
      return { workingBlocks: newWorkingBlocks };
    });
    useEventManager
      .getState()
      .notify("SequenceDone", { block: completedBlock });
    useBalanceStore.getState().updateBalance(blockReward + completedBlock.fees);
    useL2Store.getState().addBlockToDa(completedBlock);
    useL2Store.getState().addBlockToProver(completedBlock);
    useChainsStore.getState().addBlock(1, completedBlock);
  },
}));
