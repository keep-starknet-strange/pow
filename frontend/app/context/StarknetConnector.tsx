import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { Call, Account, ec, RpcProvider, hash, CallData } from 'starknet';

export const LOCALHOST_RPC_URL = process.env.EXPO_PUBLIC_LOCALHOST_RPC_URL || 'http://localhost:5050/rpc';
export const SEPOLIA_RPC_URL = process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.starknet-testnet.lava.build:443' // https://starknet-sepolia.public.blastapi.io/rpc/v0_8'
export const MAINNET_RPC_URL = process.env.EXPO_PUBLIC_MAINNET_RPC_URL || 'https://starknet-mainnet.public.blastapi.io/rpc/v0_7'

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
  const [chain, setChain] = useState<string>(process.env.EXPO_PUBLIC_STARKNET_CHAIN || "SN_DEVNET");

  const STARKNET_ENABLED = process.env.EXPO_PUBLIC_ENABLE_STARKNET === "true" || process.env.EXPO_PUBLIC_ENABLE_STARKNET === "1";

  useEffect(() => {
    const providerInstance = getStarknetProvider(chain);
    setProvider(providerInstance);
  }, [chain]);

  const myPrivateKey = "0x0000000000000000000000000000000071d7bb07b9a64f6f78ac4c816aff4da9";
  // const ozAccountClassHash = "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";
  const ozAccountClassHash = "0x02b31e19e45c06f29234e06e2ee98a9966479ba3067f8785ed972794fdb0065c";
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
    if (!STARKNET_ENABLED) {
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
      // TODO: Handle error ( for now assume it is already deployed )
      // console.error('Error deploying account:', error);
      // throw error;
      return { transaction_hash: 'Account already exists', contract_address: contractAddress };
    });
    if (transaction_hash === 'Account already exists') {
      console.log('Account already exists:', contractAddress);
      connectAccount();
      return;
    }
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
    if (!STARKNET_ENABLED) {
      return;
    }
    /*
    if (!account) {
      console.error('Account is not connected.');
      return;
    }
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
    */
    const newAccount = new Account(provider!, generateAddress(myPrivateKey), myPrivateKey);
    const res = await newAccount.execute([{
      contractAddress,
      entrypoint: functionName,
      calldata: args
    }], {
      maxFee: 100_000_000_000_000,
    });
    console.log(`Transaction hash: ${res.transaction_hash}`);
    await provider!.waitForTransaction(res.transaction_hash);
    console.log(`✅ ${functionName} executed successfully. Transaction hash: ${res.transaction_hash}`);
  }

  const invokeContractCalls = useCallback(async (calls: Call[]) => {
    if (!STARKNET_ENABLED) {
      return;
    }

    const newAccount = new Account(provider!, generateAddress(myPrivateKey), myPrivateKey);
    const res = await newAccount.execute(calls, {
      maxFee: 100_000_000_000_000,
    });
    console.log(`Transaction hash: ${res.transaction_hash}`);
    await provider!.waitForTransaction(res.transaction_hash);
    console.log(`✅ Calls executed successfully. Transaction hash: ${res.transaction_hash}`);
  }, [provider, myPrivateKey]);

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
  };
  return (
    <StarknetConnector.Provider value={value}>
      {children}
    </StarknetConnector.Provider>
  );
}

