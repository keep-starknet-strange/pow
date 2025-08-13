import { useEffect, useRef, memo } from "react";
import { useEventManager } from "@/app/stores/useEventManager";
import { InAppNotificationsObserver } from "@/app/observers/InAppNotificationsObserver";
import { AchievementObserver } from "@/app/observers/AchievementObserver";
import { SoundObserver } from "@/app/observers/SoundObserver";
import { TxBuilderObserver } from "@/app/observers/TxBuilderObserver";
import { TutorialObserver } from "@/app/observers/TutorialObserver";
import { useInAppNotifications } from "@/app/stores/useInAppNotificationsStore";
import { useAchievement } from "@/app/stores/useAchievementsStore";
import { useSound } from "@/app/stores/useSoundStore";
import { usePowContractConnector } from "@/app/context/PowContractConnector";
import { useTutorial } from "@/app/stores/useTutorialStore";

export const ObserversInitializer = memo(() => {
  console.log("ObserversInitializer rendered");

  const { registerObserver, unregisterObserver } = useEventManager();
  const registeredKeys = useRef<Set<string>>(new Set());

  const { sendInAppNotification } = useInAppNotifications();
  const { updateAchievement } = useAchievement();
  const { playSoundEffect } = useSound();
  const { addPowAction } = usePowContractConnector();
  const { advanceStep, setVisible, step } = useTutorial();

  useEffect(() => {
    const observers = [
      {
        key: "inAppNotifications",
        instance: new InAppNotificationsObserver(sendInAppNotification),
      },
      {
        key: "achievement",
        instance: new AchievementObserver(updateAchievement),
      },
      {
        key: "sound",
        instance: new SoundObserver(playSoundEffect),
      },
      {
        key: "txBuilder",
        instance: new TxBuilderObserver(addPowAction),
      },
      {
        key: "tutorial",
        instance: new TutorialObserver(advanceStep, setVisible, step),
      },
    ];

    observers.forEach(({ key, instance }) => {
      unregisterObserver(key);
      registerObserver(key, instance);
      registeredKeys.current.add(key);
    });

    return () => {
      registeredKeys.current.forEach((key) => {
        unregisterObserver(key);
      });
      registeredKeys.current.clear();
    };
  }, [
    sendInAppNotification,
    updateAchievement,
    playSoundEffect,
    addPowAction,
    advanceStep,
    setVisible,
    step,
    registerObserver,
    unregisterObserver,
  ]);

  return null;
});

ObserversInitializer.displayName = "ObserversInitializer";
