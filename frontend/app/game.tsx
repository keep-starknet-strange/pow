import "./global.css";

import { useState, useEffect } from "react";

import { RootNavigator } from "./navigation/RootNavigator";

import { useEventManager } from "./context/EventManager";
import { useFocEngine } from "./context/FocEngineConnector";
import { usePowContractConnector } from "./context/PowContractConnector";
import { useGame } from "./context/Game";
import { useBalanceStore } from "./stores/useBalanceStore";
import { useInAppNotifications } from "./stores/useInAppNotificationsStore";
import {
  useAchievement,
  useAchievementsStore,
} from "./stores/useAchievementsStore";
import { useSound, useSoundStore } from "./stores/useSoundStore";
import { InAppNotificationsObserver } from "./observers/InAppNotificationsObserver";
import { AchievementObserver } from "./observers/AchievementObserver";
import { SoundObserver } from "./observers/SoundObserver";
import { TxBuilderObserver } from "./observers/TxBuilderObserver";
import { TutorialObserver } from "./observers/TutorialObserver";
import { useTutorial, useTutorialStore } from "./stores/useTutorialStore";

export default function game() {
  const { user } = useFocEngine();
  const { notify, registerObserver, unregisterObserver } = useEventManager();
  const { getUserBalance } = usePowContractConnector();
  const { setSoundDependency, initializeAchievements } = useAchievementsStore();
  const { initializeSound } = useSoundStore();
  const { setNotifyDependency, setFetchBalanceDependency, fetchBalance } =
    useBalanceStore();

  const { sendInAppNotification } = useInAppNotifications();
  const [inAppNotificationObserver, setInAppNotificationObserver] = useState<
    null | number
  >(null);
  useEffect(() => {
    if (inAppNotificationObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(inAppNotificationObserver);
    }
    setInAppNotificationObserver(
      registerObserver(new InAppNotificationsObserver(sendInAppNotification)),
    );
  }, [sendInAppNotification]);

  const { updateAchievement } = useAchievement();
  const [achievementObserver, setAchievementObserver] = useState<null | number>(
    null,
  );
  useEffect(() => {
    if (achievementObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(achievementObserver);
    }
    setAchievementObserver(
      registerObserver(new AchievementObserver(updateAchievement)),
    );
  }, [updateAchievement]);

  const { getWorkingBlock } = useGame();
  const { addAction } = usePowContractConnector();
  const [txBuilderObserver, setTxBuilderObserver] = useState<null | number>(
    null,
  );
  useEffect(() => {
    if (txBuilderObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(txBuilderObserver);
    }
    setTxBuilderObserver(
      registerObserver(new TxBuilderObserver(addAction, getWorkingBlock)),
    );
  }, [addAction, getWorkingBlock]);

  const { playSoundEffect } = useSound();
  const [soundObserver, setSoundObserver] = useState<null | number>(null);
  useEffect(() => {
    if (soundObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(soundObserver);
    }
    setSoundObserver(registerObserver(new SoundObserver(playSoundEffect)));
  }, [playSoundEffect]);

  useEffect(() => {
    initializeSound();
  }, [initializeSound]);

  const { advanceStep, setVisible, step } = useTutorial();
  const { setObserverId, clearObserverId } = useTutorialStore();
  const [tutorialObserver, setTutorialObserver] = useState<null | number>(null);
  useEffect(() => {
    if (tutorialObserver !== null) {
      unregisterObserver(tutorialObserver);
      clearObserverId();
    }
    const observerId = registerObserver(
      new TutorialObserver(advanceStep, setVisible, step),
    );
    setTutorialObserver(observerId);
    setObserverId(observerId);
  }, [advanceStep, setVisible, step]);

  useEffect(() => {
    setSoundDependency(playSoundEffect);
    initializeAchievements(user?.account_address);
  }, [playSoundEffect, setSoundDependency, initializeAchievements, user]);

  useEffect(() => {
    setNotifyDependency(notify);
    setFetchBalanceDependency(getUserBalance);
  }, [notify, getUserBalance, setNotifyDependency, setFetchBalanceDependency]);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user, fetchBalance]);

  return <RootNavigator />;
}
