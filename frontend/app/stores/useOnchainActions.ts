import { create } from "zustand";
import { Call } from "starknet";

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
  addAction: (action: Call) => void;
  invokeActions?: (actions: Call[]) => Promise<any>;
  waitForTransaction?: (txHash: string) => Promise<boolean>;
  onInvokeActions: (invokeActions: (actions: Call[]) => Promise<any>) => void;
  onWaitForTransaction: (
    waitForTransaction: (txHash: string) => Promise<boolean>,
  ) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
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

  addAction: (action: Call) =>
    set((state) => {
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

  invokeActions: async (actions: Call[]) => {},
  waitForTransaction: async (txHash: string) => false,

  onInvokeActions: (invokeActions) => set({ invokeActions: invokeActions }),
  onWaitForTransaction: (waitForTransaction) =>
    set({ waitForTransaction: waitForTransaction }),

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
      // Attempt to invoke the actions
      const response = await state.invokeActions(currentItem.actions);

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

        // Remove completed item from queue (pruning)
        set((state) => ({
          invokeQueue: state.invokeQueue.slice(1), // Remove first item
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
            `🛑 ActionsCall ${currentItem.id} permanently failed. Clearing entire queue (${state.invokeQueue.length} items).`,
          );
        }

        set({ invokeQueue: [] });
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
    set({ invokeQueue: [] });
    if (__DEV__) {
      console.log("🧹 Queue manually cleared");
    }
  },
}));
