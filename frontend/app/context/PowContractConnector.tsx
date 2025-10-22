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
import { useBalanceStore } from "../stores/useBalanceStore";
import powGameAbi from "../abis/pow_game.json";

type PowContractContextType = {
  powGameContractAddress: string | null;
  powContract: Contract | null;

  createGameAccount: () => Promise<void>;

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
  getUserBlockState: (chainId: number) => Promise<
    | {
        size: number | undefined;
        fees: number | undefined;
        max_size: number | undefined;
        difficulty: number | undefined;
      }
    | undefined
  >;
  getUserMaxChainId: () => Promise<number | undefined>;
  getUserDappsUnlocked: (chainId: number) => Promise<boolean | undefined>;
  getUserBlockClicks: (chainId: number) => Promise<number | undefined>;
  getUserDaClicks: (chainId: number) => Promise<number | undefined>;
  getUserProofClicks: (chainId: number) => Promise<number | undefined>;
  getUserProofBuildingState: (chainId: number) => Promise<
    | {
        size: number | undefined;
        fees: number | undefined;
        max_size: number | undefined;
        difficulty: number | undefined;
      }
    | undefined
  >;
  getUserDABuildingState: (chainId: number) => Promise<
    | {
        size: number | undefined;
        fees: number | undefined;
        max_size: number | undefined;
        difficulty: number | undefined;
      }
    | undefined
  >;
  getUserPrestige: () => Promise<number | undefined>;
  getUserPrestiges: (users: string[]) => Promise<number[] | undefined>;
  getRewardParams: () => Promise<
    | {
        rewardTokenAddress: string;
        rewardPrestigeThreshold: number;
        rewardAmount: { low: string; high: string } | string;
      }
    | undefined
  >;
  getHasClaimedReward: () => Promise<boolean | undefined>;
  getTokenBalanceOf: (
    tokenAddress: string,
    ownerAddress: string,
  ) => Promise<bigint | null>;
  getRewardPoolBalance: () => Promise<bigint | null>;

  // Fingerprint functions
  setUserToAddress: (user: string) => Promise<void>;
  hasClaimedUserReward: (user: string) => Promise<boolean | undefined>;

  // Cheat Codes
  doubleBalanceCheat: () => void;
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
  >(process.env.EXPO_PUBLIC_POW_GAME_CONTRACT_ADDRESS || null);
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
      if (powGameContractAddress) {
        connectContract(powGameContractAddress); // TODO: Allow getRegisteredContract args
        const abi = powGameAbi.abi;
        if (abi) {
          const powGameContract = new Contract(
            abi,
            powGameContractAddress,
            provider,
          );
          setPowContract(powGameContract);
        } else {
          console.error("Failed to load Pow Game ABI");
        }
      } else {
        console.error("Failed to fetch pow_game contract address");
      }
    }
    fetchPowGameContractAddress();
  }, [
    getRegisteredContract,
    provider,
    STARKNET_ENABLED,
    powGameContractAddress,
    connectContract,
  ]);

  useEffect(() => {
    if (!STARKNET_ENABLED || !account) {
      return;
    }
    if (!powContract) {
      return;
    }
    powContract.connect(account);
  }, [account, powContract, STARKNET_ENABLED]);

  const getTokenBalanceOf = useCallback(
    async (
      tokenAddress: string,
      ownerAddress: string,
    ): Promise<bigint | null> => {
      if (!STARKNET_ENABLED || !provider) return null;
      // Try minimal Cairo 1 ABI first
      try {
        const abiC1 = [
          {
            type: "function",
            name: "balance_of",
            state_mutability: "view",
            inputs: [
              {
                name: "account",
                type: "core::starknet::contract_address::ContractAddress",
              },
            ],
            outputs: [
              {
                type: "core::integer::u256",
              },
            ],
          },
        ] as any;
        const contract = new Contract(abiC1, tokenAddress, provider);
        const response: any = await contract.balance_of(ownerAddress);
        if (response != null) return response;
      } catch (error) {
        if (__DEV__) {
          console.error(
            "Failed to fetch token balance of",
            tokenAddress,
            ownerAddress,
            error,
          );
        }
      }
      return null;
    },
    [STARKNET_ENABLED, provider],
  );

  const getRewardPoolBalance = useCallback(async (): Promise<bigint | null> => {
    if (!STARKNET_ENABLED || !provider || !powGameContractAddress) return null;
    try {
      const params = await powContract?.get_reward_params?.();
      const tokenAny = (params as any)?.reward_token_address;
      if (tokenAny == null) return null;

      // Normalize address to 0x-hex string (params may return BigInt/decimal string)
      let tokenHex: string;
      try {
        const tokenBig = BigInt(
          (tokenAny as any)?.toString?.() ?? (tokenAny as string),
        );
        tokenHex = `0x${tokenBig.toString(16)}`;
      } catch (_e) {
        const raw = String(tokenAny);
        tokenHex = raw.startsWith("0x") ? raw : `0x${BigInt(raw).toString(16)}`;
      }

      return await getTokenBalanceOf(tokenHex, powGameContractAddress);
    } catch (_e) {
      return null;
    }
  }, [
    STARKNET_ENABLED,
    provider,
    powGameContractAddress,
    powContract,
    getTokenBalanceOf,
  ]);

  const setUserToAddress = useCallback(async (user: string) => {
    if (!STARKNET_ENABLED || !powGameContractAddress) {
      return;
    }
    try {
      const setUserCall: Call = {
        contractAddress: powGameContractAddress,
        entrypoint: "set_user_to_address",
        calldata: [user],
      };
      addAction(setUserCall);
    } catch (error) {
      console.error("Failed to set user to address:", error);
    }
  }, [powGameContractAddress, addAction, STARKNET_ENABLED]);

  const hasClaimedUserReward = useCallback(async (user: string) => {
    if (!STARKNET_ENABLED || !powContract) {
      return;
    }
    try {
      const claimed = await powContract.has_claimed_user_reward(user);
      return Boolean(claimed);
    } catch (error) {
      console.error("Failed to check if user has claimed reward:", error);
      return undefined;
    }
  }, [powContract, STARKNET_ENABLED]);

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
        const {
          size: blockSize,
          fees: blockFees,
          max_size: blockMaxSize,
          difficulty: blockDifficulty,
        } = await powContract.get_block_building_state(
          account?.address || "",
          chainId,
        );
        const blockSizeValue = blockSize.toString
          ? parseInt(blockSize.toString(), 10)
          : undefined;
        const blockFeesValue = blockFees.toString
          ? parseInt(blockFees.toString(), 10)
          : undefined;
        const blockMaxSizeValue = blockMaxSize.toString
          ? parseInt(blockMaxSize.toString(), 10)
          : undefined;
        const blockDifficultyValue = blockDifficulty.toString
          ? parseInt(blockDifficulty.toString(), 10)
          : undefined;
        return {
          size: blockSizeValue,
          fees: blockFeesValue,
          max_size: blockMaxSizeValue,
          difficulty: blockDifficultyValue,
        };
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
      const maxChainId = await powContract.get_user_chain_count(
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

  const getUserDappsUnlocked = useCallback(
    async (chainId: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const dappsUnlocked = await powContract.get_user_dapps_unlocked(
          account?.address || "",
          chainId,
        );
        return dappsUnlocked;
      } catch (error) {
        console.error("Failed to fetch user dapps unlocked:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

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

  const getUserProofBuildingState = useCallback(
    async (chainId: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const {
          size: proofSize,
          fees: proofFees,
          max_size: proofMaxSize,
          difficulty: proofDifficulty,
        } = await powContract.get_proof_building_state(
          account?.address || "",
          chainId,
        );
        const proofSizeValue = proofSize.toString
          ? parseInt(proofSize.toString(), 10)
          : undefined;
        const proofFeesValue = proofFees.toString
          ? parseInt(proofFees.toString(), 10)
          : undefined;
        const proofMaxSizeValue = proofMaxSize.toString
          ? parseInt(proofMaxSize.toString(), 10)
          : undefined;
        const proofDifficultyValue = proofDifficulty.toString
          ? parseInt(proofDifficulty.toString(), 10)
          : undefined;
        return {
          size: proofSizeValue,
          fees: proofFeesValue,
          max_size: proofMaxSizeValue,
          difficulty: proofDifficultyValue,
        };
      } catch (error) {
        console.error("Failed to fetch user proof building state:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserDABuildingState = useCallback(
    async (chainId: number) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const {
          size: daSize,
          fees: daFees,
          max_size: daMaxSize,
          difficulty: daDifficulty,
        } = await powContract.get_da_building_state(
          account?.address || "",
          chainId,
        );
        const daSizeValue = daSize.toString
          ? parseInt(daSize.toString(), 10)
          : undefined;
        const daFeesValue = daFees.toString
          ? parseInt(daFees.toString(), 10)
          : undefined;
        const daMaxSizeValue = daMaxSize.toString
          ? parseInt(daMaxSize.toString(), 10)
          : undefined;
        const daDifficultyValue = daDifficulty.toString
          ? parseInt(daDifficulty.toString(), 10)
          : undefined;
        return {
          size: daSizeValue,
          fees: daFeesValue,
          max_size: daMaxSizeValue,
          difficulty: daDifficultyValue,
        };
      } catch (error) {
        console.error("Failed to fetch user DA building state:", error);
        return undefined;
      }
    },
    [account, powContract, STARKNET_ENABLED],
  );

  const getUserPrestige = useCallback(async () => {
    if (!STARKNET_ENABLED || !powContract || !account) {
      return;
    }
    try {
      const prestige = await powContract.get_user_prestige(account.address);
      return prestige.toString ? parseInt(prestige.toString(), 10) : undefined;
    } catch (error) {
      console.error("Failed to fetch user prestige:", error);
      return undefined;
    }
  }, [account, powContract, STARKNET_ENABLED]);

  const getUserPrestiges = useCallback(
    async (users: string[]) => {
      if (!STARKNET_ENABLED || !powContract) {
        return;
      }
      try {
        const prestiges = await powContract.get_user_prestiges(users);
        return prestiges.map((prestige: any) =>
          prestige.toString ? parseInt(prestige.toString(), 10) : 0,
        );
      } catch (error) {
        console.error("Failed to fetch user prestiges:", error);
        return undefined;
      }
    },
    [powContract, STARKNET_ENABLED],
  );

  const getRewardParams = useCallback(async () => {
    if (!STARKNET_ENABLED || !powContract) return;
    try {
      const params = await powContract.get_reward_params();
      return {
        rewardTokenAddress: params.reward_token_address as string,
        rewardPrestigeThreshold: Number(
          params.reward_prestige_threshold?.toString?.() ||
            params.reward_prestige_threshold ||
            0,
        ),
        rewardAmount: params.reward_amount as any,
      };
    } catch (e) {
      console.error("Failed to fetch reward params:", e);
      return undefined;
    }
  }, [powContract, STARKNET_ENABLED]);

  const getHasClaimedReward = useCallback(async () => {
    if (!STARKNET_ENABLED || !powContract || !account) return;
    try {
      const claimed = await powContract.has_claimed_reward(account.address);
      return Boolean(claimed);
    } catch (e) {
      console.error("Failed to fetch has_claimed_reward:", e);
      return undefined;
    }
  }, [powContract, STARKNET_ENABLED, account]);

  // Cheat Codes Functions
  const doubleBalanceCheat = useCallback(() => {
    if (!STARKNET_ENABLED || !powGameContractAddress) {
      const currentBalance = useBalanceStore.getState().balance;
      useBalanceStore.getState().setBalance(currentBalance * 2);
      return;
    }

    const doubleBalanceCall: Call = {
      contractAddress: powGameContractAddress,
      entrypoint: "double_balance_cheat",
      calldata: [],
    };

    addAction(doubleBalanceCall);

    // Update frontend balance store immediately
    const currentBalance = useBalanceStore.getState().balance;
    useBalanceStore.getState().setBalance(currentBalance * 2);
  }, [powGameContractAddress, addAction, STARKNET_ENABLED]);

  return (
    <PowContractConnector.Provider
      value={{
        powGameContractAddress,
        createGameAccount,
        getUserBalance,
        powContract,
        getUserTxFeeLevels,
        getUserTxSpeedLevels,
        getUserUpgradeLevels,
        getUserAutomationLevels,
        getUserBlockNumber,
        getUserBlockState,
        getUserMaxChainId,
        getUserDappsUnlocked,
        getUserBlockClicks,
        getUserDaClicks,
        getUserProofClicks,
        getUserProofBuildingState,
        getUserDABuildingState,
        getUserPrestige,
        getUserPrestiges,
        getRewardParams,
        getHasClaimedReward,
        getTokenBalanceOf,
        getRewardPoolBalance,
        setUserToAddress,
        hasClaimedUserReward,
        doubleBalanceCheat,
      }}
    >
      {children}
    </PowContractConnector.Provider>
  );
};
