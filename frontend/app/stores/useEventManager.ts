import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

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
  | "SwitchStore"
  | "SwitchPage";

export interface Observer {
  onNotify(eventName: EventType, data?: any): Promise<void>;
}

export type EventManager = {
  observers: Map<string, Observer>;
  registerObserver(observer: Observer): string;
  unregisterObserver(observerId: string): void;
  notify(eventType: EventType, data?: any): void;
};

export const useEventManager = create<EventManager>((set, get) => ({
  observers: new Map<string, Observer>(),

  registerObserver(observer: Observer): string {
    const observerId = uuidv4();
    set((state) => ({
      observers: new Map(state.observers).set(observerId, observer),
    }));
    return observerId;
  },

  unregisterObserver(observerId: string): void {
    set((state) => {
      const newObservers = new Map(state.observers);
      newObservers.delete(observerId);
      return { observers: newObservers };
    });
  },

  notify(eventType: EventType, data?: any): void {
    get().observers.forEach((observer, _) => {
      observer.onNotify(eventType, data);
    });
  },
}));
