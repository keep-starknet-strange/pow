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
import { useOnchainActions } from "../stores/useOnchainActions";

type PowContractContextType = {
  powGameContractAddress: string | null;
  powContract: Contract | null;

  createGameAccount: () => Promise<void>;
  initMyGame: () => Promise<void>;

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
  getUserBlockNumber: (chainId: number) => Promise<number | undefined>;
  getUserBlockState: (
    chainId: number,
  ) => Promise<
    { size: number | undefined; fees: number | undefined } | undefined
  >;
  getUserMaxChainId: () => Promise<number | undefined>;
  getUserBlockClicks: (chainId: number) => Promise<number | undefined>;
  getUserDaClicks: (chainId: number) => Promise<number | undefined>;
  getUserProofClicks: (chainId: number) => Promise<number | undefined>;
};

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
  const { addAction } = useOnchainActions();

  const [powGameContractAddress, setPowGameContractAddress] = useState<
    string | null
  >(null);
  const [powContract, setPowContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (!STARKNET_ENABLED) {
      return;
    }
    async function fetchPowGameContractAddress() {
      if (!provider) {
        return;
      }
      // TODO: Use foc-engine API to get contract addresses
      // const contract = await getRegisteredContract("Pow Game", "v0.0.1"); // TODO: latest
      const contract = process.env.EXPO_PUBLIC_POW_GAME_CONTRACT_ADDRESS;
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

  const createGameAccount = useCallback(async () => {
    if (!STARKNET_ENABLED) {
      return;
    }

    const privateKey = generatePrivateKey();
    console.log("Creating game account...");
    if (network === "SN_DEVNET") {
      const accountAddress = generateAccountAddress(privateKey, "devnet");
      await mintFunds(accountAddress, 10n ** 20n); // Mint 1000 ETH
      deployAccount(privateKey, "devnet");
      storePrivateKey(privateKey, "pow_game", "devnet");
    } else {
      const initializeAccountCall: Call = {
        contractAddress: powGameContractAddress!,
        entrypoint: "get_genesis_block_reward",
        calldata: [],
      };
      invokeWithPaymaster([initializeAccountCall], privateKey);
      storePrivateKey(privateKey, "pow_game");
    }
  }, [
    invokeWithPaymaster,
    generatePrivateKey,
    generateAccountAddress,
    deployAccount,
    mintFunds,
    powGameContractAddress,
    network,
    STARKNET_ENABLED,
  ]);


  const initMyGame = useCallback(async () => {
    if (!STARKNET_ENABLED) {
      return;
    }
    if (!powGameContractAddress) {
      console.error("powGameContractAddress is not set");
      return;
    }

    if (network === "SN_DEVNET") {
      // TODO: Invoke like else statement with account deployment
      const initMyGameCall: Call = {
        contractAddress: powGameContractAddress,
        entrypoint: "init_my_game",
        calldata: [],
      };
      addAction(initMyGameCall);
    } else {
      const initMyGameCall: Call = {
        contractAddress: powGameContractAddress,
        entrypoint: "init_my_game",
        calldata: [],
      };
      invokeWithPaymaster([initMyGameCall]);
    }
  }, [
    powGameContractAddress,
    invokeWithPaymaster,
    addAction,
    network,
    STARKNET_ENABLED,
  ]);

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

  const getUserBlockNumber = useCallback(
    async (chainId: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const blockNumber = await powContract.get_block_building_height(
          account?.address || "",
          chainId,
        );
        return blockNumber.toString
          ? parseInt(blockNumber.toString(), 10)
          : undefined;
      } catch (error) {
        console.error("Failed to fetch user block number:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserBlockState = useCallback(
    async (chainId: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const { size: blockSize, fees: blockFees } =
          await powContract.get_block_building_state(
            account?.address || "",
            chainId,
          );
        const blockSizeValue = blockSize.toString
          ? parseInt(blockSize.toString(), 10)
          : undefined;
        const blockFeesValue = blockFees.toString
          ? parseInt(blockFees.toString(), 10)
          : undefined;
        return { size: blockSizeValue, fees: blockFeesValue };
      } catch (error) {
        console.error("Failed to fetch user block state:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserMaxChainId = useCallback(async () => {
    if (!STARKNET_ENABLED || !powContract) {
      return;
    }
    try {
      const maxChainId = await powContract.get_user_max_chain_id(
        account?.address || "",
      );
      return maxChainId.toString
        ? parseInt(maxChainId.toString(), 10)
        : undefined;
    } catch (error) {
      console.error("Failed to fetch user max chain ID:", error);
      return undefined;
    }
  }, [account, powContract, STARKNET_ENABLED]);

  const getUserBlockClicks = useCallback(
    async (chainId: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const clicks = await powContract.get_block_clicks(
          account?.address || "",
          chainId,
        );
        return clicks.toString ? parseInt(clicks.toString(), 10) : undefined;
      } catch (error) {
        console.error("Failed to fetch user block clicks:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserDaClicks = useCallback(
    async (chainId: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const clicks = await powContract.get_da_clicks(
          account?.address || "",
          chainId,
        );
        return clicks.toString ? parseInt(clicks.toString(), 10) : undefined;
      } catch (error) {
        console.error("Failed to fetch user DA clicks:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserProofClicks = useCallback(
    async (chainId: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const clicks = await powContract.get_proof_clicks(
          account?.address || "",
          chainId,
        );
        return clicks.toString ? parseInt(clicks.toString(), 10) : undefined;
      } catch (error) {
        console.error("Failed to fetch user proof clicks:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  return (
    <PowContractConnector.Provider
      value={{
        powGameContractAddress,
        createGameAccount,
        initMyGame,
        getUserBalance,
        powContract,
        getUserTxFeeLevels,
        getUserTxSpeedLevels,
        getUserUpgradeLevels,
        getUserAutomationLevels,
        getUserBlockNumber,
        getUserBlockState,
        getUserMaxChainId,
        getUserBlockClicks,
        getUserDaClicks,
        getUserProofClicks,
      }}
    >
      {children}
    </PowContractConnector.Provider>
  );
};
