import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { toBeHex } from "ethers";
import {
  Call,
  Account,
  constants,
  ec,
  TypedData,
  RpcProvider,
  hash,
  CallData,
  typedData,
} from "starknet";
import {
  BASE_URL,
  executeCalls,
  formatCall,
  GaslessOptions,
  SEPOLIA_BASE_URL,
} from "@avnu/gasless-sdk";

export const LOCALHOST_RPC_URL =
  process.env.EXPO_PUBLIC_LOCALHOST_RPC_URL || "http://localhost:5050/rpc";
export const SEPOLIA_RPC_URL =
  process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL ||
  "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";
export const MAINNET_RPC_URL =
  process.env.EXPO_PUBLIC_MAINNET_RPC_URL ||
  "https://starknet-mainnet.public.blastapi.io/rpc/v0_7";

type StarknetConnectorContextType = {
  STARKNET_ENABLED: boolean;
  network: string;
  account: Account | null;
  provider: RpcProvider | null;

  storePrivateKey: (
    privateKey: string,
    appName: string,
    accountClassName?: string,
  ) => Promise<void>;
  getAvailableKeys: (appName: string) => Promise<string[]>;
  getPrivateKey: (key: string) => Promise<string | null>;
  generatePrivateKey: () => string;
  clearPrivateKey: (key: string) => Promise<void>;
  clearPrivateKeys: (appName: string) => Promise<void>;

  generateAccountAddress: (
    privateKey: string,
    accountClassName?: string,
  ) => string;
  getDeploymentData: (privateKey: string, accountClassName?: string) => any;
  deployAccount: (
    privateKey: string,
    accountClassName?: string,
  ) => Promise<void>;
  connectStorageAccount: (key: string) => Promise<void>;
  connectAccount: (privateKey: string) => Promise<void>;
  storeKeyAndConnect: (
    privateKey: string,
    appName: string,
    accountClassName?: string,
  ) => Promise<void>;
  disconnectAccount: () => void;
  disconnectAndDeleteAccount: () => Promise<void>;

  invokeContract: (
    contractAddress: string,
    functionName: string,
    args: any[],
    retries?: number,
  ) => Promise<void>;
  invokeContractCalls: (calls: Call[], retries?: number) => Promise<void>;
  invokeWithPaymaster: (
    calls: Call[],
    privateKey?: string,
    retries?: number,
  ) => Promise<void>;
  invokeCalls: (calls: Call[], retries?: number) => Promise<any>;
  waitForTransaction: (txHash: string) => Promise<boolean>;
};

const StarknetConnector = createContext<
  StarknetConnectorContextType | undefined
>(undefined);

export const useStarknetConnector = () => {
  const context = useContext(StarknetConnector);
  if (!context) {
    throw new Error(
      "useStarknetConnector must be used within a StarknetConnectorProvider",
    );
  }
  return context;
};

export const getStarknetProvider = (network: string): RpcProvider => {
  switch (network) {
    case "SN_MAINNET":
      return new RpcProvider({
        nodeUrl: MAINNET_RPC_URL,
        specVersion: "0.7",
        chainId: constants.StarknetChainId.SN_MAIN,
      });
    case "SN_SEPOLIA":
      return new RpcProvider({
        nodeUrl: SEPOLIA_RPC_URL,
        specVersion: "0.7",
        chainId: constants.StarknetChainId.SN_SEPOLIA,
      });
    case "SN_DEVNET":
      return new RpcProvider({
        nodeUrl: LOCALHOST_RPC_URL,
        specVersion: "0.8",
      });
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
};

// Helper functions for retry logic
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hasValidTransactionHash = (response: any): boolean => {
  if (!response) return false;

  // Check if response has data with transactionHash
  if (response.data?.transactionHash) {
    // Check if it's a valid hash (starts with 0x and has proper length)
    const hash = response.data.transactionHash;
    return (
      typeof hash === "string" && hash.startsWith("0x") && hash.length > 10
    );
  }

  // Check for error indicators
  if (response.error || response.data?.revertError) {
    return false;
  }

  return false;
};

const executeWithRetries = async (
  invokeFunction: () => Promise<any>,
  waitForTransaction: (txHash: string) => Promise<boolean>,
  retries: number = 0,
): Promise<any> => {
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await invokeFunction();

      // If no retries requested, return immediately
      if (retries === 0) {
        return response;
      }

      // Check if we got a valid transaction hash for confirmation
      if (hasValidTransactionHash(response)) {
        const txHash =
          response.data?.transactionHash || response.transaction_hash;

        if (txHash) {
          // Wait for transaction confirmation
          const isConfirmed = await waitForTransaction(txHash);

          if (isConfirmed) {
            if (__DEV__) {
              console.log(
                `✅ Transaction ${txHash} confirmed on attempt ${attempt + 1}`,
              );
            }
            return response;
          } else {
            throw new Error(`Transaction ${txHash} failed on-chain validation`);
          }
        }
      }

      // If we reach here without valid response, throw error to trigger retry
      throw new Error("Transaction validation failed - invalid response");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (attempt < retries) {
        if (__DEV__) {
          console.log(
            `❌ Transaction failed (attempt ${attempt + 1}/${retries + 1}): ${errorMessage}. Retrying in ${RETRY_DELAY_MS}ms...`,
          );
        }
        await delay(RETRY_DELAY_MS);
      } else {
        if (__DEV__) {
          console.error(
            `🛑 Transaction permanently failed after ${retries + 1} attempts: ${errorMessage}`,
          );
        }
        throw error;
      }
    }
  }

  throw new Error("Unexpected end of retry loop");
};

export const StarknetConnectorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [provider, setProvider] = useState<RpcProvider | null>(null);
  const [network, setNetwork] = useState<string>(
    process.env.EXPO_PUBLIC_STARKNET_CHAIN || "SN_SEPOLIA",
  );

  const STARKNET_ENABLED =
    process.env.EXPO_PUBLIC_ENABLE_STARKNET === "true" ||
    process.env.EXPO_PUBLIC_ENABLE_STARKNET === "1";

  useEffect(() => {
    const providerInstance = getStarknetProvider(network);
    setProvider(providerInstance);
  }, [network]);

  const getAccountClassHash = (accountClassName?: string): string => {
    // Default to Argent X account class hash
    if (!accountClassName)
      return "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";

    if (accountClassName === "argentX") {
      return "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";
    } else if (accountClassName === "devnet") {
      return "0x02b31e19e45c06f29234e06e2ee98a9966479ba3067f8785ed972794fdb0065c";
    } else {
      if (__DEV__)
        console.error(`Unsupported account class: ${accountClassName}`);
      return "";
    }
  };

  const randomHex = (length: number): string => {
    const randomBytes = new Uint8Array(length / 2);
    window.crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  };

  const storePrivateKey = async (
    privateKey: string,
    appName: string,
    accountClassName?: string,
  ): Promise<void> => {
    const accountAddress = generateAccountAddress(privateKey, accountClassName);
    const key = `${network}.${appName}.${accountClassName || "argentX"}.${accountAddress}`;
    await SecureStore.setItemAsync(key, privateKey).catch((error) => {
      if (__DEV__) console.error("Error storing private key:", error);
      throw error;
    });
    // Store the key in a list of available keys ( using async unsecure storage )
    const availableKeys = await getAvailableKeys(appName);
    if (!availableKeys.includes(key)) {
      const keyStorageName = `starknet.${network}.${appName}.keys`;
      await AsyncStorage.setItem(
        keyStorageName,
        JSON.stringify([...availableKeys, key]),
      ).catch((error) => {
        if (__DEV__) console.error("Error storing available keys:", error);
        throw error;
      });
    }
    if (__DEV__) console.log(`✅ Private key for ${key} stored successfully.`);
    if (__DEV__)
      console.log(
        `Available keys: ${JSON.stringify(await getAvailableKeys(appName))}`,
      );
  };

  const clearPrivateKey = async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
      if (__DEV__)
        console.log(`✅ Private key for ${key} cleared successfully.`);
      // Remove the key from the list of available keys
      const appName = key.split(".")[1];
      const availableKeys = await getAvailableKeys(appName);
      const updatedKeys = availableKeys.filter((k) => k !== key);
      const keyStorageName = `starknet.${network}.${appName}.keys`;
      await AsyncStorage.setItem(keyStorageName, JSON.stringify(updatedKeys));
    } catch (error) {
      console.error("Error clearing private key:", error);
    }
  };

  const clearPrivateKeys = async (appName: string): Promise<void> => {
    try {
      const keyStorageName = `starknet.${network}.${appName}.keys`;
      const keys = await AsyncStorage.getItem(keyStorageName);
      if (keys) {
        const parsedKeys: string[] = JSON.parse(keys);
        await Promise.all(
          parsedKeys.map((key) => SecureStore.deleteItemAsync(key)),
        );
        await AsyncStorage.removeItem(keyStorageName);
        if (__DEV__) {
          console.log(
            `✅ All private keys for ${appName} cleared successfully.`,
          );
        }
      } else {
        console.warn(`No keys found for app: ${appName}`);
      }
    } catch (error) {
      console.error("Error clearing private keys:", error);
    }
  };

  const getAvailableKeys = async (appName: string): Promise<string[]> => {
    try {
      const keyStorageName = `starknet.${network}.${appName}.keys`;
      const keys = await AsyncStorage.getItem(keyStorageName);
      return keys ? JSON.parse(keys) : [];
    } catch (error) {
      console.error("Error retrieving available keys:", error);
      return [];
    }
  };

  const getPrivateKey = async (key: string): Promise<string | null> => {
    try {
      const privateKey = await SecureStore.getItemAsync(key);
      if (privateKey) {
        return privateKey;
      } else {
        console.warn(`Private key for ${key} not found.`);
        return null;
      }
    } catch (error) {
      console.error("Error retrieving private key:", error);
      return null;
    }
  };

  const generatePrivateKey = () => {
    if (!STARKNET_ENABLED) {
      return "";
    }

    const privateKey = `0x0${randomHex(63)}`;
    return privateKey;
  };

  const getDeployCalldata = (privateKey: string, accountClassName?: string) => {
    // Default to Argent X account class calldata
    if (!accountClassName) {
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      const constructorCalldata = CallData.compile({
        owner: starkKeyPub,
        guardian: "0x0",
      });
      return constructorCalldata;
    }
    if (accountClassName === "argentX") {
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      const constructorCalldata = CallData.compile({
        owner: starkKeyPub,
        guardian: "0x0",
      });
      return constructorCalldata;
    } else if (accountClassName === "devnet") {
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      const constructorCalldata = CallData.compile({ pub_key: starkKeyPub });
      return constructorCalldata;
    } else {
      if (__DEV__)
        console.error(`Unsupported account class: ${accountClassName}`);
      return CallData.compile({});
    }
  };

  const getDeployCalldataHex = (
    privateKey: string,
    accountClassName?: string,
  ) => {
    // Default to Argent X account class calldata
    if (!accountClassName) {
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      return [starkKeyPub, "0x0"];
    }
    if (accountClassName === "argentX") {
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      return [starkKeyPub, "0x0"];
    } else if (accountClassName === "devnet") {
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      return [starkKeyPub];
    } else {
      if (__DEV__)
        console.error(`Unsupported account class: ${accountClassName}`);
      return [];
    }
  };

  const getDeploymentData = (privateKey: string, accountClassName?: string) => {
    const deploymentData = {
      class_hash: getAccountClassHash(accountClassName),
      calldata: getDeployCalldataHex(privateKey, accountClassName),
      salt: ec.starkCurve.getStarkKey(privateKey),
      unique: "0x0",
    };
    return deploymentData;
  };

  const generateAccountAddress = (
    privateKey: string,
    accountClassName?: string,
  ) => {
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = getDeployCalldata(privateKey, accountClassName);
    const contractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      getAccountClassHash(accountClassName),
      constructorCalldata,
      0,
    );
    return contractAddress;
  };

  const connectAccount = useCallback(
    async (privateKey: string, accountClassName?: string) => {
      if (!STARKNET_ENABLED) {
        return;
      }
      if (!provider) {
        console.error("Provider is not initialized.");
        return;
      }
      const accountAddress = generateAccountAddress(
        privateKey,
        accountClassName,
      );
      const newAccount = new Account(provider!, accountAddress, privateKey);
      setAccount(newAccount);
      if (__DEV__) {
        console.log("✅ Connected to account:", newAccount.address);
      }
    },
    [provider],
  );

  // Key is in format: network.appName.accountClassName.accountAddress
  const connectStorageAccount = useCallback(
    async (key: string) => {
      // TODO: Check if the account is deployed
      if (!STARKNET_ENABLED) {
        return;
      }
      if (!provider) {
        return;
      }
      const privateKey = await getPrivateKey(key);
      if (!privateKey) {
        console.error(`Private key for ${key} not found.`);
        return;
      }
      const accountClassName = key.split(".").slice(2, 3)[0];
      const accountAddress = generateAccountAddress(
        privateKey,
        accountClassName,
      );
      const newAccount = new Account(provider!, accountAddress, privateKey);
      setAccount(newAccount);
      if (__DEV__)
        console.log(
          "✅ Connected to account from storage:",
          newAccount.address,
        );
    },
    [provider],
  );

  const storeKeyAndConnect = useCallback(
    async (privateKey: string, appName: string, accountClassName?: string) => {
      // Store the private key first
      await storePrivateKey(privateKey, appName, accountClassName);

      // Generate the key that was stored
      const accountAddress = generateAccountAddress(
        privateKey,
        accountClassName,
      );
      const key = `${network}.${appName}.${accountClassName || "argentX"}.${accountAddress}`;

      // Connect using the stored key
      await connectStorageAccount(key);
    },
    [storePrivateKey, generateAccountAddress, connectStorageAccount, network],
  );

  const disconnectAccount = () => {
    if (account) {
      setAccount(null);
    }
  };

  const disconnectAndDeleteAccount = useCallback(async () => {
    if (!account) {
      return;
    }
    const accountAddress = account.address;
    const appName = accountAddress.split(".")[1];
    const accountClassName = accountAddress.split(".")[2];
    const key = `${network}.${appName}.${accountClassName}.${accountAddress}`;
    await clearPrivateKey(key);
    disconnectAccount();
  }, [account, network, clearPrivateKey, disconnectAccount]);

  const deployAccount = useCallback(
    async (privateKey: string, accountClassName?: string) => {
      if (!STARKNET_ENABLED) {
        return;
      }

      if (!provider) {
        console.error("Provider is not initialized.");
        return;
      }
      /*
     * TODO
    const isAccountDeployed = await provider!.getClassAt(generateAccountAddress(myPrivateKey));
    if (isAccountDeployed) {
      console.log('Account already deployed.');
      return;
    }
    */
      const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
      const contractAddress = generateAccountAddress(
        privateKey,
        accountClassName,
      );
      const constructorCalldata = getDeployCalldata(
        privateKey,
        accountClassName,
      );

      const accountInstance = new Account(
        provider!,
        contractAddress,
        privateKey,
      );
      const { transaction_hash, contract_address } = await accountInstance
        .deployAccount(
          {
            classHash: getAccountClassHash(accountClassName),
            constructorCalldata: constructorCalldata,
            addressSalt: starkKeyPub,
            contractAddress: contractAddress,
          },
          { maxFee: 100_000_000_000_000 },
        )
        .catch((error) => {
          // TODO: Handle error ( for now assume it is already deployed )
          // console.error('Error deploying account:', error);
          // throw error;
          return {
            transaction_hash: "Account already exists",
            contract_address: contractAddress,
          };
        });
      if (transaction_hash === "Account already exists") {
        connectAccount(privateKey, accountClassName);
        return;
      }
      await provider!.waitForTransaction(transaction_hash);
      if (__DEV__)
        console.log("✅ New account created.\n   address =", contract_address);
      connectAccount(privateKey, accountClassName);
    },
    [provider, STARKNET_ENABLED, connectAccount],
  );

  const waitForTransaction = useCallback(
    async (txHash: string): Promise<boolean> => {
      if (!provider) {
        console.error("Provider is not initialized");
        return false;
      }

      try {
        if (__DEV__)
          console.log(
            `⏳ Waiting for transaction ${txHash} to be confirmed...`,
          );

        // Wait for the transaction to be accepted on L2
        const receipt = await provider.waitForTransaction(txHash, {
          retryInterval: 2000, // Check every 2 seconds
        });

        // Check if transaction was successful
        if (
          receipt.execution_status === "SUCCEEDED" ||
          receipt.status === "ACCEPTED_ON_L2" ||
          receipt.status === "ACCEPTED_ON_L1"
        ) {
          if (__DEV__)
            console.log(`✅ Transaction ${txHash} confirmed on-chain`);
          return true;
        } else {
          if (__DEV__)
            console.error(`❌ Transaction ${txHash} failed:`, receipt);
          return false;
        }
      } catch (error) {
        if (__DEV__)
          console.error(`❌ Error waiting for transaction ${txHash}:`, error);
        return false;
      }
    },
    [provider],
  );

  const invokeContract = useCallback(
    async (
      contractAddress: string,
      functionName: string,
      args: any[],
      retries: number = 0,
    ) => {
      if (!STARKNET_ENABLED) {
        return;
      }

      if (!account) {
        console.error("Account is not connected.");
        return;
      }

      const invokeFunction = async () => {
        return await account.execute(
          [
            {
              contractAddress,
              entrypoint: functionName,
              calldata: args,
            },
          ],
          {
            maxFee: 100_000_000_000_000,
          },
        );
      };

      const res = await executeWithRetries(
        invokeFunction,
        waitForTransaction,
        retries,
      );

      if (__DEV__)
        console.log(
          `✅ ${functionName} executed successfully. Transaction hash: ${res.transaction_hash}`,
        );
    },
    [account, provider, STARKNET_ENABLED, waitForTransaction],
  );

  const invokeContractCalls = useCallback(
    async (calls: Call[], retries: number = 0) => {
      if (!STARKNET_ENABLED) {
        return;
      }

      if (!account) {
        console.error("Account is not connected.");
        return;
      }

      const invokeFunction = async () => {
        return await account.execute(calls, {
          maxFee: 100_000_000_000_000,
        });
      };

      const res = await executeWithRetries(
        invokeFunction,
        waitForTransaction,
        retries,
      );

      if (__DEV__)
        console.log(
          `✅ Calls executed successfully. Transaction hash: ${res.transaction_hash}`,
        );
    },
    [provider, account, STARKNET_ENABLED, waitForTransaction],
  );

  // privateKey is used if you need to deploy a new account
  const invokeWithPaymaster = useCallback(
    async (calls: Call[], privateKey?: any, retries: number = 0) => {
      if (!STARKNET_ENABLED) {
        return null;
      }

      if (!provider) {
        console.error("Provider is not initialized.");
        return null;
      }

      if (network !== "SN_SEPOLIA" && network !== "SN_MAINNET") {
        console.error(
          "Paymaster is only supported on SN_SEPOLIA and SN_MAINNET chains.",
        );
        return null;
      }

      const deploymentData = privateKey
        ? getDeploymentData(privateKey)
        : undefined;
      if (!account && !deploymentData) {
        console.error("No account connected and no deployment data provided.");
        return null;
      }

      let invokeAccount = account;
      if (!invokeAccount) {
        invokeAccount = new Account(
          provider!,
          generateAccountAddress(privateKey),
          privateKey,
        );
      }

      // Define the paymaster execution function
      const executePaymasterTransaction = async () => {
        const apiKey = process.env.EXPO_PUBLIC_AVNU_PAYMASTER_API_KEY || "";
        if (apiKey === "") {
          // Run using backend paymaster provider
          const formattedCalls = formatCall(calls);
          const focEngineUrl =
            process.env.EXPO_PUBLIC_FOC_ENGINE_API || "http://localhost:8080";
          const buildGaslessTxDataUrl = `${focEngineUrl}/paymaster/build-gasless-tx`;
          const gaslessTxInput = {
            account: invokeAccount.address,
            calls: formattedCalls,
            network: network,
            deploymentData: deploymentData || undefined,
          };

          // Build gasless tx data
          const gaslessTxRes = await fetch(buildGaslessTxDataUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gaslessTxInput),
          })
            .then((response) => response.json())
            .catch((error) => {
              if (__DEV__)
                console.error("Error building gasless tx data:", error);
              throw error;
            });

          if (gaslessTxRes.error) {
            if (__DEV__)
              console.error("Error from build-gasless-tx:", gaslessTxRes);
            throw new Error(gaslessTxRes.error);
          }

          const privateKey =
            (invokeAccount as any).signer?.pk || (invokeAccount as any).pk;

          let signature: any;
          if (!privateKey) {
            if (__DEV__)
              console.error("Could not extract private key from account");
            throw new Error("Private key not accessible for manual signing");
          }

          // Manual EC signing (replaces the internal signing in signMessage)
          signature = ec.starkCurve.sign(
            gaslessTxRes.data.messageHash,
            privateKey,
          );
          if (Array.isArray(signature)) {
            signature = signature.map((sig) => toBeHex(BigInt(sig)));
          } else if (signature.r && signature.s) {
            signature = [
              toBeHex(BigInt(signature.r)),
              toBeHex(BigInt(signature.s)),
            ];
          }

          const sendGaslessTxUrl = `${focEngineUrl}/paymaster/send-gasless-tx`;
          const sendGaslessTxInput = {
            account: invokeAccount.address,
            txData: JSON.stringify(gaslessTxRes.data.typedData),
            signature: signature,
            network: network,
            deploymentData: deploymentData || undefined,
          };

          // Send gasless transaction
          const sendGaslessTxRes = await fetch(sendGaslessTxUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sendGaslessTxInput),
          })
            .then((response) => response.json())
            .catch((error) => {
              if (__DEV__) console.error("Error sending gasless tx:", error);
              throw error;
            });

          if (sendGaslessTxRes.error) {
            if (__DEV__)
              console.error("Error from send-gasless-tx:", sendGaslessTxRes);
            throw new Error(sendGaslessTxRes.error);
          }

          if (sendGaslessTxRes.data?.revertError) {
            if (__DEV__)
              console.log(
                "⚠️ Revert error from paymaster: ",
                sendGaslessTxRes.data.revertError,
              );
            // Don't throw here, let the retry logic handle validation
            throw new Error(
              `Revert error: ${sendGaslessTxRes.data.revertError}`,
            );
          }

          if (__DEV__)
            console.log("📤 Gasless transaction sent:", sendGaslessTxRes);
          return sendGaslessTxRes;
        } else {
          // Use gasless-sdk to execute calls with paymaster
          const options: GaslessOptions = {
            baseUrl: network === "SN_SEPOLIA" ? SEPOLIA_BASE_URL : BASE_URL,
            apiKey,
          };
          const res = await executeCalls(
            invokeAccount,
            calls,
            { deploymentData },
            options,
          ).catch((error) => {
            if (__DEV__)
              console.error("Error executing calls with paymaster:", error);
            throw error;
          });
          if (__DEV__)
            console.log("Response from executeCalls with paymaster:", res);
          // TODO: Check response format
          return { data: { transactionHash: res } };
        }
      };

      // Apply retry logic if requested
      if (retries > 0) {
        return await executeWithRetries(
          executePaymasterTransaction,
          waitForTransaction,
          retries,
        );
      } else {
        return await executePaymasterTransaction();
      }
    },
    [
      provider,
      network,
      account,
      STARKNET_ENABLED,
      connectAccount,
      waitForTransaction,
    ],
  );

  const invokeCalls = useCallback(
    async (calls: Call[], retries: number = 0) => {
      if (!STARKNET_ENABLED) {
        return null;
      }
      if (__DEV__) console.log("🚀 Invoking contract calls:", calls.length);
      if (network === "SN_DEVNET") {
        await invokeContractCalls(calls, retries);
        // TODO: Get real transaction hash from devnet
        return {
          data: {
            transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
          },
        };
      } else {
        return await invokeWithPaymaster(calls, undefined, retries);
      }
    },
    [invokeWithPaymaster, invokeContractCalls, network, STARKNET_ENABLED],
  );

  const value = {
    STARKNET_ENABLED,
    network,
    account,
    provider,
    storePrivateKey,
    clearPrivateKey,
    clearPrivateKeys,
    getAvailableKeys,
    getPrivateKey,
    generatePrivateKey,
    generateAccountAddress,
    getDeploymentData,
    deployAccount,
    connectStorageAccount,
    connectAccount,
    storeKeyAndConnect,
    disconnectAccount,
    disconnectAndDeleteAccount,
    invokeContract,
    invokeContractCalls,
    invokeWithPaymaster,
    invokeCalls,
    waitForTransaction,
  };
  return (
    <StarknetConnector.Provider value={value}>
      {children}
    </StarknetConnector.Provider>
  );
};
