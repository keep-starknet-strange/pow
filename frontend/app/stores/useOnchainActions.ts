import { create } from "zustand";
import { Call } from "starknet";
import { useEventManager } from "./useEventManager";
import { optimizeTransactions } from "../utils/transactionOptimization";
import { useTransactionOptimizationStore } from "./useTransactionOptimizationStore";

interface ActionsCall {
  id: string;
  actions: Call[];
  retryCount: number;
  lastError?: string; // Optional, for debugging
}

interface OnchainActionsState {
  actions: Call[];
  maxActions?: number;
  invokeQueue: ActionsCall[];
  isProcessing: boolean;
  isReverting: boolean;
  revertCounter: number;
  addAction: (action: Call) => void;
  addActionForceCall: (action: Call) => void;
  invokeActions?: (actions: Call[]) => Promise<any>;
  waitForTransaction?: (txHash: string) => Promise<boolean>;
  onInvokeActions: (invokeActions: (actions: Call[]) => Promise<any>) => void;
  onWaitForTransaction: (
    waitForTransaction: (txHash: string) => Promise<boolean>,
  ) => void;
  revertCallback?: () => Promise<void>;
  onRevertCallback: (revertCallback: () => Promise<void>) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
  revert(failedActionId?: string, lastError?: string): void;
  doneReverting: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const hasValidTransactionHash = (response: any): boolean => {
  if (!response) return false;

  // Check if response has data with transactionHash
  if (response.data?.transactionHash) {
    // Check if it's a valid hash (starts with 0x and has proper length)
    const hash = response.data.transactionHash;
    return (
      typeof hash === "string" && hash.startsWith("0x") && hash.length > 10
    );
  }

  // Check for error indicators
  if (response.error || response.data?.revertError) {
    return false;
  }

  return false;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useOnchainActions = create<OnchainActionsState>((set, get) => ({
  actions: [],
  maxActions: Number(process.env.EXPO_PUBLIC_MAX_ACTIONS) || 100,
  invokeQueue: [],
  isProcessing: false,
  isReverting: false,
  revertCounter: 0,

  addAction: (action: Call) =>
    set((state) => {
      // Prevent adding actions when reverting
      if (state.isReverting) {
        return state;
      }

      const updatedActions = [...state.actions, action];

      // Check if we've reached max actions
      if (state.maxActions && updatedActions.length >= state.maxActions) {
        // Create a new ActionsCall for the queue
        const actionsToInvoke = updatedActions.slice(0, state.maxActions);
        const newActionsCall: ActionsCall = {
          id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          actions: actionsToInvoke,
          retryCount: 0,
        };

        // Add to queue and clear the processed actions
        const newQueue = [...state.invokeQueue, newActionsCall];
        const remainingActions = updatedActions.slice(state.maxActions);

        // Start processing if not already doing so
        if (!state.isProcessing) {
          setTimeout(() => get().processQueue(), 0);
        }

        return {
          actions: remainingActions,
          invokeQueue: newQueue,
        };
      }

      return { actions: updatedActions };
    }),

  addActionForceCall: (action: Call) =>
    set((state) => {
      // Prevent adding actions when reverting
      if (state.isReverting) {
        return state;
      }

      // First force all currently queued actions into a call
      if (state.actions.length > 0) {
        const newActionsCall: ActionsCall = {
          id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          actions: [...state.actions],
          retryCount: 0,
        };

        // Create another call with the single new action
        const singleActionCall: ActionsCall = {
          id: `call-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
          actions: [action],
          retryCount: 0,
        };

        // Add the single action call to queue
        const newQueue = [
          ...state.invokeQueue,
          newActionsCall,
          singleActionCall,
        ];

        // Start processing if not already doing so
        if (!state.isProcessing) {
          setTimeout(() => get().processQueue(), 0);
        }

        return {
          actions: [], // Clear actions since they're now queued
          invokeQueue: newQueue,
        };
      } else {
        // No actions to force, just add the single action as a call
        const singleActionCall: ActionsCall = {
          id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          actions: [action],
          retryCount: 0,
        };

        // Add to queue
        const newQueue = [...state.invokeQueue, singleActionCall];

        // Start processing if not already doing so
        if (!state.isProcessing) {
          setTimeout(() => get().processQueue(), 0);
        }

        return {
          actions: [],
          invokeQueue: newQueue,
        };
      }
    }),

  invokeActions: async (actions: Call[]) => {},
  waitForTransaction: async (txHash: string) => false,

  onInvokeActions: (invokeActions) => set({ invokeActions: invokeActions }),
  onWaitForTransaction: (waitForTransaction) =>
    set({ waitForTransaction: waitForTransaction }),

  revertCallback: async () => {},
  onRevertCallback: (revertCallback) => set({ revertCallback: revertCallback }),

  processQueue: async () => {
    const state = get();

    // Check if already processing or no items in queue
    if (state.isProcessing || state.invokeQueue.length === 0) {
      return;
    }

    // Always process the first item in queue
    const currentItem = state.invokeQueue[0];
    if (!currentItem || !state.invokeActions) {
      return;
    }

    // Mark as processing
    set({ isProcessing: true });

    try {
      // Apply transaction optimizations before invoking
      const { bundlingEnabled } =
        useTransactionOptimizationStore.getState();
      const optimizedActions = optimizeTransactions(
        currentItem.actions,
        bundlingEnabled,
      );

      if (__DEV__) {
        console.log(
          `Invoking ${currentItem.actions.length} actions (optimized to ${optimizedActions.length})`,
        );
        if (bundlingEnabled) {
          console.log(
            `Optimizations: bundling=${bundlingEnabled}`,
          );
        }
      }

      // Attempt to invoke the actions
      const response = await state.invokeActions(optimizedActions);

      // Check if we got a transaction hash
      if (hasValidTransactionHash(response)) {
        const txHash = response.data?.transactionHash;

        // Wait for the transaction to be confirmed on-chain
        if (state.waitForTransaction && txHash) {
          const isConfirmed = await state.waitForTransaction(txHash);

          if (!isConfirmed) {
            throw new Error(`Transaction ${txHash} failed on-chain validation`);
          }
        }

        // Remove completed item from queue (pruning) and reset revert counter
        set((state) => ({
          invokeQueue: state.invokeQueue.slice(1), // Remove first item
          revertCounter: 0, // Reset counter on success
        }));

        if (__DEV__) {
          console.log(
            `✅ ActionsCall ${currentItem.id} completed and pruned from queue`,
          );
        }
      } else {
        throw new Error("Transaction validation failed - invalid response");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (__DEV__) {
        console.log(
          `❌ ActionsCall ${currentItem.id} failed (attempt ${currentItem.retryCount + 1}/${MAX_RETRIES}):`,
          errorMessage,
        );
      }

      // Check if we should retry
      if (currentItem.retryCount < MAX_RETRIES - 1) {
        // Update retry count for first item
        set((state) => ({
          invokeQueue: state.invokeQueue.map((item, index) =>
            index === 0
              ? {
                  ...item,
                  retryCount: item.retryCount + 1,
                  lastError: errorMessage,
                }
              : item,
          ),
        }));

        // Wait before retrying
        await delay(RETRY_DELAY_MS);
      } else {
        // Max retries reached - clear entire queue
        if (__DEV__) {
          console.error(
            `🛑 ActionsCall ${currentItem.id} permanently failed. Clearing entire queue (${state.invokeQueue.length} items). Last error: ${errorMessage}`,
          );
        }

        get().revert(currentItem.id, errorMessage);
        return; // Don't continue processing
      }
    } finally {
      // Clear processing state
      set({ isProcessing: false });

      // Continue processing queue if there are more items
      const updatedState = get();
      if (updatedState.invokeQueue.length > 0) {
        setTimeout(() => get().processQueue(), 0);
      }
    }
  },

  clearQueue: () => {
    set({ invokeQueue: [], actions: [] });
    if (__DEV__) {
      console.log("🧹 Queue manually cleared");
    }
  },

  revert: async (failedActionId?: string, lastError?: string) => {
    // Clear the entire queue, lock the store, and increment revert counter
    set((state) => ({
      isReverting: true,
      invokeQueue: [],
      actions: [],
      revertCounter: state.revertCounter + 1,
    }));

    if (__DEV__) {
      console.log(
        "⚠️ Reverting initiated, store locked. Revert count:",
        get().revertCounter,
      );
    }

    useEventManager.getState().notify("ActionsReverted", {
      failedActionId: failedActionId,
      queueLength: get().invokeQueue.length,
      lastError: lastError || "Unknown error",
    });

    const revertCallback = get().revertCallback;
    if (revertCallback) {
      await revertCallback().catch((error) => {
        if (__DEV__) {
          console.error("❌ Revert callback failed:", error);
        }
      });
    }
    get().doneReverting();
  },

  doneReverting: () => {
    set({ isReverting: false });
    if (__DEV__) {
      console.log("✅ Reverting completed, store unlocked");
    }
  },
}));
