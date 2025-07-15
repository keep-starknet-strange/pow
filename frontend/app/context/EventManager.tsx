import React, { createContext, useContext, useState } from "react";

export type EventType =
  | "BasicClick"
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
  | "TxUpgradePurchased"
  | "UpgradePurchased"
  | "AutomationPurchased"
  | "DappsPurchased"
  | "StakingPurchased"
  | "L2Purchased"
  | "PrestigePurchased"
  | "TxAdded"
  | "AchievementCompleted"
  | "SwitchPage";

export interface Observer {
  onNotify(eventName: EventType, data?: any): void;
}

type EventManagerContextType = {
  registerObserver(observer: Observer): number;
  unregisterObserver(observerId: number): void;
  notify(eventName: EventType, data?: any): void;
};

const EventManagerContext = createContext<EventManagerContextType | undefined>(
  undefined,
);

export const useEventManager = () => {
  const context = useContext(EventManagerContext);
  if (!context) {
    throw new Error(
      "useEventManager must be used within an EventManagerProvider",
    );
  }
  return context;
};

export const EventManagerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [observers, setObservers] = useState<Map<number, Observer>>(new Map());

  const registerObserver = (observer: Observer): number => {
    // Generate a unique ID for the observer
    const id = Math.floor(Math.random() * 10000000);
    setObservers((prev) => new Map(prev).set(id, observer));
    return id;
  };

  const unregisterObserver = (observerId: number): void => {
    setObservers((prev) => {
      const newObservers = new Map(prev);
      newObservers.delete(observerId);
      return newObservers;
    });
  };

  const notify = (eventName: EventType, data?: any) => {
    observers.forEach((observer) => {
      observer.onNotify(eventName, data);
    });
  };

  return (
    <EventManagerContext.Provider
      value={{ notify, registerObserver, unregisterObserver }}
    >
      {children}
    </EventManagerContext.Provider>
  );
};
