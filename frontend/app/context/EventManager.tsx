import React, { createContext, useContext, useState, useCallback } from "react";

export interface Observer {
  onNotify(eventName: string, data?: any): void;
}

type EventManagerContextType = {
  registerObserver(observer: Observer): number;
  unregisterObserver(observerId: number): void;
  notify(eventName: string, data?: any): void;
};

const EventManagerContext = createContext<EventManagerContextType | undefined>(undefined);

export const useEventManager = () => {
  const context = useContext(EventManagerContext);
  if (!context) {
    throw new Error("useEventManager must be used within an EventManagerProvider");
  }
  return context;
}

export const EventManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [observers, setObservers] = useState<Map<number, Observer>>(new Map());

  const registerObserver = useCallback((observer: Observer) => {
    const id = Date.now();
    setObservers(prev => new Map(prev).set(id, observer));
    return id;
  }, []);
  
  const unregisterObserver = useCallback((id: number) => {
    setObservers(prev => {
      const m = new Map(prev);
      m.delete(id);
      return m;
    });
  }, []);
  
  const notify = (eventName: string, data?: any) => {
    observers.forEach((observer) => {
      observer.onNotify(eventName, data);
    });
  };

  return (
    <EventManagerContext.Provider value={{ notify, registerObserver, unregisterObserver }}>
      {children}
    </EventManagerContext.Provider>
  );
}
