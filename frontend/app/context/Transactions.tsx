import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useEventManager } from "../context/EventManager";
import { useFocEngine } from "./FocEngineConnector";
import { usePowContractConnector } from "./PowContractConnector";
import { useBalance } from "../context/Balance";
import { useUpgrades } from "../context/Upgrades";
import transactionJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";

type TransactionsContextType = {
  // Map: chainId -> txId -> Tx Fee Level
  transactionFees: { [chainId: number]: { [txId: number]: number } };
  // Map: chainId -> txId -> Tx Speed Level
  transactionSpeeds: { [chainId: number]: { [txId: number]: number } };
  // Map: chainId -> dappId -> Dapp Fee Level
  dappFees: { [chainId: number]: { [dappId: number]: number } };
  // Map: chainId -> dappId -> Dapp Speed Level
  dappSpeeds: { [chainId: number]: { [dappId: number]: number } };
  // Map: chainId -> boolean indicating if dapps are unlocked
  dappsUnlocked: { [chainId: number]: boolean };

  txFeeUpgrade: (chainId: number, txId: number) => void;
  txSpeedUpgrade: (chainId: number, txId: number) => void;
  dappFeeUpgrade: (chainId: number, dappId: number) => void;
  dappSpeedUpgrade: (chainId: number, dappId: number) => void;
  unlockDapps: (chainId: number) => void;

  getTransactionFee: (chainId: number, txId: number) => number;
  getTransactionSpeed: (chainId: number, txId: number) => number;
  getDappFee: (chainId: number, dappId: number) => number;
  getDappSpeed: (chainId: number, dappId: number) => number;
  getDappUnlockCost: (chainId: number) => number;

  getNextTxFeeCost: (chainId: number, txId: number) => number;
  getNextTxSpeedCost: (chainId: number, txId: number) => number;
  getNextDappFeeCost: (chainId: number, dappId: number) => number;
  getNextDappSpeedCost: (chainId: number, dappId: number) => number;
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions must be used within a TransactionsProvider");
  }
  return context;
}
const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tryBuy } = useBalance();
  const { user, getUniqueEventsWith } = useFocEngine();
  const { powGameContractAddress } = usePowContractConnector();
  const { getUpgradeValue } = useUpgrades();

  const [transactionFees, setTransactionFees] = useState<{ [chainId: number]: { [txId: number]: number } }>({});
  const [transactionSpeeds, setTransactionSpeeds] = useState<{ [chainId: number]: { [txId: number]: number } }>({});
  const [dappFees, setDappFees] = useState<{ [chainId: number]: { [dappId: number]: number } }>({});
  const [dappSpeeds, setDappSpeeds] = useState<{ [chainId: number]: { [dappId: number]: number } }>({});
  const [dappsUnlocked, setDappsUnlocked] = useState<{ [chainId: number]: boolean }>({});

  const { notify } = useEventManager();

  const resetTransactions = () => {
    // Initialize transaction levels
    const initTransactionFees: { [chainId: number]: { [txId: number]: number } } = {};
    const initTransactionSpeeds: { [chainId: number]: { [txId: number]: number } } = {};
    for (const chainId in transactionJson) {
      const chainIdInt = chainId === "L1" ? 0 : 1;
      const transactionsJsonData = chainId === "L1" ? transactionJson.L1 : transactionJson.L2;
      initTransactionFees[chainIdInt] = {};
      initTransactionSpeeds[chainIdInt] = {};
      // Initialize all levels to -1
      for (const txId in transactionsJsonData) {
        initTransactionFees[chainIdInt][txId] = -1;
        initTransactionSpeeds[chainIdInt][txId] = -1;
      }
    }
    setTransactionFees(initTransactionFees);
    setTransactionSpeeds(initTransactionSpeeds);

    // Initialize dapp levels
    const initDappsUnlocked: { [chainId: number]: boolean } = {};
    const initDappFees: { [chainId: number]: { [dappId: number]: number } } = {};
    const initDappSpeeds: { [chainId: number]: { [dappId: number]: number } } = {};
    for (const chainId in dappsJson) {
      const chainIdInt = chainId === "L1" ? 0 : 1;
      const dappsJsonData = chainId === "L1" ? dappsJson.L1.transactions : dappsJson.L2.transactions;
      initDappFees[chainIdInt] = {};
      initDappSpeeds[chainIdInt] = {};
      // Initialize all levels to -1
      for (const dappId in dappsJsonData) {
        initDappFees[chainIdInt][dappId] = -1;
        initDappSpeeds[chainIdInt][dappId] = -1;
      }
      initDappsUnlocked[chainIdInt] = false;
    }
    setDappsUnlocked(initDappsUnlocked);
    setDappFees(initDappFees);
    setDappSpeeds(initDappSpeeds);
  };

  useEffect(() => {
    const fetchTransactionLevels = async () => {
      if (!user) return;
      if (!powGameContractAddress) return;
      // TODO: Hardcoded chain ids
      const chainIds = [0, 1]; // L1 and L2
      for (const chainId of chainIds) {
        const events = await getUniqueEventsWith(
          powGameContractAddress,
          "pow_game::transactions::component::PowTransactionsComponent::TransactionFeeLevelUpdated",
          "tx_type_id",
          { chain_id: chainId, user: user.account_address }
        );
        if (!events) {
          console.warn("No events found for chain", chainId);
          continue;
        }
        const txJsonConfig = chainId === 0 ? transactionJson.L1 : transactionJson.L2;
        const maxTxId = txJsonConfig.length - 1;
        const transactionFeesLevels: { txId: number; level: number }[] = [];
        const dappFeesLevels: { txId: number; level: number }[] = [];
        events.forEach((event: any) => {
          if (event.tx_type_id > maxTxId) {
            // Dapp event
            const dappId = event.tx_type_id - maxTxId - 1; // Dapp IDs are offset by the number of transactions
            const level = event.new_level;
            dappFeesLevels.push({ txId: dappId, level });
          } else {
            // Transaction event
            const txId = event.tx_type_id;
            const level = event.new_level;
            transactionFeesLevels.push({ txId, level });
          }
        });
        // Set the transaction levels
        setTransactionFees((prevFees) => {
          const newFees = { ...prevFees };
          if (!newFees[chainId]) {
            newFees[chainId] = {};
          }
          transactionFeesLevels.forEach(({ txId, level }) => {
            newFees[chainId][txId] = level - 1; // -1 offset since 0 indexed 
          });
          return newFees;
        });
        // Set the dapp levels
        setDappFees((prevFees) => {
          const newFees = { ...prevFees };
          if (!newFees[chainId]) {
            newFees[chainId] = {};
          }
          dappFeesLevels.forEach(({ txId, level }) => {
            newFees[chainId][txId] = level - 1; // -1 offset since 0 indexed 
          });
          return newFees;
        });
      }
    };

    const fetchTransactionSpeeds = async () => {
      if (!user) return;
      if (!powGameContractAddress) return;
      // TODO: Hardcoded chain ids
      const chainIds = [0, 1]; // L1 and L2
      for (const chainId of chainIds) {
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
        const txJsonConfig = chainId === 0 ? transactionJson.L1 : transactionJson.L2;
        const maxTxId = txJsonConfig.length - 1;
        const transactionSpeedsLevels: { txId: number; level: number }[] = [];
        const dappSpeedsLevels: { txId: number; level: number }[] = [];
        events.forEach((event: any) => {
          if (event.tx_type_id > maxTxId) {
            // Dapp event
            const dappId = event.tx_type_id - maxTxId - 1; // Dapp IDs are offset by the number of transactions
            const level = event.new_level;
            dappSpeedsLevels.push({ txId: dappId, level });
          } else {
            // Transaction event
            const txId = event.tx_type_id;
            const level = event.new_level;
            transactionSpeedsLevels.push({ txId, level });
          }
        });
        // Set the transaction levels
        setTransactionSpeeds((prevSpeeds) => {
          const newSpeeds = { ...prevSpeeds };
          if (!newSpeeds[chainId]) {
            newSpeeds[chainId] = {};
          }
          transactionSpeedsLevels.forEach(({ txId, level }) => {
            newSpeeds[chainId][txId] = level - 1; // -1 offset since 0 indexed 
          });
          return newSpeeds;
        });
        // Set the dapp levels
        setDappSpeeds((prevSpeeds) => {
          const newSpeeds = { ...prevSpeeds };
          if (!newSpeeds[chainId]) {
            newSpeeds[chainId] = {};
          }
          dappSpeedsLevels.forEach(({ txId, level }) => {
            newSpeeds[chainId][txId] = level - 1; // -1 offset since 0 indexed 
          });
          return newSpeeds;
        });
      }
    };

    resetTransactions();
    fetchTransactionLevels();
    fetchTransactionSpeeds();
  }, [user, powGameContractAddress, getUniqueEventsWith]);

  const txFeeUpgrade = (chainId: number, txId: number) => {
    setTransactionFees((prevFees) => {
      const newFees = { ...prevFees };
      if (!newFees[chainId]) {
        newFees[chainId] = {};
      }
      // Check if level already max
      const transactionJsonData = chainId === 0 ? transactionJson.L1 : transactionJson.L2;
      const transactionData = transactionJsonData.find(tx => tx.id === txId);
      if (!transactionData) {
        console.warn(`Transaction with ID ${txId} not found for chain ${chainId}`);
        return newFees;
      }
      const currentLevel = newFees[chainId][txId];
      if (currentLevel >= transactionData.feeCosts.length - 1) {
        console.warn(`Transaction fee level already at max for transaction ID ${txId} on chain ${chainId}`);
        return newFees;
      }
      const cost = transactionData.feeCosts[currentLevel + 1];
      if(!tryBuy(cost)) return prevFees;
      // Upgrade the fee level by 1
      newFees[chainId][txId] = currentLevel + 1;
      notify("TxUpgradePurchased", { chainId, txId, isDapp: false, type: "txFee", level: currentLevel + 1 });
      return newFees;
    });
  };

  const txSpeedUpgrade = (chainId: number, txId: number) => {
    setTransactionSpeeds((prevSpeeds) => {
      const newSpeeds = { ...prevSpeeds };
      if (!newSpeeds[chainId]) {
        newSpeeds[chainId] = {};
      }
      // Check if level already max
      const transactionJsonData = chainId === 0 ? transactionJson.L1 : transactionJson.L2;
      const transactionData = transactionJsonData.find(tx => tx.id === txId);
      if (!transactionData) {
        console.warn(`Transaction with ID ${txId} not found for chain ${chainId}`);
        return newSpeeds;
      }
      const currentLevel = newSpeeds[chainId][txId];
      if (currentLevel >= transactionData.speedCosts.length - 1) {
        console.warn(`Transaction speed level already at max for transaction ID ${txId} on chain ${chainId}`);
        return newSpeeds;
      }
      const cost = transactionData.speedCosts[currentLevel + 1];
      if(!tryBuy(cost)) return prevSpeeds;
      // Upgrade the speed level by 1
      newSpeeds[chainId][txId] = currentLevel + 1;
      notify("TxUpgradePurchased", { chainId, txId, isDapp: false, type: "txSpeed", level: currentLevel + 1 });
      return newSpeeds;
    });
  };

  const dappFeeUpgrade = (chainId: number, dappId: number) => {
    setDappFees((prevFees) => {
      const newFees = { ...prevFees };
      if (!newFees[chainId]) {
        newFees[chainId] = {};
      }
      // Check if level already max
      const dappsJsonData = chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
      const dappData = dappsJsonData.find(dapp => dapp.id === dappId);
      if (!dappData) {
        console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
        return newFees;
      }
      const currentLevel = newFees[chainId][dappId];
      if (currentLevel >= dappData.feeCosts.length - 1) {
        console.warn(`Dapp fee level already at max for dapp ID ${dappId} on chain ${chainId}`);
        return newFees;
      }
      const cost = dappData.feeCosts[currentLevel + 1];
      if(!tryBuy(cost)) return prevFees;
      // Upgrade the fee level by 1
      newFees[chainId][dappId] = currentLevel + 1;
      notify("TxUpgradePurchased", { chainId, txId: dappId, isDapp: true, type: "dappFee", level: currentLevel + 1 });
      return newFees;
    });
  };

  const dappSpeedUpgrade = (chainId: number, dappId: number) => {
    setDappSpeeds((prevSpeeds) => {
      const newSpeeds = { ...prevSpeeds };
      if (!newSpeeds[chainId]) {
        newSpeeds[chainId] = {};
      }
      // Check if level already max
      const dappsJsonData = chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
      const dappData = dappsJsonData.find(dapp => dapp.id === dappId);
      if (!dappData) {
        console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
        return newSpeeds;
      }
      const currentLevel = newSpeeds[chainId][dappId];
      if (currentLevel >= dappData.speedCosts.length - 1) {
        console.warn(`Dapp speed level already at max for dapp ID ${dappId} on chain ${chainId}`);
        return newSpeeds;
      }
      const cost = dappData.speedCosts[currentLevel + 1];
      if(!tryBuy(cost)) return prevSpeeds;
      // Upgrade the speed level by 1
      newSpeeds[chainId][dappId] = currentLevel + 1;
      notify("TxUpgradePurchased", { chainId, txId: dappId, isDapp: true, type: "dappSpeed", level: currentLevel + 1});
      return newSpeeds;
    });
  };

  const unlockDapps = (chainId: number) => {
    setDappsUnlocked((prevUnlocked) => {
      const cost = getDappUnlockCost(chainId);
      if(!tryBuy(cost)) return prevUnlocked;
      const newUnlocked = { ...prevUnlocked };
      newUnlocked[chainId] = true;
      notify("DappsPurchased", { chainId });
      return newUnlocked;
    });
  };

  const getTransactionFee = useCallback((chainId: number, txId: number) => {
    const txFees = transactionFees[chainId] || {};
    const transactionJsonData = chainId === 0 ? transactionJson.L1 : transactionJson.L2;
    const transactionData = transactionJsonData.find(tx => tx.id === txId);
    if (!transactionData || txFees[txId] === undefined) {
      console.warn(`Transaction with ID ${txId} not found for chain ${chainId}`);
      return 0;
    }
    const level = txFees[txId];
    const mevBoost = getUpgradeValue(chainId, "MEV Boost");
    return level === -1 ? 0 : transactionData.fees[level] * mevBoost;
  }, [transactionFees, getUpgradeValue]);

  const getTransactionSpeed = useCallback((chainId: number, txId: number) => {
    const txSpeeds = transactionSpeeds[chainId] || {};
    const transactionJsonData = chainId === 0 ? transactionJson.L1 : transactionJson.L2;
    const transactionData = transactionJsonData.find(tx => tx.id === txId);
    if (!transactionData || txSpeeds[txId] === undefined) {
      console.warn(`Transaction with ID ${txId} not found for chain ${chainId}`);
      return 0;
    }
    const level = txSpeeds[txId];
    return level === -1 ? 0 : transactionData.speeds[level];
  }, [transactionSpeeds]);

  const getDappFee = useCallback((chainId: number, dappId: number) => {
    const dappFeesLevels = dappFees[chainId] || {};
    const dappsJsonData = chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
    const dappData = dappsJsonData.find(dapp => dapp.id === dappId);
    if (!dappData || dappFeesLevels[dappId] === undefined) {
      console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
      return 0;
    }
    const level = dappFeesLevels[dappId];
    const mevBoost = getUpgradeValue(chainId, "MEV Boost");
    return level === -1 ? 0 : dappData.fees[level] * mevBoost;
  }, [dappFees, getUpgradeValue]);

  const getDappSpeed = useCallback((chainId: number, dappId: number) => {
    const dappSpeedLevels = dappSpeeds[chainId] || {};
    const dappsJsonData = chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
    const dappData = dappsJsonData.find(dapp => dapp.id === dappId);
    if (!dappData || dappSpeedLevels[dappId] === undefined) {
      console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
      return 0;
    }
    const level = dappSpeedLevels[dappId];
    return level === -1 ? 0 : dappData.speeds[level];
  }, [dappSpeeds]);

  const getDappUnlockCost = (chainId: number) => {
    const dappsJsonCost = chainId === 0 ? dappsJson.L1.cost : dappsJson.L2.cost;
    return dappsJsonCost;
  }

  const getNextTxFeeCost = useCallback((chainId: number, txId: number) => {
    const txFees = transactionFees[chainId] || {};
    const transactionJsonData = chainId === 0 ? transactionJson.L1 : transactionJson.L2;
    const transactionData = transactionJsonData.find(tx => tx.id === txId);
    if (!transactionData || txFees[txId] === undefined) {
      console.warn(`Transaction with ID ${txId} not found for chain ${chainId}`);
      return 0;
    }
    const level = txFees[txId];
    return transactionData.feeCosts[level + 1] || 0;
  }, [transactionFees]);

  const getNextTxSpeedCost = useCallback((chainId: number, txId: number) => {
    const txSpeeds = transactionSpeeds[chainId] || {};
    const transactionJsonData = chainId === 0 ? transactionJson.L1 : transactionJson.L2;
    const transactionData = transactionJsonData.find(tx => tx.id === txId);
    if (!transactionData || txSpeeds[txId] === undefined) {
      console.warn(`Transaction with ID ${txId} not found for chain ${chainId}`);
      return 0;
    }
    const level = txSpeeds[txId];
    return transactionData.speedCosts[level + 1] || 0;
  }, [transactionSpeeds]);

  const getNextDappFeeCost = useCallback((chainId: number, dappId: number) => {
    const dappFeesLevels = dappFees[chainId] || {};
    const dappsJsonData = chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
    const dappData = dappsJsonData.find(dapp => dapp.id === dappId);
    if (!dappData || dappFeesLevels[dappId] === undefined) {
      console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
      return 0;
    }
    const level = dappFeesLevels[dappId];
    return dappData.feeCosts[level + 1] || 0;
  }, [dappFees]);

  const getNextDappSpeedCost = useCallback((chainId: number, dappId: number) => {
    const dappSpeedLevels = dappSpeeds[chainId] || {};
    const dappsJsonData = chainId === 0 ? dappsJson.L1.transactions : dappsJson.L2.transactions;
    const dappData = dappsJsonData.find(dapp => dapp.id === dappId);
    if (!dappData || dappSpeedLevels[dappId] === undefined) {
      console.warn(`Dapp with ID ${dappId} not found for chain ${chainId}`);
      return 0;
    }
    const level = dappSpeedLevels[dappId];
    return dappData.speedCosts[level + 1] || 0;
  }, [dappSpeeds]);

  return (
    <TransactionsContext.Provider
      value={{
        transactionFees, transactionSpeeds, dappFees, dappSpeeds,
        txFeeUpgrade, txSpeedUpgrade, dappFeeUpgrade, dappSpeedUpgrade,
        dappsUnlocked, unlockDapps, getDappUnlockCost,
        getTransactionFee, getTransactionSpeed, getDappFee, getDappSpeed,
        getNextTxFeeCost, getNextTxSpeedCost, getNextDappFeeCost, getNextDappSpeedCost
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}
