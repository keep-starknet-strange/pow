import { create } from "zustand";
import { Contract } from "starknet";
import { FocAccount } from "../context/FocEngineConnector";
import { useEventManager } from "./useEventManager";
import transactionJson from "@/app/configs/transactions.json";
import dappsJson from "@/app/configs/dapps.json";
import unlocksConfig from "@/app/configs/unlocks.json";
import { useBalanceStore } from "./useBalanceStore";
import { useUpgradesStore } from "./useUpgradesStore";

interface TransactionsState {
  // Map: chainId -> txId -> Tx Fee Level
  transactionFeeLevels: { [chainId: number]: { [txId: number]: number } };
  // Map: chainId -> txId -> Tx Speed Level
  transactionSpeedLevels: { [chainId: number]: { [txId: number]: number } };
  // Map: chainId -> dappId -> Dapp Fee Level
  dappFeeLevels: { [chainId: number]: { [dappId: number]: number } };
  // Map: chainId -> dappId -> Dapp Speed Level
  dappSpeedLevels: { [chainId: number]: { [dappId: number]: number } };
  // Map: chainId -> boolean indicating if dapps are unlocked
  dappsUnlocked: { [chainId: number]: boolean };

  resetTransactions: () => void;
  initializeTransactions: (
    powContract: Contract | null,
    user: FocAccount | null,
    getUserTxFeeLevels: (
      chainId: number,
      txCount: number,
    ) => Promise<number[] | undefined>,
    getUserTxSpeedLevels: (
      chainId: number,
      txCount: number,
    ) => Promise<number[] | undefined>,
    getUserDappsUnlocked: (
      chainId: number,
    ) => Promise<boolean | undefined>,
  ) => void;

  txFeeUpgrade: (chainId: number, txId: number) => void;
  txSpeedUpgrade: (chainId: number, txId: number) => void;
  dappFeeUpgrade: (chainId: number, dappId: number) => void;
  dappSpeedUpgrade: (chainId: number, dappId: number) => void;
  unlockDapps: (chainId: number) => void;

  getFee: (chainId: number, txId: number, isDapp?: boolean) => number;
  getSpeed: (chainId: number, txId: number, isDapp?: boolean) => number;
  getTransactionFee: (chainId: number, txId: number) => number;
  getTransactionSpeed: (chainId: number, txId: number) => number;
  getDappFee: (chainId: number, dappId: number) => number;
  getDappSpeed: (chainId: number, dappId: number) => number;

  canUnlockDapps: (chainId: number) => boolean;
  canUnlockTx: (chainId: number, txId: number, isDapp?: boolean) => boolean;
  canUnlockDapp: (chainId: number, dappId: number) => boolean;
  getFeeLevel: (chainId: number, txId: number, isDapp?: boolean) => number;
  getSpeedLevel: (chainId: number, txId: number, isDapp?: boolean) => number;
  getDappUnlockCost: (chainId: number) => number;
  getNextFeeCost: (chainId: number, txId: number, isDapp?: boolean) => number;
  getNextSpeedCost: (chainId: number, txId: number, isDapp?: boolean) => number;
  getNextTxFeeCost: (chainId: number, txId: number) => number;
  getNextTxSpeedCost: (chainId: number, txId: number) => number;
  getNextDappFeeCost: (chainId: number, dappId: number) => number;
  getNextDappSpeedCost: (chainId: number, dappId: number) => number;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactionFeeLevels: {},
  transactionSpeedLevels: {},
  dappFeeLevels: {},
  dappSpeedLevels: {},
  dappsUnlocked: {},

  resetTransactions: () => {
    // Initialize transaction levels
    const initTransactionFeeLevels: {
      [chainId: number]: { [txId: number]: number };
    } = {};
    const initTransactionSpeedLevels: {
      [chainId: number]: { [txId: number]: number };
    } = {};
    for (const chainId in transactionJson) {
      const chainIdInt = chainId === "L1" ? 0 : 1;
      const transactionsJsonData =
        chainId === "L1" ? transactionJson.L1 : transactionJson.L2;
      initTransactionFeeLevels[chainIdInt] = {};
      initTransactionSpeedLevels[chainIdInt] = {};
      // Initialize all levels to -1
      for (const txId in transactionsJsonData) {
        initTransactionFeeLevels[chainIdInt][txId] = -1;
        initTransactionSpeedLevels[chainIdInt][txId] = -1;
      }
    }

    // Initialize dapp levels
    const initDappsUnlocked: { [chainId: number]: boolean } = {};
    const initDappFeeLevels: {
      [chainId: number]: { [dappId: number]: number };
    } = {};
    const initDappSpeedLevels: {
      [chainId: number]: { [dappId: number]: number };
    } = {};
    for (const chainId in dappsJson) {
      const chainIdInt = chainId === "L1" ? 0 : 1;
      const dappsJsonData =
        chainId === "L1"
          ? dappsJson.L1.transactions
          : dappsJson.L2.transactions;
      initDappFeeLevels[chainIdInt] = {};
      initDappSpeedLevels[chainIdInt] = {};
      // Initialize all levels to -1
      for (const dappId in dappsJsonData) {
        initDappFeeLevels[chainIdInt][dappId] = -1;
        initDappSpeedLevels[chainIdInt][dappId] = -1;
      }
      initDappsUnlocked[chainIdInt] = false;
    }

    set({
      transactionFeeLevels: initTransactionFeeLevels,
      transactionSpeedLevels: initTransactionSpeedLevels,
      dappFeeLevels: initDappFeeLevels,
      dappSpeedLevels: initDappSpeedLevels,
      dappsUnlocked: initDappsUnlocked,
    });
  },

  initializeTransactions: (
    powContract,
    user,
    getUserTxFeeLevels,
    getUserTxSpeedLevels,
    getUserDappsUnlocked,
  ) => {
    const fetchTransactionSpeeds = async () => {
      if (!user || !powContract) return;
      // TODO: Hardcoded chain ids
      const chainIds = [0, 1]; // L1 and L2
      const newFeeLevels = { ...get().transactionFeeLevels };
      const newSpeedLevels = { ...get().transactionSpeedLevels };
      const newDappFeeLevels = { ...get().dappFeeLevels };
      const newDappSpeedLevels = { ...get().dappSpeedLevels };
      const newDappsUnlocked = { ...get().dappsUnlocked };
      for (const chainId of chainIds) {
        /* TODO: Use foc engine?
        const events = await getUniqueEventsWith(
          powGameContractAddress,
          "pow_game::transactions::component::PowTransactionsComponent::TransactionSpeedLevelUpdated",
          "tx_type_id",
          { chain_id: chainId, user: user.account_address }
        );
        if (!events) {
          console.warn("No events found for chain", chainId);
          continue;
        }
        */
        const txJsonConfig =
          chainId === 0 ? transactionJson.L1 : transactionJson.L2;
        const maxTxId = txJsonConfig.length;
        const dappsJsonConfig =
          chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
        const maxDappId = dappsJsonConfig.length;
        const maxId = maxTxId + maxDappId; // Dapp IDs are offset by the number of transactions
        const txFeeLevels = await getUserTxFeeLevels(chainId, maxId);
        const txSpeedLevels = await getUserTxSpeedLevels(chainId, maxId);
        if (!txFeeLevels || !txSpeedLevels) {
          continue;
        }
        // Set the transaction levels
        if (!newFeeLevels[chainId]) {
          newFeeLevels[chainId] = {};
        }
        txFeeLevels.forEach((level, txId) => {
          if (txId < maxTxId) {
            newFeeLevels[chainId][txId] = level - 1; // -1 offset since 0 indexed
          }
        });
        if (!newSpeedLevels[chainId]) {
          newSpeedLevels[chainId] = {};
        }
        txSpeedLevels.forEach((level, txId) => {
          if (txId < maxTxId) {
            newSpeedLevels[chainId][txId] = level - 1; // -1 offset since 0 indexed
          }
        });
        if (!newDappFeeLevels[chainId]) {
          newDappFeeLevels[chainId] = {};
        }
        txFeeLevels.forEach((level, txId) => {
          if (txId >= maxTxId) {
            const dappId = txId - maxTxId; // Dapp IDs are offset by the number of transactions
            newDappFeeLevels[chainId][dappId] = level - 1; // -1 offset since 0 indexed
          }
        });
        if (!newDappSpeedLevels[chainId]) {
          newDappSpeedLevels[chainId] = {};
        }
        txSpeedLevels.forEach((level, txId) => {
          if (txId >= maxTxId) {
            const dappId = txId - maxTxId; // Dapp IDs are offset by the number of transactions
            newDappSpeedLevels[chainId][dappId] = level - 1; // -1 offset since 0 indexed
          }
        });
        // Check if dapps are unlocked
        const dappsUnlocked = await getUserDappsUnlocked(chainId);
        if (dappsUnlocked !== undefined) {
          newDappsUnlocked[chainId] = dappsUnlocked;
        }

        /* TODO: Use foc engine? */
      }
      set((state) => ({
        transactionFeeLevels: newFeeLevels,
        transactionSpeedLevels: newSpeedLevels,
        dappFeeLevels: newDappFeeLevels,
        dappSpeedLevels: newDappSpeedLevels,
        dappsUnlocked: newDappsUnlocked,
      }));
    };

    get().resetTransactions();
    // fetchTransactionLevels();
    fetchTransactionSpeeds();
  },

  txFeeUpgrade: (chainId, txId) => {
    set((state) => {
      if (!get().canUnlockTx(chainId, txId)) {
        useEventManager.getState().notify("InvalidPurchase");
        return { transactionFeeLevels: state.transactionFeeLevels };
      }
      const newFees = { ...state.transactionFeeLevels };
      if (!newFees[chainId]) {
        newFees[chainId] = {};
      }
      // Check if level already max
      const transactionJsonData =
        chainId === 0 ? transactionJson.L1 : transactionJson.L2;
      const transactionData = transactionJsonData.find((tx) => tx.id === txId);
      if (!transactionData) {
        console.warn(
          `Transaction with ID ${txId} not found for chain ${chainId}`,
        );
        return { transactionFeeLevels: newFees };
      }
      const currentLevel = newFees[chainId][txId];
      if (currentLevel >= transactionData.feeCosts.length - 1) {
        console.warn(
          `Transaction fee level already at max for transaction ID ${txId} on chain ${chainId}`,
        );
        return { transactionFeeLevels: newFees };
      }
      const cost = transactionData.feeCosts[currentLevel + 1];
      if (!useBalanceStore.getState().tryBuy(cost))
        return state.transactionFeeLevels;
      // Upgrade the fee level by 1
      newFees[chainId][txId] = currentLevel + 1;
      useEventManager.getState().notify("TxUpgradePurchased", {
        chainId,
        txId,
        isDapp: false,
        type: "txFee",
        level: currentLevel + 1,
      });
      return { transactionFeeLevels: newFees };
    });
  },

  txSpeedUpgrade: (chainId, txId) => {
    set((state) => {
      const newSpeeds = { ...state.transactionSpeedLevels };
      if (!newSpeeds[chainId]) {
        newSpeeds[chainId] = {};
      }
      // Check if level already max
      const transactionJsonData =
        chainId === 0 ? transactionJson.L1 : transactionJson.L2;
      const transactionData = transactionJsonData.find((tx) => tx.id === txId);
      if (!transactionData) {
        console.warn(
          `Transaction with ID ${txId} not found for chain ${chainId}`,
        );
        return { transactionSpeedLevels: newSpeeds };
      }
      const currentLevel = newSpeeds[chainId][txId];
      if (currentLevel >= transactionData.speedCosts.length - 1) {
        console.warn(
          `Transaction speed level already at max for transaction ID ${txId} on chain ${chainId}`,
        );
        return { transactionSpeedLevels: newSpeeds };
      }
      const cost = transactionData.speedCosts[currentLevel + 1];
      if (!useBalanceStore.getState().tryBuy(cost))
        return state.transactionSpeedLevels;
      // Upgrade the speed level by 1
      newSpeeds[chainId][txId] = currentLevel + 1;
      useEventManager.getState().notify("TxUpgradePurchased", {
        chainId,
        txId,
        isDapp: false,
        type: "txSpeed",
        level: currentLevel + 1,
      });
      return { transactionSpeedLevels: newSpeeds };
    });
  },

  dappFeeUpgrade: (chainId, dappId) => {
    set((state) => {
      if (!get().canUnlockDapp(chainId, dappId)) {
        useEventManager.getState().notify("InvalidPurchase");
        return { dappFeeLevels: state.dappFeeLevels };
      }
      const newFees = { ...state.dappFeeLevels };
      if (!newFees[chainId]) {
        newFees[chainId] = {};
      }
      // Check if level already max
      const dappsJsonData =
        chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
      const dappData = dappsJsonData.find((dapp) => dapp.id === dappId);
      if (!dappData) {
        console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
        return { dappFeeLevels: newFees };
      }
      const currentLevel = newFees[chainId][dappId];
      if (currentLevel >= dappData.feeCosts.length - 1) {
        console.warn(
          `Dapp fee level already at max for dapp ID ${dappId} on chain ${chainId}`,
        );
        return { dappFeeLevels: newFees };
      }
      const cost = dappData.feeCosts[currentLevel + 1];
      if (!useBalanceStore.getState().tryBuy(cost)) return state.dappFeeLevels;
      // Upgrade the fee level by 1
      newFees[chainId][dappId] = currentLevel + 1;
      useEventManager.getState().notify("TxUpgradePurchased", {
        chainId,
        txId: dappId,
        isDapp: true,
        type: "dappFee",
        level: currentLevel + 1,
      });
      return { dappFeeLevels: newFees };
    });
  },

  dappSpeedUpgrade: (chainId, dappId) => {
    set((state) => {
      const newSpeeds = { ...state.dappSpeedLevels };
      if (!newSpeeds[chainId]) {
        newSpeeds[chainId] = {};
      }
      // Check if level already max
      const dappsJsonData =
        chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
      const dappData = dappsJsonData.find((dapp) => dapp.id === dappId);
      if (!dappData) {
        console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
        return { dappSpeedLevels: newSpeeds };
      }
      const currentLevel = newSpeeds[chainId][dappId];
      if (currentLevel >= dappData.speedCosts.length - 1) {
        console.warn(
          `Dapp speed level already at max for dapp ID ${dappId} on chain ${chainId}`,
        );
        return { dappSpeedLevels: newSpeeds };
      }
      const cost = dappData.speedCosts[currentLevel + 1];
      if (!useBalanceStore.getState().tryBuy(cost))
        return state.dappSpeedLevels;
      // Upgrade the speed level by 1
      newSpeeds[chainId][dappId] = currentLevel + 1;
      useEventManager.getState().notify("TxUpgradePurchased", {
        chainId,
        txId: dappId,
        isDapp: true,
        type: "dappSpeed",
        level: currentLevel + 1,
      });
      return { dappSpeedLevels: newSpeeds };
    });
  },

  unlockDapps: (chainId) => {
    set((state) => {
      if (!get().canUnlockDapps(chainId)) {
        useEventManager.getState().notify("InvalidPurchase");
        return { dappsUnlocked: state.dappsUnlocked };
      }
      const cost = get().getDappUnlockCost(chainId);
      if (!useBalanceStore.getState().tryBuy(cost)) return state.dappsUnlocked;
      const newDappsUnlocked = { ...state.dappsUnlocked };
      newDappsUnlocked[chainId] = true;
      useEventManager.getState().notify("DappsPurchased", { chainId });
      return { dappsUnlocked: newDappsUnlocked };
    });
  },

  getFee: (chainId, txId, isDapp = false) => {
    if (isDapp) {
      return get().getDappFee(chainId, txId);
    }
    return get().getTransactionFee(chainId, txId);
  },

  getSpeed: (chainId, txId, isDapp = false) => {
    if (isDapp) {
      return get().getDappSpeed(chainId, txId);
    }
    return get().getTransactionSpeed(chainId, txId);
  },

  getTransactionFee: (chainId, txId) => {
    const txLevels = get().transactionFeeLevels[chainId];
    const transactionJsonData =
      chainId === 0 ? transactionJson.L1 : transactionJson.L2;
    const transactionData = transactionJsonData.find((tx) => tx.id === txId);
    if (!transactionData || txLevels[txId] === undefined) {
      console.warn(
        `Transaction with ID ${txId} not found for chain ${chainId}`,
      );
      return 0;
    }
    const level = txLevels[txId];
    const mevBoost = useUpgradesStore
      .getState()
      .getUpgradeValue(chainId, "MEV Boost");
    return level === -1 ? 0 : transactionData.fees[level] * mevBoost;
  },

  getTransactionSpeed: (chainId, txId) => {
    const txLevels = get().transactionSpeedLevels[chainId];
    const transactionJsonData =
      chainId === 0 ? transactionJson.L1 : transactionJson.L2;
    const transactionData = transactionJsonData.find((tx) => tx.id === txId);
    if (!transactionData || txLevels[txId] === undefined) {
      console.warn(
        `Transaction with ID ${txId} not found for chain ${chainId}`,
      );
      return 0;
    }
    const level = txLevels[txId];
    return level === -1 ? 0 : transactionData.speeds[level];
  },

  getDappFee: (chainId, dappId) => {
    const dappLevels = get().dappFeeLevels[chainId];
    const dappsJsonData =
      chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
    const dappData = dappsJsonData.find((dapp) => dapp.id === dappId);
    if (!dappData || dappLevels[dappId] === undefined) {
      console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
      return 0;
    }
    const level = dappLevels[dappId];
    const mevBoost = useUpgradesStore
      .getState()
      .getUpgradeValue(chainId, "MEV Boost");
    return level === -1 ? 0 : dappData.fees[level] * mevBoost;
  },

  getDappSpeed: (chainId, dappId) => {
    const dappLevels = get().dappSpeedLevels[chainId];
    const dappsJsonData =
      chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
    const dappData = dappsJsonData.find((dapp) => dapp.id === dappId);
    if (!dappData || dappLevels[dappId] === undefined) {
      console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
      return 0;
    }
    const level = dappLevels[dappId];
    return level === -1 ? 0 : dappData.speeds[level];
  },

  canUnlockDapps: (chainId) => {
    const txLevels = get().transactionFeeLevels[chainId];
    if (!txLevels) return false;
    // Check if all transactions are unlocked
    for (const level of Object.values(txLevels)) {
      if (level === -1) return false;
    }
    return true;
  },

  canUnlockTx: (chainId, txId, isDapp = false) => {
    if (isDapp) {
      return get().canUnlockDapp(chainId, txId);
    }
    if (txId === 0) return true; // Always can unlock the first transaction
    const txFees = get().transactionFeeLevels[chainId];
    const lastTxLevel = txFees[txId - 1];
    if (lastTxLevel === undefined) {
      console.warn(
        `Transaction with ID ${txId - 1} not found for chain ${chainId}`,
      );
      return false;
    }
    return lastTxLevel >= 0;
  },

  canUnlockDapp: (chainId, dappId) => {
    if (dappId === 0) return true; // Always can unlock the first dapp
    const dappFees = get().dappFeeLevels[chainId];
    const lastDappLevel = dappFees[dappId - 1];
    if (lastDappLevel === undefined) {
      console.warn(`Dapp with ID ${dappId - 1} not found for chain ${chainId}`);
      return false;
    }
    return lastDappLevel >= 0;
  },

  getFeeLevel: (chainId, txId, isDapp = false) => {
    if (isDapp) {
      const dappLevels = get().dappFeeLevels[chainId];
      return dappLevels[txId] ?? -1;
    }
    const txLevels = get().transactionFeeLevels[chainId];
    return txLevels[txId] ?? -1;
  },

  getSpeedLevel: (chainId, txId, isDapp = false) => {
    if (isDapp) {
      const dappLevels = get().dappSpeedLevels[chainId];
      return dappLevels[txId] ?? -1;
    }
    const txLevels = get().transactionSpeedLevels[chainId];
    return txLevels[txId] ?? -1;
  },

  getDappUnlockCost: (chainId) => {
    return chainId === 0
      ? unlocksConfig.dapps.L1.cost
      : unlocksConfig.dapps.L2.cost;
  },

  getNextFeeCost: (chainId, txId, isDapp = false) => {
    if (isDapp) {
      return get().getNextDappFeeCost(chainId, txId);
    }
    return get().getNextTxFeeCost(chainId, txId);
  },

  getNextSpeedCost: (chainId, txId, isDapp = false) => {
    if (isDapp) {
      return get().getNextDappSpeedCost(chainId, txId);
    }
    return get().getNextTxSpeedCost(chainId, txId);
  },

  getNextTxFeeCost: (chainId, txId) => {
    const txLevels = get().transactionFeeLevels[chainId];
    const transactionJsonData =
      chainId === 0 ? transactionJson.L1 : transactionJson.L2;
    const transactionData = transactionJsonData.find((tx) => tx.id === txId);
    if (!transactionData || txLevels[txId] === undefined) {
      console.warn(
        `Transaction with ID ${txId} not found for chain ${chainId}`,
      );
      return 0;
    }
    const level = txLevels[txId];
    return transactionData.feeCosts[level + 1] || 0;
  },

  getNextTxSpeedCost: (chainId, txId) => {
    const txLevels = get().transactionSpeedLevels[chainId];
    const transactionJsonData =
      chainId === 0 ? transactionJson.L1 : transactionJson.L2;
    const transactionData = transactionJsonData.find((tx) => tx.id === txId);
    if (!transactionData || txLevels[txId] === undefined) {
      console.warn(
        `Transaction with ID ${txId} not found for chain ${chainId}`,
      );
      return 0;
    }
    const level = txLevels[txId];
    return transactionData.speedCosts[level + 1] || 0;
  },

  getNextDappFeeCost: (chainId, dappId) => {
    const dappLevels = get().dappFeeLevels[chainId];
    const dappsJsonData =
      chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
    const dappData = dappsJsonData.find((dapp) => dapp.id === dappId);
    if (!dappData || dappLevels[dappId] === undefined) {
      console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
      return 0;
    }
    const level = dappLevels[dappId];
    return dappData.feeCosts[level + 1] || 0;
  },

  getNextDappSpeedCost: (chainId, dappId) => {
    const dappLevels = get().dappSpeedLevels[chainId];
    const dappsJsonData =
      chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
    const dappData = dappsJsonData.find((dapp) => dapp.id === dappId);
    if (!dappData || dappLevels[dappId] === undefined) {
      console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
      return 0;
    }
    const level = dappLevels[dappId];
    return dappData.speedCosts[level + 1] || 0;
  },
}));
