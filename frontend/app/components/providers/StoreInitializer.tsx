import { useEffect, memo } from "react";
import { useStarknetConnector } from "@/app/context/StarknetConnector";
import { useFocEngine } from "@/app/context/FocEngineConnector";
import { usePowContractConnector } from "@/app/context/PowContractConnector";
import { useGameStore } from "@/app/stores/useGameStore";
import { useBalanceStore } from "@/app/stores/useBalanceStore";
import { useOnchainActions } from "@/app/stores/useOnchainActions";
import { useL2Store } from "@/app/stores/useL2Store";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useAchievementsStore } from "@/app/stores/useAchievementsStore";
import { useSoundStore, useSound } from "@/app/stores/useSoundStore";
import { useTutorialStore } from "@/app/stores/useTutorialStore";
import { useUpgradesStore } from "@/app/stores/useUpgradesStore";

export const StoreInitializer = memo(() => {
  console.log("StoreInitializer rendered");
  const { user, getUniqueEventsWith } = useFocEngine();
  const { invokeCalls } = useStarknetConnector();
  const {
    powContract,
    getUserBalance,
    initMyGame,
    getUserMaxChainId,
    getUserBlockNumber,
    getUserTxFeeLevels,
    getUserTxSpeedLevels,
    getUserBlockState,
    getUserUpgradeLevels,
    getUserAutomationLevels,
  } = usePowContractConnector();

  const { setSoundDependency, initializeAchievements } = useAchievementsStore();
  const { cleanupSound, initializeSound } = useSoundStore();
  const { playSoundEffect } = useSound();
  const { onInvokeActions } = useOnchainActions();
  const { initializeBalance } = useBalanceStore();
  const { initializeTransactions } = useTransactionsStore();
  const { initializeGameStore, setInitMyGameDependency } = useGameStore();
  const { initializeL2Store } = useL2Store();
  const { initializeTutorial } = useTutorialStore();
  const { initializeUpgrades } = useUpgradesStore();

  useEffect(() => {
    onInvokeActions(invokeCalls);
  }, [invokeCalls, onInvokeActions]);

  useEffect(() => {
    initializeSound();
    return () => {
      cleanupSound();
    };
  }, [initializeSound, cleanupSound]);

  useEffect(() => {
    initializeTutorial();
  }, [initializeTutorial]);

  useEffect(() => {
    setSoundDependency(playSoundEffect);
    initializeAchievements(user?.account_address);
  }, [playSoundEffect, setSoundDependency, initializeAchievements, user]);

  useEffect(() => {
    initializeBalance(powContract, user, getUserBalance);
  }, [initializeBalance, getUserBalance, powContract, user]);

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
    initializeGameStore(
      powContract,
      user,
      getUserMaxChainId,
      getUserBlockNumber,
      getUserBlockState,
    );
  }, [
    initializeGameStore,
    powContract,
    user,
    getUserMaxChainId,
    getUserBlockNumber,
    getUserBlockState,
  ]);

  useEffect(() => {
    setInitMyGameDependency(initMyGame);
  }, [initMyGame, setInitMyGameDependency]);

  useEffect(() => {
    initializeL2Store(powContract, user, getUserMaxChainId);
  }, [initializeL2Store, powContract, user, getUserMaxChainId]);

  useEffect(() => {
    initializeUpgrades(
      user,
      powContract,
      getUserUpgradeLevels,
      getUserAutomationLevels,
      getUniqueEventsWith,
    );
  }, [
    user,
    powContract,
    getUserUpgradeLevels,
    getUserAutomationLevels,
    getUniqueEventsWith,
    initializeUpgrades,
  ]);

  return null;
});

StoreInitializer.displayName = "StoreInitializer";
