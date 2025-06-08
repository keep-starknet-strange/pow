import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { toBeHex } from "ethers";
import { Call, Account, constants, Contract, ec, TypedData, json, stark, RpcProvider, hash, CallData } from 'starknet';
import {
  BASE_URL,
  executeCalls,
  fetchBuildTypedData,
  fetchExecuteTransaction,
  formatCall,
  GaslessOptions,
  SEPOLIA_BASE_URL,
} from "@avnu/gasless-sdk";

export const LOCALHOST_RPC_URL = process.env.EXPO_PUBLIC_LOCALHOST_RPC_URL || 'http://localhost:5050/rpc';
export const SEPOLIA_RPC_URL = process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7'
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
  invokeWithPaymaster: (account: Account, calls: Call[], deploymentData?: any) => Promise<void>;
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
      return new RpcProvider({ nodeUrl: MAINNET_RPC_URL, specVersion: "0.7", chainId: constants.StarknetChainId.SN_MAIN });
    case "SN_SEPOLIA":
      return new RpcProvider({ nodeUrl: SEPOLIA_RPC_URL, specVersion: "0.7", chainId: constants.StarknetChainId.SN_SEPOLIA });
    case "SN_DEVNET":
      return new RpcProvider({ nodeUrl: LOCALHOST_RPC_URL, specVersion: "0.8" });
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

export const StarknetConnectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [provider, setProvider] = useState<RpcProvider | null>(null);
  const [chain, setChain] = useState<string>(process.env.EXPO_PUBLIC_STARKNET_CHAIN || "SN_SEPOLIA");

  const STARKNET_ENABLED = process.env.EXPO_PUBLIC_ENABLE_STARKNET === "true" || process.env.EXPO_PUBLIC_ENABLE_STARKNET === "1";

  useEffect(() => {
    const providerInstance = getStarknetProvider(chain);
    setProvider(providerInstance);
  }, [chain]);

  const myPrivateKey = "0x0000000000000000000000000000000071d7bb07b9a64f6f78ac4c816aff4dfd";
  const argentAccountClassHash = "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";
  const getDeployCalldata = (privateKey: string) => {
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = CallData.compile({ owner: starkKeyPub, guardian: "0x0" });
    return constructorCalldata;
  }

  const stringIntToHex = (value: string | number): string => {
    if (typeof value === 'number') {
      value = value.toString();
    }
    const hexValue = BigInt(value).toString(16);
    return `0x${hexValue.padStart(64, '0')}`;
  }

  const getDeployCalldataHex = (privateKey: string) => {
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = [starkKeyPub, "0x0"];
    return constructorCalldata;
  }

  const generateAddress = (privateKey: string): string => {
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = getDeployCalldata(privateKey);
    const contractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      argentAccountClassHash,
      constructorCalldata,
      0,
    );
    return contractAddress;
  }

  const getMyAddress = () => {
    return generateAddress(myPrivateKey);
  }

  const deployAccount = useCallback(async () => {
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
      classHash: argentAccountClassHash,
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
  }, [provider, myPrivateKey]);

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

  const invokeWithPaymaster = useCallback(async (account: Account, calls: Call[], deploymentData?: any) => {
    if (!STARKNET_ENABLED) {
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_AVNU_PAYMASTER_API_KEY || "";
    if (apiKey === "") {
      // TODO: buildGaslessTxData(address, calls, network, deploymentData?)
      // TODO: sendGaslessTx(address, txData, signature, network, deploymentData?)

      // Run using backend paymaster provider
      const formattedCalls = formatCall(calls);
      const focEngineUrl = 'http://localhost:8080';
      const buildGaslessTxDataUrl = `${focEngineUrl}/paymaster/build-gasless-tx`;
      const gaslessTxInput = {
        account: account.address,
        calls: formattedCalls,
        network: chain,
        deploymentData: deploymentData || undefined,
      };
      const gaslessTxRes: { data: TypedData } = await fetch(buildGaslessTxDataUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gaslessTxInput),
      }).then((response) => response.json()).catch((error) => {
        console.error('Error fetching gasless transaction data:', error);
        throw error;
      });
      let signature = await account.signMessage(gaslessTxRes.data);
      if (Array.isArray(signature)) {
        signature = signature.map((sig) => toBeHex(BigInt(sig)));
      } else if (signature.r && signature.s) {
        signature = [toBeHex(BigInt(signature.r)), toBeHex(BigInt(signature.s))];
      }
      const sendGaslessTxUrl = `${focEngineUrl}/paymaster/send-gasless-tx`;
      const sendGaslessTxInput = {
        account: account.address,
        txData: JSON.stringify(gaslessTxRes.data),
        signature: signature,
        network: chain,
        deploymentData: deploymentData || undefined,
      };
      const sendGaslessTxRes = await fetch(sendGaslessTxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendGaslessTxInput),
      }).then((response) => response.json()).catch((error) => {
        console.error('Error sending gasless transaction:', error);
        throw error;
      });
      console.log('Gasless transaction sent:', sendGaslessTxRes);
    } else {
      // Use gasless-sdk to execute calls with paymaster
      const options: GaslessOptions = { baseUrl: chain === "SN_SEPOLIA" ? SEPOLIA_BASE_URL : BASE_URL, apiKey };
      const res = await executeCalls(account, calls, { deploymentData }, options).catch((error) => {
        console.error('Error executing calls with paymaster:', error);
        throw error;
      });
      console.log('Response from executeCalls with paymaster:', res);
    }
  }, [provider, chain]);

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
    invokeWithPaymaster,
  };
  return (
    <StarknetConnector.Provider value={value}>
      {children}
    </StarknetConnector.Provider>
  );
}

