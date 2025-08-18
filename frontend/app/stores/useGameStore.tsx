import { create } from "zustand";
import { Contract } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import { useBalanceStore } from "./useBalanceStore";
import { useL2Store } from "./useL2Store";
import { useEventManager } from "./useEventManager";
import { useUpgradesStore } from "./useUpgradesStore";
import { Transaction, Block, newBlock } from "../types/Chains";

interface GameStore {
  genesisBlockReward: number;
  workingBlocks: Block[];
  blockHeights: Record<number, number>; // ChainId -> Block Height

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

  onBlockMined: () => void;
  onBlockSequenced: () => void;

  initMyGameDependency?: () => void;
  setInitMyGameDependency: (initMyGame: () => void) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  genesisBlockReward: 1,
  workingBlocks: [],
  blockHeights: {},
  initMyGameDependency: undefined,
  setInitMyGameDependency: (initMyGame) =>
    set({ initMyGameDependency: initMyGame }),

  resetGameStore: () => {
    const blockSizeUpgrade = useUpgradesStore
      .getState()
      .getUpgradeValue(0, "Block Size");
    const maxBlockSize = blockSizeUpgrade ** 2;
    const blockDifficulty = useUpgradesStore
      .getState()
      .getUpgradeValue(0, "Block Difficulty");
    const initBlock = newBlock(
      0,
      maxBlockSize,
      blockDifficulty,
      get().genesisBlockReward,
    );
    initBlock.isBuilt = true; // Mark the genesis block as built
    set({
      workingBlocks: [initBlock],
      blockHeights: { 0: initBlock.blockId },
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
          const blockSizeUpgrade = useUpgradesStore
            .getState()
            .getUpgradeValue(0, "Block Size");
          const maxBlockSize = blockSizeUpgrade ** 2;
          const blockDifficulty = useUpgradesStore
            .getState()
            .getUpgradeValue(0, "Block Difficulty");
          const l1WorkingBlock: Block = {
            blockId: blockNumber,
            fees: blockFees || 0,
            transactions: Array.from({ length: blockSize || 0 }, () => ({
              typeId: 0,
              fee: 0,
              isDapp: false,
            })),
            isBuilt: (blockSize || 0) >= maxBlockSize,
            maxSize: maxBlockSize,
            difficulty: blockDifficulty,
            reward: blockNumber === 0 ? get().genesisBlockReward : undefined,
          };
          if (maxChainId > 1) {
            // Setup l2 state
            const l2BlockNumber = (await getUserBlockNumber(1)) || 0;
            const { size: l2BlockSize, fees: l2BlockFees } =
              (await getUserBlockState(1)) || { size: 0, fees: 0 };
            const l2BlockSizeUpgrade = useUpgradesStore
              .getState()
              .getUpgradeValue(1, "Block Size");
            const l2MaxBlockSize = l2BlockSizeUpgrade ** 2;
            const l2BlockDifficulty = useUpgradesStore
              .getState()
              .getUpgradeValue(1, "Block Difficulty");
            const l2WorkingBlock: Block = {
              blockId: l2BlockNumber,
              fees: l2BlockFees || 0,
              transactions: Array.from({ length: l2BlockSize || 0 }, () => ({
                typeId: 0,
                fee: 0,
                isDapp: false,
              })),
              isBuilt: (l2BlockSize || 0) >= l2MaxBlockSize,
              maxSize: l2MaxBlockSize,
              difficulty: l2BlockDifficulty,
              reward:
                l2BlockNumber === 0 ? get().genesisBlockReward : undefined,
            };
            set({
              workingBlocks: [l1WorkingBlock, l2WorkingBlock],
              blockHeights: {
                0: l1WorkingBlock.blockId,
                1: l2WorkingBlock.blockId,
              },
            });
          } else {
            set({
              workingBlocks: [l1WorkingBlock],
              blockHeights: { 0: l1WorkingBlock.blockId },
            });
          }
        } catch (error) {
          if (__DEV__) console.error("Error fetching game state:", error);
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
        if (__DEV__)
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
    const blockSizeUpgrade = useUpgradesStore
      .getState()
      .getUpgradeValue(1, "Block Size");
    const maxBlockSize = blockSizeUpgrade ** 2;
    const blockDifficulty = useUpgradesStore
      .getState()
      .getUpgradeValue(1, "Block Difficulty");
    const newWorkingBlock = newBlock(
      0,
      maxBlockSize,
      blockDifficulty,
      get().genesisBlockReward,
    );
    newWorkingBlock.isBuilt = true; // Mark the genesis block as built
    set((state) => {
      return {
        workingBlocks: [...state.workingBlocks, newWorkingBlock],
        blockHeights: { ...state.blockHeights, 1: newWorkingBlock.blockId },
      };
    });
  },

  onBlockMined: () => {
    const { initMyGameDependency } = get();
    const completedBlock = get().workingBlocks[0];
    if (completedBlock.blockId === 0) {
      if (initMyGameDependency) {
        initMyGameDependency();
      }
    }
    const blockReward =
      completedBlock.reward ||
      useUpgradesStore.getState().getUpgradeValue(0, "Block Reward");
    completedBlock.reward = blockReward;
    set((state) => {
      const newWorkingBlocks = [...state.workingBlocks];
      const blockSizeUpgrade = useUpgradesStore
        .getState()
        .getUpgradeValue(0, "Block Size");
      const maxBlockSize = blockSizeUpgrade ** 2;
      const blockDifficulty = useUpgradesStore
        .getState()
        .getUpgradeValue(0, "Block Difficulty");
      const newBlockInstance = newBlock(
        completedBlock.blockId + 1,
        maxBlockSize,
        blockDifficulty,
      );
      newWorkingBlocks[0] = newBlockInstance;
      const newBlockHeights = { ...state.blockHeights };
      newBlockHeights[0] = newBlockInstance.blockId;
      return { workingBlocks: newWorkingBlocks, blockHeights: newBlockHeights };
    });
    useEventManager.getState().notify("MineDone", {
      block: completedBlock,
      ignoreAction: completedBlock.blockId === 0,
    });
    useBalanceStore.getState().updateBalance(blockReward + completedBlock.fees);
  },

  onBlockSequenced: () => {
    const completedBlock = get().workingBlocks[1];
    const blockReward =
      completedBlock.reward ||
      useUpgradesStore.getState().getUpgradeValue(1, "Block Reward");
    completedBlock.reward = blockReward;
    set((state) => {
      const newWorkingBlocks = [...state.workingBlocks];
      const blockSizeUpgrade = useUpgradesStore
        .getState()
        .getUpgradeValue(1, "Block Size");
      const maxBlockSize = blockSizeUpgrade ** 2;
      const blockDifficulty = useUpgradesStore
        .getState()
        .getUpgradeValue(1, "Block Difficulty");
      const newBlockInstance = newBlock(
        completedBlock.blockId + 1,
        maxBlockSize,
        blockDifficulty,
      );
      newWorkingBlocks[1] = newBlockInstance;
      const newBlockHeights = { ...state.blockHeights };
      newBlockHeights[1] = newBlockInstance.blockId;
      return { workingBlocks: newWorkingBlocks, blockHeights: newBlockHeights };
    });
    useEventManager.getState().notify("SequenceDone", {
      block: completedBlock,
      ignoreAction: completedBlock.blockId === 0,
    });
    useBalanceStore.getState().updateBalance(blockReward + completedBlock.fees);
    useL2Store.getState().addBlockToDa(completedBlock);
    useL2Store.getState().addBlockToProver(completedBlock);
  },
}));
