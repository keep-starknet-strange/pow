import { create } from "zustand";

export type EventType =
  | "BasicClick"
  | "BasicError"
  | "DiceRoll"
  | "MineClicked"
  | "MineDone"
  | "SequenceClicked"
  | "SequenceDone"
  | "ProveClicked"
  | "ProveDone"
  | "DaClicked"
  | "DaDone"
  | "BalanceUpdated"
  | "ItemPurchased"
  | "BuyFailed"
  | "InvalidPurchase"
  | "BlockFull"
  | "TxUpgradePurchased"
  | "UpgradePurchased"
  | "AutomationPurchased"
  | "DappsPurchased"
  | "StakingPurchased"
  | "L2Purchased"
  | "PrestigePurchased"
  | "TxAdded"
  | "AchievementCompleted"
  | "TutorialDismissed"
  | "SwitchStore"
  | "SwitchPage"
  | "SwitchTxTab"
  | "BlockIsBuilt"
  | "ActionsReverted";

export interface Observer {
  onNotify(eventName: EventType, data?: any): Promise<void>;
}

export type EventManager = {
  observers: Map<string, Observer>;
  registerObserver(key: string, observer: Observer): void;
  unregisterObserver(key: string): void;
  notify(eventType: EventType, data?: any): void;
};

export const useEventManager = create<EventManager>((set, get) => ({
  observers: new Map<string, Observer>(),

  registerObserver(key: string, observer: Observer): void {
    set((state) => ({
      observers: new Map(state.observers).set(key, observer),
    }));
  },

  unregisterObserver(key: string): void {
    set((state) => {
      const newObservers = new Map(state.observers);
      newObservers.delete(key);
      return { observers: newObservers };
    });
  },

  notify(eventType: EventType, data?: any): void {
    // Defer all observer calls to next tick to avoid render-time state updates
    setTimeout(() => {
      get().observers.forEach((observer, _) => {
        observer.onNotify(eventType, data);
      });
    }, 0);
  },
}));
