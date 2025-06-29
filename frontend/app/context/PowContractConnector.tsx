import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { Call, Contract } from "starknet";
import { useStarknetConnector } from "./StarknetConnector";
import { useFocEngine } from "./FocEngineConnector";

export type PowAction = {
  contract?: string; // Contract address
  action: string; // Contract action function name
  args: any[]; // Calldata
};

type PowContractContextType = {
  powGameContractAddress: string | null;
  powContract: Contract | null;

  initMyGame: () => Promise<void>;
  addAction: (action: PowAction) => void;

  getUserBalance: () => Promise<number | undefined>;
  getUserTxFeeLevels: (
    chainId: number,
    txCount: number,
  ) => Promise<number[] | undefined>;
  getUserTxSpeedLevels: (
    chainId: number,
    txCount: number,
  ) => Promise<number[] | undefined>;
  getUserUpgradeLevels: (
    chainId: number,
    upgradeCount: number,
  ) => Promise<number[] | undefined>;
  getUserAutomationLevels: (
    chainId: number,
    automationCount: number,
  ) => Promise<number[] | undefined>;
};

export const MAX_ACTIONS = Number(process.env.EXPO_PUBLIC_MAX_ACTIONS) || 10;

const PowContractConnector = createContext<PowContractContextType | undefined>(
  undefined,
);

export const usePowContractConnector = () => {
  const context = useContext(PowContractConnector);
  if (!context) {
    throw new Error(
      "usePowContractConnector must be used within a PowContractProvider",
    );
  }
  return context;
};

export const PowContractProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    deployAccount,
    generateAccountAddress,
    invokeContractCalls,
    invokeWithPaymaster,
    generatePrivateKey,
    STARKNET_ENABLED,
    network,
    storePrivateKey,
    provider,
    account,
  } = useStarknetConnector();
  const { getRegisteredContract, mintFunds, connectContract } = useFocEngine();

  const [powGameContractAddress, setPowGameContractAddress] = useState<
    string | null
  >(null);
  const [powContract, setPowContract] = useState<Contract | null>(null);
  const [actionCalls, setActionCalls] = useState<Call[]>([]);

  useEffect(() => {
    if (!STARKNET_ENABLED) {
      return;
    }
    async function fetchPowGameContractAddress() {
      if (!provider) {
        return;
      }
      const contract = await getRegisteredContract("Pow Game", "v0.0.1"); // TODO: latest
      if (contract) {
        setPowGameContractAddress(contract);
        connectContract(contract); // TODO: Allow getRegisteredContract args
        const { abi: powGameAbi } = await provider.getClassAt(contract);
        if (powGameAbi) {
          const powGameContract = new Contract(powGameAbi, contract, provider);
          setPowContract(powGameContract);
        } else {
          console.error("Failed to fetch Pow Game ABI");
        }
      } else {
        console.error("Failed to fetch pow_game contract address");
      }
    }
    fetchPowGameContractAddress();
  }, [getRegisteredContract, provider, STARKNET_ENABLED]);

  useEffect(() => {
    if (!STARKNET_ENABLED || !account) {
      return;
    }
    if (!powContract) {
      return;
    }
    powContract.connect(account);
  }, [account, powContract, STARKNET_ENABLED]);

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
      // TODO: Invoke like else statement with account deployment
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
  }, [
    powGameContractAddress,
    invokeWithPaymaster,
    network,
    deployAccount,
    generateAccountAddress,
    generatePrivateKey,
    invokeContractCalls,
    mintFunds,
    STARKNET_ENABLED,
  ]);

  const addAction = useCallback(
    (action: PowAction) => {
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
    },
    [powGameContractAddress],
  );

  const getUserBalance = useCallback(async () => {
    if (!STARKNET_ENABLED || !powContract) {
      return;
    }
    try {
      const balance = await powContract.get_user_balance(
        account?.address || "",
      );
      return balance.toString ? parseInt(balance.toString(), 10) : undefined;
    } catch (error) {
      console.error("Failed to fetch user balance:", error);
      return undefined;
    }
  }, [account, powContract, STARKNET_ENABLED]);

  const getUserTxFeeLevels = useCallback(
    async (chainId: number, txCount: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const feeLevels = await powContract.get_user_transaction_fee_levels(
          account?.address || "",
          chainId,
          txCount,
        );
        return feeLevels.map((level: any) =>
          level.toString ? parseInt(level.toString(), 10) : undefined,
        );
      } catch (error) {
        console.error("Failed to fetch user transaction fee levels:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserTxSpeedLevels = useCallback(
    async (chainId: number, txCount: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const speedLevels = await powContract.get_user_transaction_speed_levels(
          account?.address || "",
          chainId,
          txCount,
        );
        return speedLevels.map((level: any) =>
          level.toString ? parseInt(level.toString(), 10) : undefined,
        );
      } catch (error) {
        console.error("Failed to fetch user transaction speed levels:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserUpgradeLevels = useCallback(
    async (chainId: number, upgradeCount: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const upgradeLevels = await powContract.get_user_upgrade_levels(
          account?.address || "",
          chainId,
          upgradeCount,
        );
        return upgradeLevels.map((level: any) =>
          level.toString ? parseInt(level.toString(), 10) : undefined,
        );
      } catch (error) {
        console.error("Failed to fetch user upgrade levels:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserAutomationLevels = useCallback(
    async (chainId: number, automationCount: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const automationLevels = await powContract.get_user_automation_levels(
          account?.address || "",
          chainId,
          automationCount,
        );
        return automationLevels.map((level: any) =>
          level.toString ? parseInt(level.toString(), 10) : undefined,
        );
      } catch (error) {
        console.error("Failed to fetch user automation levels:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  useEffect(() => {
    if (actionCalls.length >= MAX_ACTIONS) {
      const invokeActions = actionCalls.slice(0, MAX_ACTIONS);
      const remainingActions = actionCalls.slice(MAX_ACTIONS);
      console.log("Invoking contract calls:", invokeActions.length);
      setActionCalls(remainingActions);
      if (network === "SN_DEVNET") {
        invokeContractCalls(invokeActions);
      } else {
        invokeWithPaymaster(invokeActions);
      }
    }
  }, [
    actionCalls,
    invokeWithPaymaster,
    invokeContractCalls,
    network,
    STARKNET_ENABLED,
  ]);

  return (
    <PowContractConnector.Provider
      value={{
        powGameContractAddress,
        initMyGame,
        addAction,
        getUserBalance,
        powContract,
        getUserTxFeeLevels,
        getUserTxSpeedLevels,
        getUserUpgradeLevels,
        getUserAutomationLevels,
      }}
    >
      {children}
    </PowContractConnector.Provider>
  );
};
