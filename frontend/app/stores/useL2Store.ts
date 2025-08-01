import { create } from "zustand";
import { Contract } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import { useBalanceStore } from "./useBalanceStore";
import { useGameStore } from "./useGameStore";
import { useChainsStore } from "./useChainsStore";
import { useEventManager } from "./useEventManager";
import { useUpgradesStore } from "./useUpgradesStore";
import { Transaction, Block, newBlock } from "../types/Chains";
import { L2, newL2, L2DA, newL2DA, L2Prover, newL2Prover } from "../types/L2";

interface L2Store {
  l2: L2 | undefined;
  isL2Unlocked: boolean;

  resetL2Store: () => void;
  initializeL2Store: (
    powContract: Contract | null,
    user: FocAccount | null,
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

  resetL2Store: () => set({ l2: undefined, isL2Unlocked: false }),
  initializeL2Store: (powContract, user) => {
    const fetchL2Store = async () => {
      if (powContract && user) {
        try {
          // Get upgrade values at initialization time
          const daMaxSize = useUpgradesStore.getState().getUpgradeValue(1, "DA compression") || 1;
          const proverMaxSize = useUpgradesStore.getState().getUpgradeValue(1, "Recursive Proving") || 1;
          
          const l2Instance: L2 = newL2();
          l2Instance.da = newL2DA(daMaxSize);
          l2Instance.prover = newL2Prover(proverMaxSize);

          set({
            l2: l2Instance,
            isL2Unlocked: true,
          });
        } catch (error) {
          console.error("Error initializing L2 store:", error);
        }
      } else {
        get().resetL2Store();
      }
    };
    fetchL2Store();
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
      useGameStore.getState().initL2WorkingBlock();
      
      // Get upgrade values at initialization time and store them as maxSize
      const daMaxSize = useUpgradesStore.getState().getUpgradeValue(1, "DA compression") || 1;
      const proverMaxSize = useUpgradesStore.getState().getUpgradeValue(1, "Recursive Proving") || 1;
      
      const newL2Instance = newL2();
      newL2Instance.da = newL2DA(daMaxSize);
      newL2Instance.prover = newL2Prover(proverMaxSize);
      
      useChainsStore.getState().addChain();
      useEventManager.getState().notify("L2Purchased");
      return {
        l2: newL2Instance,
        isL2Unlocked: true,
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
    set((state) => {
      if (!state.l2) return state;
      const newL2Instance = { ...state.l2 };
      if (!newL2Instance.da) return state;
      
      // Use the stored maxSize instead of dynamically getting upgrade value
      const daMaxSize = newL2Instance.da.maxSize;
      if (newL2Instance.da.isBuilt || newL2Instance.da.blocks.length >= daMaxSize) return state;
      
      newL2Instance.da.blocks.push(block.blockId);
      const blockReward =
        block.reward ||
        useUpgradesStore.getState().getUpgradeValue(0, "Block Reward");
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
      if (newL2Instance.prover.isBuilt || newL2Instance.prover.blocks.length >= proverMaxSize) return state;
      
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
      const daMaxSize = useUpgradesStore.getState().getUpgradeValue(1, "DA compression") || 1;
      newL2Instance.da = newL2DA(daMaxSize);
      
      return { l2: newL2Instance };
    });
  },

  onProverConfirmed: () => {
    set((state) => {
      if (!state.l2 || !state.l2.prover) return state;
      useBalanceStore.getState().updateBalance(state.l2.prover.blockFees);
      const newL2Instance = { ...state.l2 };
      
      // Get current upgrade value for the new Prover instance
      const proverMaxSize = useUpgradesStore.getState().getUpgradeValue(1, "Recursive Proving") || 1;
      newL2Instance.prover = newL2Prover(proverMaxSize);
      
      return { l2: newL2Instance };
    });
  },
}));
