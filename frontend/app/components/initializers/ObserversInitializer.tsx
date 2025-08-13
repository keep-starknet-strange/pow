import { useEffect, useRef, memo } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { InAppNotificationsObserver } from "@/app/observers/InAppNotificationsObserver";
import { AchievementObserver } from "@/app/observers/AchievementObserver";
import { SoundObserver } from "@/app/observers/SoundObserver";
import { TxBuilderObserver } from "@/app/observers/TxBuilderObserver";
import { TutorialObserver } from "@/app/observers/TutorialObserver";
import { usePowContractConnector } from "@/app/context/PowContractConnector";

export const ObserversInitializer = memo(() => {
  const { powGameContractAddress } = usePowContractConnector();

  const { registerObserver, unregisterObserver } = useEventManager();
  const registeredKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Create observers without any dependencies - they access stores directly
    const observers = [
      {
        key: "inAppNotifications",
        instance: new InAppNotificationsObserver(),
      },
      {
        key: "achievement",
        instance: new AchievementObserver(),
      },
      {
        key: "sound",
        instance: new SoundObserver(),
      },
      {
        key: "txBuilder",
        instance: new TxBuilderObserver(powGameContractAddress || "")
      },
      {
        key: "tutorial",
        instance: new TutorialObserver(),
      },
    ];

    // Register all observers once
    observers.forEach(({ key, instance }) => {
      unregisterObserver(key); // Clean up any existing observer
      registerObserver(key, instance);
      registeredKeys.current.add(key);
    });

    // Cleanup on unmount
    return () => {
      registeredKeys.current.forEach((key) => {
        unregisterObserver(key);
      });
      registeredKeys.current.clear();
    };
  }, [powGameContractAddress]);

  return null;
});

ObserversInitializer.displayName = "ObserversInitializer";
