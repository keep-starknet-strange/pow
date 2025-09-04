import { create } from "zustand";
import { Contract } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import { useBalanceStore } from "./useBalanceStore";
import { useGameStore } from "./useGameStore";
import { useEventManager } from "./useEventManager";
import { useUpgradesStore } from "./useUpgradesStore";
import { useTransactionsStore } from "./useTransactionsStore";
import { Transaction, Block, newBlock } from "../types/Chains";
import { L2, newL2, L2DA, newL2DA, L2Prover, newL2Prover } from "../types/L2";
import unlocksConfig from "../configs/unlocks.json";

interface L2Store {
  l2: L2 | undefined;
  isL2Unlocked: boolean;
  isInitialized: boolean;

  resetL2Store: () => void;
  initializeL2Store: (
    powContract: Contract | null,
    user: FocAccount | null,
    getUserMaxChainId: () => Promise<number | undefined>,
    getUserProofBuildingState: (chainId: number) => Promise<
      | {
          size: number | undefined;
          fees: number | undefined;
          max_size: number | undefined;
          difficulty: number | undefined;
        }
      | undefined
    >,
    getUserDABuildingState: (chainId: number) => Promise<
      | {
          size: number | undefined;
          fees: number | undefined;
          max_size: number | undefined;
          difficulty: number | undefined;
        }
      | undefined
    >,
  ) => void;

  canUnlockL2: () => boolean;
  initL2: () => void;
  getL2Cost: () => number;
  getL2: () => L2 | undefined;
  getDa: () => L2DA | undefined;
  getProver: () => L2Prover | undefined;

  addBlockToDa: (block: Block) => void;
  addBlockToProver: (block: Block) => void;

  onDaConfirmed: () => void;
  onProverConfirmed: () => void;
}

export const useL2Store = create<L2Store>((set, get) => ({
  l2: undefined,
  isL2Unlocked: false,
  isInitialized: false,

  resetL2Store: () => set({ l2: undefined, isL2Unlocked: false }),
  initializeL2Store: (
    powContract,
    user,
    getUserMaxChainId,
    getUserProofBuildingState,
    getUserDABuildingState,
  ) => {
    const fetchL2Store = async () => {
      if (powContract && user) {
        try {
          const maxChainId = (await getUserMaxChainId()) || 0;
          if (maxChainId < 2) {
            return;
          }
          // Get proof and DA building states from the contract
          const {
            size: proofSize,
            fees: proofFees,
            max_size: proofMaxSize,
            difficulty: proofDifficulty,
          } = (await getUserProofBuildingState(1)) || {
            size: 0,
            fees: 0,
            max_size: 0,
            difficulty: 0,
          };
          const {
            size: daSize,
            fees: daFees,
            max_size: daMaxSize,
            difficulty: daDifficulty,
          } = (await getUserDABuildingState(1)) || {
            size: 0,
            fees: 0,
            max_size: 0,
            difficulty: 0,
          };

          // Fallback to upgrades if contract doesn't return max_size or difficulty
          const finalDAMaxSize =
            daMaxSize ||
            useUpgradesStore.getState().getUpgradeValue(1, "DA compression") ||
            1;
          const finalDADifficulty =
            daDifficulty ||
            useUpgradesStore.getState().getUpgradeLevel(1, "DA compression") +
              2 ||
            1;
          const finalProverMaxSize =
            proofMaxSize ||
            useUpgradesStore
              .getState()
              .getUpgradeValue(1, "Recursive Proving") ||
            1;
          const finalProverDifficulty =
            proofDifficulty ||
            useUpgradesStore
              .getState()
              .getUpgradeLevel(1, "Recursive Proving") + 2 ||
            1;

          const l2Instance: L2 = newL2();

          // Initialize DA with existing state
          l2Instance.da = newL2DA(finalDAMaxSize, finalDADifficulty);
          if (daSize && daSize > 0) {
            l2Instance.da.blocks = new Array(daSize).fill(0).map((_, i) => i);
            l2Instance.da.blockFees = daFees || 0;
            l2Instance.da.isBuilt = daSize >= finalDAMaxSize;
          }

          // Initialize Prover with existing state
          l2Instance.prover = newL2Prover(
            finalProverMaxSize,
            finalProverDifficulty,
          );
          if (proofSize && proofSize > 0) {
            l2Instance.prover.blocks = new Array(proofSize)
              .fill(0)
              .map((_, i) => i);
            l2Instance.prover.blockFees = proofFees || 0;
            l2Instance.prover.isBuilt = proofSize >= finalProverMaxSize;
          }

          set({
            l2: l2Instance,
            isL2Unlocked: true,
            isInitialized: true,
          });
          useUpgradesStore.getState().checkCanPrestige();
        } catch (error) {
          if (__DEV__) console.error("Error initializing L2 store:", error);
        }
      } else {
        get().resetL2Store();
        set({ isInitialized: true });
      }
    };
    fetchL2Store();
  },

  canUnlockL2: () => {
    // If L2 is already unlocked, return false
    if (get().isL2Unlocked) {
      return false;
    }

    // Get transaction and dapp levels from TransactionsStore
    const { transactionFeeLevels, dappFeeLevels } =
      useTransactionsStore.getState();

    // Check all L1 transactions are unlocked
    const txLevels = transactionFeeLevels[0];
    if (!txLevels) {
      return false;
    }
    for (const level of Object.values(txLevels)) {
      if (level === -1) {
        return false;
      }
    }

    // Check all L1 dapps are unlocked
    const dappLevels = dappFeeLevels[0];
    if (!dappLevels) {
      return false;
    }
    for (const level of Object.values(dappLevels)) {
      if (level === -1) {
        return false;
      }
    }

    return true;
  },

  initL2: () => {
    const cost = get().getL2Cost();
    if (!useBalanceStore.getState().tryBuy(cost)) return;

    set((state) => {
      if (state.l2) return state;
      useGameStore.getState().initL2WorkingBlock();

      // Get upgrade values at initialization time and store them as maxSize and difficulty
      const daMaxSize =
        useUpgradesStore.getState().getUpgradeValue(1, "DA compression") || 1;
      const daDifficulty =
        useUpgradesStore.getState().getUpgradeLevel(1, "DA compression") + 2 ||
        1;
      const proverMaxSize =
        useUpgradesStore.getState().getUpgradeValue(1, "Recursive Proving") ||
        1;
      const proverDifficulty =
        useUpgradesStore.getState().getUpgradeLevel(1, "Recursive Proving") +
          2 || 1;

      const newL2Instance = newL2();
      newL2Instance.da = newL2DA(daMaxSize, daDifficulty);
      newL2Instance.prover = newL2Prover(proverMaxSize, proverDifficulty);

      useEventManager.getState().notify("L2Purchased");
      return {
        l2: newL2Instance,
        isL2Unlocked: true,
      };
    });
    useUpgradesStore.getState().checkCanPrestige();
  },

  getL2Cost: () => {
    return unlocksConfig.next_chain_cost;
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
    set((state) => {
      if (!state.l2) return state;
      const newL2Instance = { ...state.l2 };
      if (!newL2Instance.da) return state;

      // Use the stored maxSize instead of dynamically getting upgrade value
      const daMaxSize = newL2Instance.da.maxSize;
      if (
        newL2Instance.da.isBuilt ||
        newL2Instance.da.blocks.length >= daMaxSize
      )
        return state;

      newL2Instance.da.blocks.push(block.blockId);
      const blockReward =
        block.reward ||
        useUpgradesStore.getState().getUpgradeValue(1, "Block Reward");
      newL2Instance.da.blockFees += blockReward;
      newL2Instance.da.isBuilt = newL2Instance.da.blocks.length >= daMaxSize;
      return { l2: newL2Instance };
    });
  },

  addBlockToProver: (block) => {
    if (!get().l2) return;
    set((state) => {
      if (!state.l2) return state;
      const newL2Instance = { ...state.l2 };
      if (!newL2Instance.prover) return state;

      // Use the stored maxSize instead of dynamically getting upgrade value
      const proverMaxSize = newL2Instance.prover.maxSize;
      if (
        newL2Instance.prover.isBuilt ||
        newL2Instance.prover.blocks.length >= proverMaxSize
      )
        return state;

      newL2Instance.prover.blocks.push(block.blockId);
      const blockReward =
        block.reward ||
        useUpgradesStore.getState().getUpgradeValue(1, "Block Reward");
      newL2Instance.prover.blockFees += blockReward;
      newL2Instance.prover.isBuilt =
        newL2Instance.prover.blocks.length >= proverMaxSize;
      return { l2: newL2Instance };
    });
  },

  onDaConfirmed: () => {
    set((state) => {
      if (!state.l2 || !state.l2.da) return state;
      useBalanceStore.getState().updateBalance(state.l2.da.blockFees);
      const newL2Instance = { ...state.l2 };

      // Get current upgrade value for the new DA instance
      const daMaxSize =
        useUpgradesStore.getState().getUpgradeValue(1, "DA compression") || 1;
      const daDifficulty =
        useUpgradesStore.getState().getUpgradeLevel(1, "DA compression") + 2 ||
        1;
      newL2Instance.da = newL2DA(daMaxSize, daDifficulty);
      useEventManager.getState().notify("DaDone", { da: state.l2.da });

      return { l2: newL2Instance };
    });
  },

  onProverConfirmed: () => {
    set((state) => {
      if (!state.l2 || !state.l2.prover) return state;
      useBalanceStore.getState().updateBalance(state.l2.prover.blockFees);
      const newL2Instance = { ...state.l2 };

      // Get current upgrade value for the new Prover instance
      const proverMaxSize =
        useUpgradesStore.getState().getUpgradeValue(1, "Recursive Proving") ||
        1;
      const proverDifficulty =
        useUpgradesStore.getState().getUpgradeLevel(1, "Recursive Proving") +
          2 || 1;
      newL2Instance.prover = newL2Prover(proverMaxSize, proverDifficulty);
      useEventManager
        .getState()
        .notify("ProveDone", { proof: state.l2.prover });

      return { l2: newL2Instance };
    });
  },
}));
