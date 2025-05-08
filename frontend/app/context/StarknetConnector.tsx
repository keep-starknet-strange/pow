import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, constants, Contract, ec, json, stark, RpcProvider, hash, CallData } from 'starknet';

export const LOCALHOST_RPC_URL = process.env.EXPO_PUBLIC_LOCALHOST_RPC_URL || 'http://localhost:5050';
export const SEPOLIA_RPC_URL = process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 'https://api.cartridge.gg/x/starknet/sepolia'
export const MAINNET_RPC_URL = process.env.EXPO_PUBLIC_MAINNET_RPC_URL || 'https://api.cartridge.gg/x/starknet/mainnet'

type StarknetConnectorContextType = {
  chain: string;
  account: Account | null;
  provider: RpcProvider | null;

  getMyAddress: () => string;
  deployAccount: () => Promise<void>;
  connectAccount: () => Promise<void>;
  disconnectAccount: () => Promise<void>;
  invokeContract: (contractAddress: string, functionName: string, args: any[]) => Promise<void>;
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
      return new RpcProvider({ nodeUrl: MAINNET_RPC_URL });
    case "SN_SEPOLIA":
      return new RpcProvider({ nodeUrl: SEPOLIA_RPC_URL });
    case "SN_DEVNET":
      return new RpcProvider({ nodeUrl: LOCALHOST_RPC_URL });
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

export const StarknetConnectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [provider, setProvider] = useState<RpcProvider | null>(null);
  const [chain, setChain] = useState<string>(process.env.EXPO_PUBLIC_STARKNET_CHAIN || "SN_SEPOLIA");

  useEffect(() => {
    const providerInstance = getStarknetProvider(chain);
    setProvider(providerInstance);
  }, [chain]);

  const myPrivateKey = "0x0000000000000000000000000000000071d7bb07b9a64f6f78ac4c816aff4da9";
  const ozAccountClassHash = "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";
  const getDeployCalldata = (privateKey: string) => {
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = CallData.compile({ publicKey: starkKeyPub });
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
    const starkKeyPub = ec.starkCurve.getStarkKey(myPrivateKey);
    const contractAddress = generateAddress(myPrivateKey);
    const constructorCalldata = getDeployCalldata(myPrivateKey);

    const accountInstance = new Account(provider!, contractAddress, myPrivateKey);
    const { transaction_hash, contract_address } = await accountInstance.deployAccount({
      classHash: ozAccountClassHash,
      constructorCalldata: constructorCalldata,
      addressSalt: starkKeyPub,
    });
    await provider!.waitForTransaction(transaction_hash);
    console.log('✅ New OpenZeppelin account created.\n   address =', contract_address);
    connectAccount();
  }

  const connectAccount = async () => {
    const newAccount = new Account(provider!, generateAddress(myPrivateKey), myPrivateKey);
    setAccount(newAccount);
  }
  const disconnectAccount = async () => {
    if (account) {
      setAccount(null);
    }
  }

  const invokeContract = async (contractAddress: string, functionName: string, args: any[]) => {
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
    console.log(`✅ ${functionName} executed successfully. %{res.transaction_hash}`);
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
  };
  return (
    <StarknetConnector.Provider value={value}>
      {children}
    </StarknetConnector.Provider>
  );
}

