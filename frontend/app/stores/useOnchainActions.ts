import { create } from "zustand";
import { Call } from "starknet";

interface OnchainActionsState {
  actions: Call[];
  maxActions?: number;
  addAction: (action: Call) => void;
  invokeActions?: (actions: Call[]) => Promise<void>;
  onInvokeActions: (invokeActions: (actions: Call[]) => Promise<void>) => void;
}

export const useOnchainActions = create<OnchainActionsState>((set) => ({
  actions: [],
  maxActions: Number(process.env.EXPO_PUBLIC_MAX_ACTIONS) || 5,
  addAction: (action: Call) =>
    set((state) => {
      const updatedActions = [...state.actions, action];
      if (state.maxActions && updatedActions.length > state.maxActions) {
        const toInvoke = updatedActions.slice(0, state.maxActions);
        updatedActions.splice(0, state.maxActions);
        if (state.invokeActions) {
          state.invokeActions(toInvoke);
        }
      }
      console.log("Updated Actions:", updatedActions);
      return { actions: updatedActions };
    }),
  invokeActions: async (actions: Call[]) => {},
  onInvokeActions: (invokeActions) => set({ invokeActions: invokeActions }),
}));
