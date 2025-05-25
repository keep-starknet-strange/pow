import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { Account } from "starknet";

export const FOC_ENGINE_API = process.env.EXPO_PUBLIC_FOC_ENGINE_API || "http://localhost:8080";

type FocAccount = {
  account_address: string;
  contract_address: string;
  account: {
    username: string;
  };
};

type FocEngineContextType = {
  registryContractAddress: string | null;
  accountsContractAddress: string | null;
  user: FocAccount | null;

  getAccount: (accountAddress: string) => Promise<FocAccount | null>;
  connectAccount: (accountAddress: string) => Promise<void>;
  claimUsername: (account: Account | null, username: string) => Promise<any>;

  getRegisteredContract: (contractName: string, contractVersion?: string) => Promise<string | null>;
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
    fetchRegistryContractAddress();
    fetchAccountsContractAddress();
  }, [fetchRegistryContractAddress, fetchAccountsContractAddress]);

  const connectAccount = useCallback(async (accountAddress: string) => {
    const accountData = await getAccount(accountAddress);
    if (accountData) {
      setUser(accountData);
    } else {
      console.error("Failed to fetch account data");
    }
  }, []);

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
      console.error("Error fetching account data:", error);
      return null;
    }
  }, []);

  const claimUsername = useCallback(async (account: Account | null, username: string) => {
    if (!account) {
      console.error("Account is not connected");
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
    console.log(`Claiming username ${username} for account ${account.address} on ${accountsContractAddress}`);
    const res = await account.execute({
      contractAddress: accountsContractAddress,
      entrypoint: "claim_username",
      calldata: [usernameHex],
    }, { maxFee: 100_000_000_000_000, }).catch((err) => {
      console.error("Error claiming username:", err);
      return null;
    });
    console.log(`Claim username Tx hash: ${res?.transaction_hash}`);
    await account.waitForTransaction(res!.transaction_hash);
    console.log(`✅ Claim tx ${res!.transaction_hash} confirmed`);
    await connectAccount(account.address);
    return res;
  }, [accountsContractAddress]);

  const getRegisteredContract = useCallback(async (contractName: string, contractVersion: string = "latest") => {
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

  return (
    <FocEngineConnector.Provider value={{
      user, registryContractAddress, accountsContractAddress,
      getAccount, claimUsername, connectAccount,
      getRegisteredContract
    }}>
      {children}
    </FocEngineConnector.Provider>
  );
};
