import { useEffect, memo, useCallback } from "react";
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

const OnchainActionsInitializer = memo(() => {
  const { invokeCalls, waitForTransaction } = useStarknetConnector();
  const { onInvokeActions, onWaitForTransaction } = useOnchainActions();

  useEffect(() => {
    onInvokeActions(invokeCalls);
  }, [invokeCalls, onInvokeActions]);

  useEffect(() => {
    onWaitForTransaction(waitForTransaction);
  }, [waitForTransaction, onWaitForTransaction]);

  return null;
});

const OnchainActionsRevertInitializer = memo(() => {
  const { resetBalance, setIsInitialized: setBalanceInitialized } =
    useBalanceStore();
  const { resetGameStore, setIsInitialized: setGameInitialized } =
    useGameStore();
  const { resetL2Store, setIsInitialized: setL2Initialized } = useL2Store();
  const { resetTransactions, setIsInitialized: setTransactionsInitialized } =
    useTransactionsStore();
  const { resetUpgrades, setIsInitialized: setUpgradesInitialized } =
    useUpgradesStore();
  const { onRevertCallback } = useOnchainActions();

  const { disconnectUser, refreshUser, userContract } = useFocEngine();

  const revertCallback = useCallback(async () => {
    // Reset all user stores
    resetBalance();
    resetGameStore();
    resetL2Store();
    resetTransactions();
    resetUpgrades();

    // Manual reinitialization of user stores
    disconnectUser();
    setBalanceInitialized(false);
    setGameInitialized(false);
    setL2Initialized(false);
    setTransactionsInitialized(false);
    setUpgradesInitialized(false);
    await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay
    refreshUser(userContract);
  }, [
    disconnectUser,
    refreshUser,
    userContract,
    resetBalance,
    resetGameStore,
    resetL2Store,
    resetTransactions,
    resetUpgrades,
    setBalanceInitialized,
    setGameInitialized,
    setL2Initialized,
    setTransactionsInitialized,
    setUpgradesInitialized,
  ]);

  useEffect(() => {
    onRevertCallback(revertCallback);
  }, [onRevertCallback, revertCallback]);

  return null;
});

const SoundInitializer = memo(() => {
  const { cleanupSound, initializeSound } = useSoundStore();

  useEffect(() => {
    initializeSound();
    return () => {
      cleanupSound();
    };
  }, [initializeSound, cleanupSound]);

  return null;
});

const TutorialInitializer = memo(() => {
  const { initializeTutorial } = useTutorialStore();

  useEffect(() => {
    initializeTutorial();
  }, [initializeTutorial]);

  return null;
});

const AchievementsInitializer = memo(() => {
  const { user } = useFocEngine();
  const { setSoundDependency, initializeAchievements } = useAchievementsStore();
  const { playSoundEffect } = useSound();

  useEffect(() => {
    setSoundDependency(playSoundEffect);
    initializeAchievements(user?.account_address);
  }, [playSoundEffect, setSoundDependency, initializeAchievements, user]);

  return null;
});

const BalanceInitializer = memo(() => {
  const { user } = useFocEngine();
  const { powContract, getUserBalance } = usePowContractConnector();
  const { initializeBalance } = useBalanceStore();

  useEffect(() => {
    initializeBalance(powContract, user, getUserBalance);
  }, [initializeBalance, getUserBalance, powContract, user]);

  return null;
});

const TransactionsInitializer = memo(() => {
  const { user } = useFocEngine();
  const {
    powContract,
    getUserTxFeeLevels,
    getUserTxSpeedLevels,
    getUserDappsUnlocked,
  } = usePowContractConnector();
  const { initializeTransactions } = useTransactionsStore();

  useEffect(() => {
    initializeTransactions(
      powContract,
      user,
      getUserTxFeeLevels,
      getUserTxSpeedLevels,
      getUserDappsUnlocked,
    );
  }, [
    initializeTransactions,
    powContract,
    user,
    getUserTxFeeLevels,
    getUserTxSpeedLevels,
  ]);

  return null;
});

const GameStoreInitializer = memo(() => {
  const { user } = useFocEngine();
  const {
    powContract,
    getUserMaxChainId,
    getUserBlockNumber,
    getUserBlockState,
  } = usePowContractConnector();
  const { initializeGameStore } = useGameStore();

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

  return null;
});

const L2Initializer = memo(() => {
  const { user } = useFocEngine();
  const {
    powContract,
    getUserMaxChainId,
    getUserProofBuildingState,
    getUserDABuildingState,
  } = usePowContractConnector();
  const { initializeL2Store } = useL2Store();

  useEffect(() => {
    initializeL2Store(
      powContract,
      user,
      getUserMaxChainId,
      getUserProofBuildingState,
      getUserDABuildingState,
    );
  }, [
    initializeL2Store,
    powContract,
    user,
    getUserMaxChainId,
    getUserProofBuildingState,
    getUserDABuildingState,
  ]);

  return null;
});

const UpgradesInitializer = memo(() => {
  const { user, getUniqueEventsWith } = useFocEngine();
  const {
    powContract,
    getUserUpgradeLevels,
    getUserAutomationLevels,
    getUserPrestige,
  } = usePowContractConnector();
  const { initializeUpgrades } = useUpgradesStore();

  useEffect(() => {
    initializeUpgrades(
      user,
      powContract,
      getUserUpgradeLevels,
      getUserAutomationLevels,
      getUserPrestige,
      getUniqueEventsWith,
    );
  }, [
    user,
    powContract,
    getUserUpgradeLevels,
    getUserAutomationLevels,
    getUserPrestige,
    getUniqueEventsWith,
    initializeUpgrades,
  ]);

  return null;
});

export const StoreInitializer = memo(() => {
  return (
    <>
      <OnchainActionsInitializer />
      <OnchainActionsRevertInitializer />
      <SoundInitializer />
      <TutorialInitializer />
      <AchievementsInitializer />
      <BalanceInitializer />
      <TransactionsInitializer />
      <GameStoreInitializer />
      <L2Initializer />
      <UpgradesInitializer />
    </>
  );
});

StoreInitializer.displayName = "StoreInitializer";
