import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { Call } from "starknet";
import { useStarknetConnector } from "./StarknetConnector";
import { useFocEngine } from "./FocEngineConnector";

export type PowAction = {
  contract?: string; // Contract address
  action: string; // Contract action function name
  args: any[]; // Calldata
}

type PowContractContextType = {
  powGameContractAddress: string | null;

  initMyGame: () => Promise<void>;
  addAction: (action: PowAction) => void;
}

export const MAX_ACTIONS = Number(process.env.EXPO_PUBLIC_MAX_ACTIONS) || 10;

const PowContractConnector = createContext<PowContractContextType | undefined>(undefined);

export const usePowContractConnector = () => {
  const context = useContext(PowContractConnector);
  if (!context) {
    throw new Error("usePowContractConnector must be used within a PowContractProvider");
  }
  return context;
};

export const PowContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { deployAccount, generateAccountAddress, invokeContractCalls, invokeWithPaymaster, generatePrivateKey, STARKNET_ENABLED, network, storePrivateKey } = useStarknetConnector();
  const { getRegisteredContract, mintFunds } = useFocEngine();

  const [powGameContractAddress, setPowGameContractAddress] = useState<string | null>(null);
  const [actionCalls, setActionCalls] = useState<Call[]>([]);

  useEffect(() => {
    if (!STARKNET_ENABLED) {
      return;
    }
    async function fetchPowGameContractAddress() {
      const contract = await getRegisteredContract("Pow Game", "v0.0.1"); // TODO: latest
      if (contract) {
        setPowGameContractAddress(contract);
      } else {
        console.error("Failed to fetch pow_game contract address");
      }
    }
    fetchPowGameContractAddress();
  }, [getRegisteredContract]);

  const initMyGame = useCallback(async () => {
    if (!STARKNET_ENABLED) {
      return;
    }
    if (!powGameContractAddress) {
      console.error("powGameContractAddress is not set");
      return;
    }

    const privateKey = generatePrivateKey();
    console.log("Initializing my game...");
    if (network === "SN_DEVNET") {
      const accountAddress = generateAccountAddress(privateKey, "devnet");
      await mintFunds(accountAddress, 10n ** 20n); // Mint 1000 ETH
      deployAccount(privateKey, "devnet");
      storePrivateKey(privateKey, "pow_game", "devnet");
      addAction({
        contract: powGameContractAddress,
        action: "init_my_game",
        args: [],
      });
    } else {
      const initMyGameCall: Call = {
        contractAddress: powGameContractAddress,
        entrypoint: "init_my_game",
        calldata: [],
      };
      invokeWithPaymaster([initMyGameCall], privateKey);
      storePrivateKey(privateKey, "pow_game");
    }
  }, [powGameContractAddress, invokeWithPaymaster, network, deployAccount, generateAccountAddress, generatePrivateKey, invokeContractCalls, mintFunds, STARKNET_ENABLED]);

  const addAction = useCallback((action: PowAction) => {
    if (!STARKNET_ENABLED) {
      return;
    }
    if (!action.contract && !powGameContractAddress) {
      console.error("powGameContractAddress is not set");
      return;
    }
    const actionCall: Call = {
      contractAddress: action.contract || powGameContractAddress!,
      entrypoint: action.action,
      calldata: action.args,
    };
    setActionCalls((prevCalls) => [...prevCalls, actionCall]);
  }, [powGameContractAddress]);

  useEffect(() => {
    if (actionCalls.length >= MAX_ACTIONS) {
      const invokeActions = actionCalls.slice(0, MAX_ACTIONS);
      const remainingActions = actionCalls.slice(MAX_ACTIONS);
      console.log("Invoking contract calls:", invokeActions.length);
      setActionCalls(remainingActions);
      if (network === "SN_DEVNET") {
        invokeContractCalls(invokeActions);
      } else {
        invokeWithPaymaster(invokeActions)
      }
    }
  }, [actionCalls, invokeWithPaymaster, invokeContractCalls, network, STARKNET_ENABLED]);

  return (
    <PowContractConnector.Provider value={{ powGameContractAddress, initMyGame, addAction }}>
      {children}
    </PowContractConnector.Provider>
  );
};
