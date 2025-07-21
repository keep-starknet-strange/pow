import "./global.css";

import { useState, useEffect } from "react";

import { RootNavigator } from "./navigation/RootNavigator";

import { useEventManager } from "@/app/stores/useEventManager";
import { useStarknetConnector } from "./context/StarknetConnector";
import { useFocEngine } from "./context/FocEngineConnector";
import { usePowContractConnector } from "./context/PowContractConnector";
import { useUpgrades } from "./context/Upgrades";
import { useGameStore } from "./stores/useGameStore";
import { useBalanceStore } from "./stores/useBalanceStore";
import { useOnchainActions } from "./stores/useOnchainActions";
import { useChainsStore } from "./stores/useChainsStore";
import { useTransactionsStore } from "./stores/useTransactionsStore";
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
  const { getUserBalance, initMyGame } = usePowContractConnector();
  const { setSoundDependency, initializeAchievements } = useAchievementsStore();
  const { initializeSound } = useSoundStore();

  const { sendInAppNotification } = useInAppNotifications();
  const [inAppNotificationObserver, setInAppNotificationObserver] = useState<
    null | string
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
  const [achievementObserver, setAchievementObserver] = useState<null | string>(
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

  const { invokeCalls } = useStarknetConnector();
  const {
    addPowAction,
    powContract,
    getUserMaxChainId,
    getUserBlockNumber,
    getUserTxFeeLevels,
    getUserTxSpeedLevels,
    getUserBlockState,
  } = usePowContractConnector();
  const { onInvokeActions } = useOnchainActions();
  const [txBuilderObserver, setTxBuilderObserver] = useState<null | string>(
    null,
  );
  useEffect(() => {
    if (txBuilderObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(txBuilderObserver);
    }
    setTxBuilderObserver(registerObserver(new TxBuilderObserver(addPowAction)));
  }, [addPowAction]);
  useEffect(() => {
    onInvokeActions(invokeCalls);
  }, [invokeCalls, onInvokeActions]);

  const { playSoundEffect } = useSound();
  const [soundObserver, setSoundObserver] = useState<null | string>(null);
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
  const [tutorialObserver, setTutorialObserver] = useState<null | string>(null);
  useEffect(() => {
    if (tutorialObserver !== null) {
      unregisterObserver(tutorialObserver);
    }
    const observerId = registerObserver(
      new TutorialObserver(advanceStep, setVisible, step),
    );
    setTutorialObserver(observerId);
  }, [advanceStep, setVisible, step]);

  useEffect(() => {
    setSoundDependency(playSoundEffect);
    initializeAchievements(user?.account_address);
  }, [playSoundEffect, setSoundDependency, initializeAchievements, user]);

  const { initializeBalance } = useBalanceStore();
  useEffect(() => {
    initializeBalance(powContract, user, getUserBalance);
  }, [initializeBalance, getUserBalance, powContract, user]);

  const { initializeChains } = useChainsStore();
  useEffect(() => {
    initializeChains(powContract, user, getUserMaxChainId, getUserBlockNumber);
  }, [
    initializeChains,
    powContract,
    user,
    getUserMaxChainId,
    getUserBlockNumber,
  ]);

  const { getUpgradeValue } = useUpgrades();
  const {
    initializeTransactions,
    setGetUpgradeValueDependency: setGetUpgradeValueDependencyTxStore,
  } = useTransactionsStore();
  useEffect(() => {
    initializeTransactions(
      powContract,
      user,
      getUserTxFeeLevels,
      getUserTxSpeedLevels,
    );
  }, [
    initializeTransactions,
    powContract,
    user,
    getUserTxFeeLevels,
    getUserTxSpeedLevels,
  ]);
  useEffect(() => {
    setGetUpgradeValueDependencyTxStore(getUpgradeValue);
  }, [notify, getUpgradeValue, setGetUpgradeValueDependencyTxStore]);

  const {
    initializeGameStore,
    setGetUpgradeValueDependency: setGetUpgradeValueDependencyGame,
    setInitMyGameDependency,
  } = useGameStore();
  useEffect(() => {
    initializeGameStore(
      powContract,
      user,
      getUserMaxChainId,
      getUserBlockNumber,
      getUserBlockState,
    );
  }, [initializeGameStore, user]);
  useEffect(() => {
    setGetUpgradeValueDependencyGame(getUpgradeValue);
    setInitMyGameDependency(initMyGame);
  }, [
    notify,
    getUpgradeValue,
    initMyGame,
    setGetUpgradeValueDependencyGame,
    setInitMyGameDependency,
  ]);

  return <RootNavigator />;
}
