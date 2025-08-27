import { create } from "zustand";
import { Call } from "starknet";

interface ActionsCall {
  id: string;
  actions: Call[];
  retryCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

interface OnchainActionsState {
  actions: Call[];
  maxActions?: number;
  invokeQueue: ActionsCall[];
  isProcessing: boolean;
  currentProcessingId: string | null;
  addAction: (action: Call) => void;
  invokeActions?: (actions: Call[]) => Promise<any>;
  waitForTransaction?: (txHash: string) => Promise<boolean>;
  onInvokeActions: (invokeActions: (actions: Call[]) => Promise<any>) => void;
  onWaitForTransaction: (waitForTransaction: (txHash: string) => Promise<boolean>) => void;
  processQueue: () => Promise<void>;
  retryFailedAction: (id: string) => Promise<void>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const isTransactionSuccessful = (response: any): boolean => {
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
  currentProcessingId: null,

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
          status: "pending",
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
  onWaitForTransaction: (waitForTransaction) => set({ waitForTransaction: waitForTransaction }),

  processQueue: async () => {
    const state = get();

    // Check if already processing or no items in queue
    if (state.isProcessing || state.invokeQueue.length === 0) {
      return;
    }

    // Find the next pending item
    const nextItem = state.invokeQueue.find(
      (item) => item.status === "pending",
    );
    if (!nextItem || !state.invokeActions) {
      set({ isProcessing: false });
      return;
    }

    // Mark as processing
    set((state) => ({
      isProcessing: true,
      currentProcessingId: nextItem.id,
      invokeQueue: state.invokeQueue.map((item) =>
        item.id === nextItem.id
          ? { ...item, status: "processing" as const }
          : item,
      ),
    }));

    try {
      // Attempt to invoke the actions
      const response = await state.invokeActions(nextItem.actions);

      // Check if we got a transaction hash
      if (isTransactionSuccessful(response)) {
        const txHash = response.data?.transactionHash;
        
        // Wait for the transaction to be confirmed on-chain
        if (state.waitForTransaction && txHash) {
          const isConfirmed = await state.waitForTransaction(txHash);
          
          if (!isConfirmed) {
            throw new Error(`Transaction ${txHash} failed on-chain validation`);
          }
        }
        
        // Mark as completed only after on-chain confirmation
        set((state) => ({
          invokeQueue: state.invokeQueue.map((item) =>
            item.id === nextItem.id
              ? { ...item, status: "completed" as const }
              : item,
          ),
        }));

        if (__DEV__) {
          console.log(`✅ ActionsCall ${nextItem.id} completed and confirmed on-chain`);
        }
      } else {
        throw new Error("Transaction validation failed - invalid response");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (__DEV__) {
        console.log(
          `❌ ActionsCall ${nextItem.id} failed (attempt ${nextItem.retryCount + 1}/${MAX_RETRIES}):`,
          errorMessage,
        );
      }

      // Check if we should retry
      if (nextItem.retryCount < MAX_RETRIES - 1) {
        // Update retry count and mark as pending again for retry
        set((state) => ({
          invokeQueue: state.invokeQueue.map((item) =>
            item.id === nextItem.id
              ? {
                  ...item,
                  status: "pending" as const,
                  retryCount: item.retryCount + 1,
                  error: errorMessage,
                }
              : item,
          ),
        }));

        // Wait before retrying
        await delay(RETRY_DELAY_MS);
      } else {
        // Max retries reached, mark as failed
        set((state) => ({
          invokeQueue: state.invokeQueue.map((item) =>
            item.id === nextItem.id
              ? {
                  ...item,
                  status: "failed" as const,
                  error: `Failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
                }
              : item,
          ),
        }));

        if (__DEV__) {
          console.error(
            `🛑 ActionsCall ${nextItem.id} permanently failed after ${MAX_RETRIES} attempts`,
          );
        }

        // Throw error to notify failure
        throw new Error(
          `Transaction failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
        );
      }
    } finally {
      // Clear processing state
      set({ isProcessing: false, currentProcessingId: null });

      // Continue processing queue if there are more items
      const updatedState = get();
      if (updatedState.invokeQueue.some((item) => item.status === "pending")) {
        setTimeout(() => get().processQueue(), 0);
      }
    }
  },

  retryFailedAction: async (id: string) => {
    set((state) => ({
      invokeQueue: state.invokeQueue.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "pending" as const,
              retryCount: 0,
              error: undefined,
            }
          : item,
      ),
    }));

    // Start processing if not already doing so
    const state = get();
    if (!state.isProcessing) {
      setTimeout(() => get().processQueue(), 0);
    }
  },
}));
