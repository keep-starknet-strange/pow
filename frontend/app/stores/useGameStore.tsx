import { create } from "zustand";
import { Contract } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import { useBalanceStore } from "./useBalanceStore";
import { useChainsStore } from "./useChainsStore";
import { useEventManager } from "./useEventManager";
import { Transaction, Block, newBlock } from "../types/Chains"
import { L2, newL2, L2DA, newL2DA, L2Prover, newL2Prover } from "../types/L2";

interface GameStore {
  genesisBlockReward: number;
  workingBlocks: Block[];
  l2: L2 | undefined;

  resetGameStore: () => void;
  initializeGameStore: (powContract: Contract | null, user: FocAccount | null,
               getUserMaxChainId: () => Promise<number | undefined>,
               getUserBlockNumber: (chainId: number) => Promise<number | undefined>,
               getUserBlockState: (chainId: number) => Promise<{ size: number | undefined, fees: number | undefined } | undefined>
               ) => void;
  getWorkingBlock: (chainId: number) => Block | undefined;
  addTransaction: (chainId: number, transaction: Transaction) => void;

  canUnlockL2: () => boolean;
  initL2: () => void;
  getL2Cost: () => number;
  getL2: () => L2 | undefined;
  getDa: () => L2DA | undefined;
  getProver: () => L2Prover | undefined;

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
  addBlockToDa: (block: Block) => void;
  addBlockToProver: (block: Block) => void;
  onBlockMined: () => void;
  onBlockSequenced: () => void;
  onDaConfirmed: () => void;
  onProverConfirmed: () => void;

  getUpgradeValueDependency?: (chainId: number, upgradeName: string) => number;
  setGetUpgradeValueDependency: (
    getUpgradeValue: (chainId: number, upgradeName: string) => number,
  ) => void;
  initMyGameDependency?: () => void;
  setInitMyGameDependency: (initMyGame: () => void) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  genesisBlockReward: 1,
  workingBlocks: [],
  l2: undefined,
  getUpgradeValueDependency: undefined,
  setGetUpgradeValueDependency: (getUpgradeValue) =>
    set({ getUpgradeValueDependency: getUpgradeValue }),
  initMyGameDependency: undefined,
  setInitMyGameDependency: (initMyGame) =>
    set({ initMyGameDependency: initMyGame }),


  resetGameStore: () => {
    const initBlock = newBlock(0, get().genesisBlockReward);
    initBlock.isBuilt = true; // Mark the genesis block as built
    set({
      workingBlocks: [initBlock],
      l2: undefined,
    });
  },

  initializeGameStore: (powContract, user, getUserMaxChainId, getUserBlockNumber, getUserBlockState) => {
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
          const l1WorkingBlock: Block = {
            blockId: blockNumber,
            fees: blockFees || 0,
            transactions: Array.from({ length: blockSize || 0 }, () => ({
              typeId: 0,
              fee: 0,
              isDapp: false,
            })),
            isBuilt: false,
            reward: blockNumber === 0 ? get().genesisBlockReward : undefined,
          };
          if (maxChainId > 1) {
            // Setup l2 state
            const l2BlockNumber = (await getUserBlockNumber(1)) || 0;
            const { size: l2BlockSize, fees: l2BlockFees } =
              (await getUserBlockState(1)) || { size: 0, fees: 0 };
            const l2WorkingBlock: Block = {
              blockId: l2BlockNumber,
              fees: l2BlockFees || 0,
              transactions: Array.from({ length: l2BlockSize || 0 }, () => ({
                typeId: 0,
                fee: 0,
                isDapp: false,
              })),
              isBuilt: false,
              reward: l2BlockNumber === 0 ? get().genesisBlockReward : undefined,
            };
            const l2Instance: L2 = newL2();
            l2Instance.da = newL2DA();
            l2Instance.prover = newL2Prover();
            set({
              l2: l2Instance,
              workingBlocks: [l1WorkingBlock, l2WorkingBlock],
            });
          } else {
            set({
              workingBlocks: [l1WorkingBlock],
              l2: undefined,
            });
          }
        } catch (error) {
          console.error("Error fetching game state:", error);
          get().resetGameStore();
        }
      } else {
        get().resetGameStore();
      }
    }
    fetchGameState();
  },

  getWorkingBlock: (chainId) => {
    return get().workingBlocks[chainId] || null;
  },

  addTransaction: (chainId, transaction) => {
    const { getUpgradeValueDependency } = get();
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
      const maxBlockSize = getUpgradeValueDependency ? getUpgradeValueDependency(chainId, "Block Size") ** 2 : 4 ** 2;
      if (block.transactions.length >= maxBlockSize) {
        block.isBuilt = true;
        return { workingBlocks: newWorkingBlocks };
      }
      block.transactions.push(transaction);
      block.fees += transaction.fee;
      if (block.transactions.length >= maxBlockSize) {
        block.isBuilt = true;
      }
      useEventManager.getState().notify("TxAdded", { chainId, tx: transaction,
        progress: block.transactions.length / maxBlockSize });
      return { workingBlocks: newWorkingBlocks };
    });
  },

  canUnlockL2: () => {
    /* TODO: Include once switched to zustand
    if (!stakingUnlocked) {
      setCanPrestige(false);
      return;
    }
    */
    /*
    const automationlevels = automations[0];
    if (!automationlevels) {
      return false;
    }
    for (const level of Object.values(automationlevels)) {
      if (level < 0) {
        return false;
      }
    }
    const upgradeLevels = upgrades[0];
    if (!upgradeLevels) {
      return false;
    }
    for (const level of Object.values(upgradeLevels)) {
      if (level < 0) {
        return false;
      }
    }
    */
    /* TODO: Include once switched to zustand
    const dappLevels = dappFees[0];
    if (!dappLevels) {
      setCanUnlockL2(false);
      return;
    }
    const transactionLevels = transactionFees[0];
    if (!transactionLevels) {
      setCanUnlockL2(false);
      return;
    }
    */
    return true;
  },

  initL2: () => {
    const cost = get().getL2Cost();
    if (!useBalanceStore.getState().tryBuy(cost)) return;

    set((state) => {
      if (state.l2) return state;
      const newWorkingBlock = newBlock(0, get().genesisBlockReward);
      newWorkingBlock.isBuilt = true; // Mark the genesis block as built
      const newL2Instance = newL2();
      useChainsStore.getState().addChain();
      useEventManager.getState().notify("L2Purchased");
      return {
        workingBlocks: [...state.workingBlocks, newWorkingBlock],
        l2: newL2Instance,
      };
    });
  },

  getL2Cost: () => {
    const cost = 316274400; // TODO: Config
    return cost;
  },

  getL2: () => {
    return get().l2;
  },

  getDa: () => {
    return get().l2?.da;
  },

  getProver: () => {
    return get().l2?.prover;
  },

  addBlockToDa: (block) => {
    if (!get().l2) return;
    const { getUpgradeValueDependency } = get();
    set((state) => {
      if (!state.l2) return state;
      const newL2Instance = { ...state.l2 };
      if (!newL2Instance.da) return state;
      newL2Instance.da.blocks.push(block.blockId);
      const blockReward = block.reward || (getUpgradeValueDependency ? getUpgradeValueDependency(0, "Block Reward") : 1);
      newL2Instance.da.blockFees += blockReward;
      const daMaxSize = getUpgradeValueDependency ? getUpgradeValueDependency(0, "DA compression") : 1;
      newL2Instance.da.isBuilt = newL2Instance.da.blocks.length >= daMaxSize;
      return { l2: newL2Instance };
    });
  },

  addBlockToProver: (block) => {
    if (!get().l2) return;
    const { getUpgradeValueDependency } = get();
    set((state) => {
      if (!state.l2) return state;
      const newL2Instance = { ...state.l2 };
      if (!newL2Instance.prover) return state;
      newL2Instance.prover.blocks.push(block.blockId);
      const blockReward = block.reward || (getUpgradeValueDependency ? getUpgradeValueDependency(1, "Block Reward") : 1);
      newL2Instance.prover.blockFees += blockReward;
      const proverMaxSize = getUpgradeValueDependency ? getUpgradeValueDependency(1, "Prover compression") : 1;
      newL2Instance.prover.isBuilt = newL2Instance.prover.blocks.length >= proverMaxSize;
      return { l2: newL2Instance };
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
      completedBlock.reward || (getUpgradeValueDependency ? getUpgradeValueDependency(0, "Block Reward") : 1);
    completedBlock.reward = blockReward;
    set((state) => {
      const newWorkingBlocks = [...state.workingBlocks];
      const newBlockInstance = newBlock(completedBlock.blockId + 1);
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
      completedBlock.reward || (getUpgradeValueDependency ? getUpgradeValueDependency(1, "Block Reward") : 1);
    completedBlock.reward = blockReward;
    set((state) => {
      const newWorkingBlocks = [...state.workingBlocks];
      const newBlockInstance = newBlock(completedBlock.blockId + 1);
      newWorkingBlocks[1] = newBlockInstance;
      return { workingBlocks: newWorkingBlocks };
    });
    useEventManager.getState().notify("SequenceDone", { block: completedBlock });
    useBalanceStore.getState().updateBalance(blockReward + completedBlock.fees);
    get().addBlockToDa(completedBlock);
    get().addBlockToProver(completedBlock);
    useChainsStore.getState().addBlock(1, completedBlock);
  },

  onDaConfirmed: () => {
    set((state) => {
      if (!state.l2 || !state.l2.da) return state;
      useBalanceStore.getState().updateBalance(state.l2.da.blockFees);
      const newL2Instance = { ...state.l2 };
      newL2Instance.da = newL2DA();
      return { l2: newL2Instance };
    });
  },

  onProverConfirmed: () => {
    set((state) => {
      if (!state.l2 || !state.l2.prover) return state;
      useBalanceStore.getState().updateBalance(state.l2.prover.blockFees);
      const newL2Instance = { ...state.l2 };
      newL2Instance.prover = newL2Prover();
      return { l2: newL2Instance };
    });
  },
}));
