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
  | "ActionsReverted"
  | "RewardClaimed";

export interface Observer {
  onNotify(eventName: EventType, data?: any): Promise<void>;
}

export type EventManager = {
  observers: Map<string, Observer>;
  registerObserver(key: string, observer: Observer): void;
  unregisterObserver(key: string): void;
  notify(eventType: EventType, data?: any): void;
  cleanup(): void;
  getObserverCount(): number;
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
    // Use queueMicrotask for better performance than setTimeout
    // This avoids creating timer objects and provides immediate execution
    queueMicrotask(() => {
      const currentObservers = get().observers;
      if (currentObservers.size > 0) {
        currentObservers.forEach(async (observer, key) => {
          try {
            await observer.onNotify(eventType, data);
          } catch (error) {
            if (__DEV__) {
              console.warn(
                `Observer ${key} failed to handle event ${eventType}:`,
                error,
              );
            }
          }
        });
      }
    });
  },

  cleanup(): void {
    const observers = get().observers;
    if (__DEV__ && observers.size > 0) {
      console.log(`Cleaning up ${observers.size} event observers`);
    }
    observers.clear();
    set({ observers: new Map<string, Observer>() });
  },

  getObserverCount(): number {
    return get().observers.size;
  },
}));
