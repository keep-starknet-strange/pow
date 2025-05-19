import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { Call, Account, constants, Contract, ec, json, stark, RpcProvider, hash, CallData } from 'starknet';

export const LOCALHOST_RPC_URL = process.env.EXPO_PUBLIC_LOCALHOST_RPC_URL || 'http://localhost:5050/rpc';
export const SEPOLIA_RPC_URL = process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.starknet-testnet.lava.build:443' // https://starknet-sepolia.public.blastapi.io/rpc/v0_8'
export const MAINNET_RPC_URL = process.env.EXPO_PUBLIC_MAINNET_RPC_URL || 'https://starknet-mainnet.public.blastapi.io/rpc/v0_7'

// sepolia: export const POW_CONTRACT_ADDRESS = "0x029a999bdc75fe7ae7298da73b257f117f846454c2ba1e7d3f5f60b29b510bf4";
export const POW_CONTRACT_ADDRESS = "0x07f27ac57250f4eb2bde1c2f7223397c542b96e1f39a042f0987835881eed781";
export const MAX_MULTICALL = 50;

type StarknetConnectorContextType = {
  chain: string;
  account: Account | null;
  provider: RpcProvider | null;

  getMyAddress: () => string;
  deployAccount: () => Promise<void>;
  connectAccount: () => Promise<void>;
  disconnectAccount: () => Promise<void>;
  invokeContract: (contractAddress: string, functionName: string, args: any[]) => Promise<void>;
  invokeContractCalls: (calls: Call[]) => Promise<void>;

  addToMultiCall: (call: Call) => Promise<void>;

  invokeInitMyGame: () => Promise<void>;
};

const StarknetConnector = createContext<StarknetConnectorContextType | undefined>(undefined);

export const useStarknetConnector = () => {
  const context = useContext(StarknetConnector);
  if (!context) {
    throw new Error("useStarknetConnector must be used within a StarknetConnectorProvider");
  }
  return context;
}

export const getStarknetProvider = (chain: string): RpcProvider => {
  switch (chain) {
    case "SN_MAINNET":
      return new RpcProvider({ nodeUrl: MAINNET_RPC_URL, specVersion: "0.7" });
    case "SN_SEPOLIA":
      return new RpcProvider({ nodeUrl: SEPOLIA_RPC_URL });
    case "SN_DEVNET":
      return new RpcProvider({ nodeUrl: LOCALHOST_RPC_URL, specVersion: "0.8" });
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

export const StarknetConnectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [provider, setProvider] = useState<RpcProvider | null>(null);
  const [chain, setChain] = useState<string>(process.env.EXPO_PUBLIC_STARKNET_CHAIN || "SN_MAINNET");
  const [multiCall, setMultiCalls] = useState<Call[]>([]);

  const ENABLE_STARKNET = process.env.EXPO_PUBLIC_ENABLE_STARKNET === "true" || process.env.EXPO_PUBLIC_ENABLE_STARKNET === "1";

  useEffect(() => {
    const providerInstance = getStarknetProvider(chain);
    setProvider(providerInstance);
  }, [chain]);

  const myPrivateKey = "0x0000000000000000000000000000000071d7bb07b9a64f6f78ac4c816aff4da9";
  const ozAccountClassHash = "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";
  //const ozAccountClassHash = "0x02b31e19e45c06f29234e06e2ee98a9966479ba3067f8785ed972794fdb0065c";
  const getDeployCalldata = (privateKey: string) => {
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = CallData.compile({ public_key: starkKeyPub });
    return constructorCalldata;
  }

  const generateAddress = (privateKey: string): string => {
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = getDeployCalldata(privateKey);
    const contractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      ozAccountClassHash,
      constructorCalldata,
      0,
    );
    return contractAddress;
  }

  const getMyAddress = () => {
    return generateAddress(myPrivateKey);
  }

  const deployAccount = async () => {
    if (!ENABLE_STARKNET) {
      return;
    }
    if (!provider) {
      console.error('Provider is not initialized.');
      return;
    }
    /*
    const isAccountDeployed = await provider!.getClassAt(generateAddress(myPrivateKey));
    if (isAccountDeployed) {
      console.log('Account already deployed.');
      return;
    }
    */
    const starkKeyPub = ec.starkCurve.getStarkKey(myPrivateKey);
    const contractAddress = generateAddress(myPrivateKey);
    const constructorCalldata = getDeployCalldata(myPrivateKey);

    const accountInstance = new Account(provider!, contractAddress, myPrivateKey);
    console.log('Deploying OpenZeppelin account...', provider, contractAddress, myPrivateKey);
    const { transaction_hash, contract_address } = await accountInstance.deployAccount({
      classHash: ozAccountClassHash,
      constructorCalldata: constructorCalldata,
      addressSalt: starkKeyPub,
      contractAddress: contractAddress,
    }, { maxFee: 100_000_000_000_000 }).catch((error) => {
      console.error('Error deploying account:', error);
      throw error;
    });
    console.log('Transaction hash:', transaction_hash);
    await provider!.waitForTransaction(transaction_hash);
    console.log('✅ New OpenZeppelin account created.\n   address =', contract_address);
    connectAccount();
  }

  const connectAccount = async () => {
    const newAccount = new Account(provider!, generateAddress(myPrivateKey), myPrivateKey);
    setAccount(newAccount);
    console.log('✅ Connected to account:', newAccount.address);
  }

  const disconnectAccount = async () => {
    if (account) {
      setAccount(null);
    }
  }

  const invokeContract = async (contractAddress: string, functionName: string, args: any[]) => {
    if (!ENABLE_STARKNET) {
      return;
    }
    /*
    if (!account) {
      console.error('Account is not connected.');
      return;
    }
    */
    const { abi: contractAbi } = await provider!.getClassAt(contractAddress);
    if (contractAbi === undefined) {
      throw new Error(`Contract at address ${contractAddress} does not have an ABI.`);
    }
    const contract = new Contract(contractAbi, contractAddress, provider!);
    contract.connect(account!);

    const myCall = contract.populate(functionName, args);
    const res = await contract[functionName](myCall.calldata);
    console.log(`Transaction hash: ${res.transaction_hash}`);
    await provider!.waitForTransaction(res.transaction_hash);
    console.log(`✅ ${functionName} executed successfully. Transaction hash: ${res.transaction_hash}`);
  }

  const invokeContractCalls = useCallback(async (calls: Call[]) => {
    if (!ENABLE_STARKNET) {
      return;
    }

    console.log('Invoking calls:', calls);
    const newAccount = new Account(provider!, generateAddress(myPrivateKey), myPrivateKey);
    const res = await newAccount.execute(calls, {
      maxFee: 100_000_000_000_000,
    });
    console.log(`Transaction hash: ${res.transaction_hash}`);
    await provider!.waitForTransaction(res.transaction_hash);
    console.log(`✅ Calls executed successfully. Transaction hash: ${res.transaction_hash}`);
  }, [provider, myPrivateKey]);

  const addToMultiCall = useCallback(async (call: Call) => {
    if (!ENABLE_STARKNET) {
      return;
    }
    setMultiCalls((prev) => {
      const newMultiCalls = [...prev, call];
      if (newMultiCalls.length >= MAX_MULTICALL) {
        invokeContractCalls(newMultiCalls);
        return [];
      }
      return newMultiCalls;
    });
  }, [invokeContractCalls]);

  const invokeInitMyGame = async () => {
    if (!ENABLE_STARKNET) {
      return;
    }
    /*
    TODO
    if (!account) {
      console.error('Account is not connected.');
      return;
    }
    */
    // TODO: Check if the game is already initialized
    console.log("Invoking init_my_game on contract at address:", POW_CONTRACT_ADDRESS);
    const { abi: contractAbi } = await provider!.getClassAt(POW_CONTRACT_ADDRESS);
    if (contractAbi === undefined) {
      throw new Error(`Contract at address ${POW_CONTRACT_ADDRESS} does not have an ABI.`);
    }
    const contract = new Contract(contractAbi, POW_CONTRACT_ADDRESS, provider!);
    const newAccount = new Account(provider!, generateAddress(myPrivateKey), myPrivateKey);
    contract.connect(newAccount!);

    const myCall = contract.populate("init_my_game", []);
    /*
    const rest = newAccount.execute([
      {
        contractAddress: POW_CONTRACT_ADDRESS,
        entrypoint: "init_my_game",
        calldata: []
      },
    ], {
      maxFee: 100_000_000_000_000,
    });
    */
    const res = await contract.init_my_game(myCall.calldata).catch((error) => {
      console.error('Error invoking init_my_game:', error);
      throw error;
    });
    console.log(`Transaction hash: ${res.transaction_hash}`);
    await provider!.waitForTransaction(res.transaction_hash);
    console.log(`✅ initMyGame executed successfully. ${res.transaction_hash}`);
  }

  const value = {
    chain,
    account,
    provider,
    getMyAddress,
    deployAccount,
    connectAccount,
    disconnectAccount,
    invokeContract,
    invokeContractCalls,
    addToMultiCall,
    invokeInitMyGame,
  };
  return (
    <StarknetConnector.Provider value={value}>
      {children}
    </StarknetConnector.Provider>
  );
}

