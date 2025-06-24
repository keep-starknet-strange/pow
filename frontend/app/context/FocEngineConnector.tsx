import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { useStarknetConnector } from "./StarknetConnector";

export const FOC_ENGINE_API = process.env.EXPO_PUBLIC_FOC_ENGINE_API || "http://localhost:8080";

type FocAccount = {
  account_address: string;
  contract_address: string;
  account: {
    username: string;
  };
};

type FocAccounts = {
  accounts: {
    username: string;
    address: string;
  }[];
};

type FocEngineContextType = {
  registryContractAddress: string | null;
  accountsContractAddress: string | null;
  user: FocAccount | null;

  getAccount: (accountAddress: string) => Promise<FocAccount | null>;
  getAccounts: (addresses: string[]) => Promise<FocAccounts | null>;
  refreshAccount: () => Promise<void>;
  claimUsername: (username: string) => Promise<any>;
  mintFunds: (address: string, amount: bigint, unit?: string) => Promise<any>;

  getRegisteredContract: (contractName: string, contractVersion?: string) => Promise<string | null>;
  getLatestEventWith: (contractAddress: string, eventType: string, filters?: Record<string, any>) => Promise<any>;
  getUniqueEventsWith: (contractAddress: string, eventType: string, uniqueKey: string, filters?: Record<string, any>) => Promise<any>;
  getUniqueEventsOrdered: (contractAddress: string, eventType: string, uniqueKey: string, orderKey: string, filters?: Record<string, any>) => Promise<any>;
};

const FocEngineConnector = createContext<FocEngineContextType | undefined>(undefined);

const toShortHexString = (baseString: string) => {
  const maxLength = 31;
  if (baseString.length > maxLength) {
    console.error(`String is too long: ${baseString}; max length is ${maxLength}`);
    return null;
  }
  const hexString = Array.from(baseString).map(char => char.charCodeAt(0).toString(16)).join("");
  return `0x${hexString}`;
}

export const useFocEngine = () => {
  const context = useContext(FocEngineConnector);
  if (!context) {
    throw new Error("useFocEngine must be used within a FocEngineProvider");
  }
  return context;
}

export const FocEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account, network, invokeContractCalls, invokeWithPaymaster, STARKNET_ENABLED } = useStarknetConnector();

  const [registryContractAddress, setRegistryContractAddress] = useState<string | null>(null);
  const [accountsContractAddress, setAccountsContractAddress] = useState<string | null>(null);
  const [user, setUser] = useState<FocAccount | null>(null);

  const fetchRegistryContractAddress = useCallback(async () => {
    try {
      const response = await fetch(`${FOC_ENGINE_API}/registry/get-registry-contracts`);
      if (!response.ok) {
        throw new Error("Failed to fetch registry contract address");
      }
      const data = await response.json();
      // Example response: {"data": {"registry_contracts":["0x05ed0ed4c048e4e30b0aa68410b4344d7c0b6fd92540f57e06a3c7cc43a0cf1a"]}}
      setRegistryContractAddress(data.data.registry_contracts[0]);
    } catch (error) {
      console.error("Error fetching registry contract address:", error);
    }
  }, []);

  const fetchAccountsContractAddress = useCallback(async () => {
    try {
      const response = await fetch(`${FOC_ENGINE_API}/accounts/get-accounts-contracts`);
      if (!response.ok) {
        throw new Error("Failed to fetch accounts contract address");
      }
      const data = await response.json();
      // Example response: {"data": {"accounts_contract":"0x23386fe159ca18338f619b0a753e124db2cebd45f23cc992ce693cde465d617"}}
      setAccountsContractAddress(data.data.accounts_contract);
    } catch (error) {
      console.error("Error fetching accounts contract address:", error);
    }
  }, []);

  useEffect(() => {
    if (!STARKNET_ENABLED) {
      console.warn("Starknet is not enabled, skipping contract address fetch");
      return;
    }

    fetchRegistryContractAddress();
    fetchAccountsContractAddress();
  }, [fetchRegistryContractAddress, fetchAccountsContractAddress, STARKNET_ENABLED]);

  const refreshAccount = useCallback(async () => {
    if (!account) {
      console.error("No user account connected");
      setUser(null);
      return;
    }
    console.log(`Refreshing account data for address: ${account.address}`);
    const accountData = await getAccount(account.address);
    if (accountData) {
      setUser(accountData);
    } else {
      // If no account data is found, set a default user object
      setUser({
        account_address: account.address,
        contract_address: accountsContractAddress || "",
        account: { username: "" },
      });
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      refreshAccount();
    }
  }, [account]);

  const getAccount = useCallback(async (accountAddress: string) => {
    try {
      const response = await fetch(`${FOC_ENGINE_API}/accounts/get-account?accountAddress=${accountAddress}`);
      if (!response.ok) {
        throw new Error("Failed to fetch account data");
      }
      const data = await response.json();
      // Example response: {"data": {"account":{"username":"magic"},"account_address":"0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691","contract_address":"0x23386fe159ca18338f619b0a753e124db2cebd45f23cc992ce693cde465d617"}}
      return data.data;
    } catch (error) {
      return null;
    }
  }, []);

  const getAccounts = useCallback(async (addresses: string[]) => {
    if (!STARKNET_ENABLED) {
      return [];
    }
    try {
      const response = await fetch(`${FOC_ENGINE_API}/accounts/get-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresses }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch accounts data");
      }
      const data = await response.json();
      // Example response: {"data": [{"account":{"username":"magic"},"account_address":"0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691","contract_address":"0x23386fe159ca18338f619b0a753e124db2cebd45f23cc992ce693cde465d617"}]}
      return data.data;
    } catch (error) {
      console.error("Error fetching accounts:", error);
      return null;
    }
  }, [STARKNET_ENABLED]);

  const claimUsername = useCallback(async (username: string) => {
    if (!STARKNET_ENABLED) {
      setUser({
        account_address: account?.address || "",
        contract_address: accountsContractAddress || "",
        account: { username },
      });
      return;
    }

    // TODO: Check if username is already claimed?
    if (!accountsContractAddress) {
      console.error("Accounts contract address is not set");
      return;
    }

    const usernameHex = toShortHexString(username);
    if (!usernameHex) {
      console.error("Username invalid");
      return;
    }
    console.log(`Claiming username: ${username}`);
    const call = {
      contractAddress: accountsContractAddress,
      entrypoint: "claim_username",
      calldata: [usernameHex],
    };
    if (network === "SN_DEVNET") {
      await invokeContractCalls([call]);
    } else {
      await invokeWithPaymaster([call]);
    }
    await refreshAccount(); // TODO: delays can cause issues, consider using a more robust solution
  }, [accountsContractAddress, invokeWithPaymaster, STARKNET_ENABLED, account, network, invokeContractCalls]);

  const mintFunds = async (address: string, amount: bigint, unit?: string) => {
    if (!STARKNET_ENABLED) {
      return;
    }

    const res = await fetch(`${FOC_ENGINE_API}/accounts/mint-funds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: address,
        amount: amount.toString(),
        unit: unit || "FRI"
      }),
    });
    if (!res.ok) {
      const errorText = await res.json();
      console.error("Failed to mint funds:", errorText);
      return;
    }
    const data = await res.json();
    console.log("Minted funds:", address, amount, unit, data);
    return data;
  };

  const getRegisteredContract = useCallback(async (contractName: string, contractVersion: string = "latest") => {
    if (!STARKNET_ENABLED) {
      return null;
    }
    try {
      const contractNameHex = toShortHexString(contractName);
      if (!contractNameHex) {
        console.error("Contract name is invalid");
        return null;
      }
      const contractVersionHex = toShortHexString(contractVersion);
      if (!contractVersionHex) {
        console.error("Contract version is invalid");
        return null;
      }
      const response = await fetch(`${FOC_ENGINE_API}/registry/get-registered-contract?contractName=${contractNameHex}&contractVersion=${contractVersionHex}`);
      if (!response.ok) {
        throw new Error("Failed to fetch registered contract");
      }
      const data = await response.json();
      // Example response: {"data": {"_id":"68329c6719d52373c50d2f9b","block_number":7,"contract":{"version":"0x76302e302e31","class_hash":"0x4be80b63cfff1fef3474af7f67e0df944ea5fb14c71926685a32d3e0bc53351","name":"0x506f772047616d65"},"contract_address":"0x315c74955e8eb4442a11d8aa0d614e14a7ed84de79b65b21143c5f8ba69c286","event_type":"onchain::registry::FocRegistry::ContractRegistered","transaction_hash":"0x2ee1697136f73048618370503fc477044ec92de1ff8ac4370be04d4bb9be911"}}
      return data.data.contract_address;
    } catch (error) {
      console.error("Error fetching registered contract:", error);
      return null;
    }
  }, []);

  const getLatestEventWith = useCallback(async (contractAddress: string, eventType: string, filters: Record<string, any> = {}) => {
    if (!STARKNET_ENABLED) {
      return null;
    }
    try {
      const response = await fetch(`${FOC_ENGINE_API}/events/get-latest-with?contractAddress=${contractAddress}&eventType=${eventType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch latest event");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching latest event:", error);
      return null;
    }
  }, []);

  const getUniqueEventsWith = useCallback(async (contractAddress: string, eventType: string, uniqueKey: string, filters: Record<string, any> = {}) => {
    if (!STARKNET_ENABLED) {
      return null;
    }
    try {
      const response = await fetch(`${FOC_ENGINE_API}/events/get-unique-with?contractAddress=${contractAddress}&eventType=${eventType}&uniqueKey=${uniqueKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch unique event");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching unique event:", error);
      return null;
    }
  }, []);

  const getUniqueEventsOrdered = useCallback(async (contractAddress: string, eventType: string, uniqueKey: string,
  orderKey: string, filters: Record<string, any> = {}) => {
    if (!STARKNET_ENABLED) {
      return null;
    }
    try {
      const response = await fetch(`${FOC_ENGINE_API}/events/get-unique-ordered?contractAddress=${contractAddress}&eventType=${eventType}&uniqueKey=${uniqueKey}&orderKey=${orderKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching unique ordered events:", error);
        throw new Error("Failed to fetch unique ordered events");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching unique ordered events:", error);
      return null;
    }
  }, []);
  
  return (
    <FocEngineConnector.Provider value={{
      user, registryContractAddress, accountsContractAddress,
      refreshAccount, getAccount, claimUsername, mintFunds,
      getRegisteredContract, getLatestEventWith, getUniqueEventsWith, getUniqueEventsOrdered, getAccounts
    }}>
      {children}
    </FocEngineConnector.Provider>
  );
};
