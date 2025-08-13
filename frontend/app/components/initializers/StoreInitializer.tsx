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
    console.log("onInvokeActions called with invokeCalls:", invokeCalls);
    onInvokeActions(invokeCalls);
  }, [invokeCalls, onInvokeActions]);

  useEffect(() => {
    console.log("Initializing sound");
    initializeSound();
    return () => {
      cleanupSound();
    };
  }, [initializeSound, cleanupSound]);

  useEffect(() => {
    console.log("Initializing tutorial");
    initializeTutorial();
  }, [initializeTutorial]);

  useEffect(() => {
    console.log("Setting sound dependency");
    setSoundDependency(playSoundEffect);
    initializeAchievements(user?.account_address);
  }, [playSoundEffect, setSoundDependency, initializeAchievements, user]);

  useEffect(() => {
    console.log("Initializing balance for user:", user);
    initializeBalance(powContract, user, getUserBalance);
  }, [initializeBalance, getUserBalance, powContract, user]);

  useEffect(() => {
    console.log("Initializing transactions for user:", user);
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
    console.log("Initializing game store for user:", user);
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
    console.log("Setting initMyGame dependency");
    setInitMyGameDependency(initMyGame);
  }, [initMyGame, setInitMyGameDependency]);

  useEffect(() => {
    console.log("Initializing L2 store for user:", user);
    initializeL2Store(powContract, user, getUserMaxChainId);
  }, [initializeL2Store, powContract, user, getUserMaxChainId]);

  useEffect(() => {
    console.log("Initializing upgrades for user:", user);
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
