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

const OnchainActionsInitializer = memo(() => {
  const { invokeCalls } = useStarknetConnector();
  const { onInvokeActions } = useOnchainActions();

  useEffect(() => {
    onInvokeActions(invokeCalls);
  }, [invokeCalls, onInvokeActions]);

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
  const { powContract, getUserTxFeeLevels, getUserTxSpeedLevels } = usePowContractConnector();
  const { initializeTransactions } = useTransactionsStore();

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

  return null;
});

const GameStoreInitializer = memo(() => {
  const { user } = useFocEngine();
  const { powContract, initMyGame, getUserMaxChainId, getUserBlockNumber, getUserBlockState } = usePowContractConnector();
  const { initializeGameStore, setInitMyGameDependency } = useGameStore();

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

  return null;
});

const L2Initializer = memo(() => {
  const { user } = useFocEngine();
  const { powContract, getUserMaxChainId } = usePowContractConnector();
  const { initializeL2Store } = useL2Store();

  useEffect(() => {
    initializeL2Store(powContract, user, getUserMaxChainId);
  }, [initializeL2Store, powContract, user, getUserMaxChainId]);

  return null;
});

const UpgradesInitializer = memo(() => {
  const { user, getUniqueEventsWith } = useFocEngine();
  const { powContract, getUserUpgradeLevels, getUserAutomationLevels } = usePowContractConnector();
  const { initializeUpgrades } = useUpgradesStore();

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

export const StoreInitializer = memo(() => {
  return (
    <>
      <OnchainActionsInitializer />
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
