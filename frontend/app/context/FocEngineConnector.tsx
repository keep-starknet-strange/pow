import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { Call, Contract } from "starknet";
import { useStarknetConnector } from "./StarknetConnector";

export const FOC_ENGINE_API =
  process.env.EXPO_PUBLIC_FOC_ENGINE_API || "http://localhost:8080";

export type FocAccount = {
  account_address: string;
  contract_address: string;
  account: {
    username: string;
    metadata: string[] | null; // Optional metadata field
  };
};

type FocEngineContextType = {
  registryContractAddress: string | null;
  registryContract: Contract | null;
  accountsContractAddress: string | null;
  accountsContract: Contract | null;
  userContract: string | undefined;
  user: FocAccount | null;

  connectContract: (contractAddress: string) => void;
  getAccount: (
    accountAddress: string,
    contract?: string,
    includeMetadata?: boolean,
  ) => Promise<FocAccount | null>;
  getAccounts: (
    addresses: string[],
    contract?: string,
    includeMetadata?: boolean,
  ) => Promise<FocAccount[] | null>;
  refreshUser: (contract?: string) => Promise<void>;
  claimUsername: (username: string, contract?: string) => Promise<void>;
  isUsernameUnique: (username: string, contract?: string) => Promise<boolean>;
  isUsernameValid: (username: string) => boolean;
  setUserMetadata: (metadata: string[], contract?: string) => Promise<void>;
  initializeAccount: (
    username: string,
    metadata: string[],
    contract?: string,
  ) => Promise<void>;
  usernameValidationError: string;
  mintFunds: (address: string, amount: bigint, unit?: string) => Promise<any>;

  getRegisteredContract: (
    contractName: string,
    contractVersion?: string,
  ) => Promise<string | null>;
  getLatestEventWith: (
    contractAddress: string,
    eventType: string,
    filters?: Record<string, any>,
  ) => Promise<any>;
  getUniqueEventsWith: (
    contractAddress: string,
    eventType: string,
    uniqueKey: string,
    filters?: Record<string, any>,
  ) => Promise<any>;
  getUniqueEventsOrdered: (
    contractAddress: string,
    eventType: string,
    uniqueKey: string,
    orderKey: string,
    filters?: Record<string, any>,
  ) => Promise<any>;
};

const FocEngineConnector = createContext<FocEngineContextType | undefined>(
  undefined,
);

const toShortHexString = (baseString: string) => {
  const maxLength = 31;
  if (baseString.length > maxLength) {
    console.error(
      `String is too long: ${baseString}; max length is ${maxLength}`,
    );
    return null;
  }
  const hexString = Array.from(baseString)
    .map((char) => char.charCodeAt(0).toString(16))
    .join("");
  return `0x${hexString}`;
};

const fromBigNString = (bigNString: bigint | string) => {
  if (typeof bigNString === "bigint") {
    bigNString = `0x` + bigNString.toString(16);
  }
  if (!bigNString.startsWith("0x")) {
    console.error(`Invalid hex string: ${bigNString}`);
    return null;
  }
  const hexWithoutPrefix = bigNString.slice(2);
  let result = "";
  for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
    const code = parseInt(hexWithoutPrefix.slice(i, i + 2), 16);
    result += String.fromCharCode(code);
  }
  return result;
};

const formatMetadata = (metadata: bigint[]) => {
  return metadata.map((item) => {
    return item.toString(16).padStart(64, "0");
  });
};

const fromShortHexString = (hexString: string) => {
  if (!hexString.startsWith("0x")) {
    console.error(`Invalid hex string: ${hexString}`);
    return null;
  }
  const hexWithoutPrefix = hexString.slice(2);
  let result = "";
  for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
    const code = parseInt(hexWithoutPrefix.slice(i, i + 2), 16);
    result += String.fromCharCode(code);
  }
  return result;
};

export const useFocEngine = () => {
  const context = useContext(FocEngineConnector);
  if (!context) {
    throw new Error("useFocEngine must be used within a FocEngineProvider");
  }
  return context;
};

export const FocEngineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    account,
    provider,
    network,
    invokeContractCalls,
    invokeWithPaymaster,
    STARKNET_ENABLED,
  } = useStarknetConnector();

  const [registryContractAddress, setRegistryContractAddress] = useState<
    string | null
  >(null);
  const [registryContract, setRegistryContract] = useState<Contract | null>(
    null,
  );
  const [accountsContractAddress, setAccountsContractAddress] = useState<
    string | null
  >(null);
  const [accountsContract, setAccountsContract] = useState<Contract | null>(
    null,
  );
  const [userContract, setUserContract] = useState<string | undefined>(
    undefined,
  );
  const [user, setUser] = useState<FocAccount | null>(null);

  const fetchRegistryContractAddress = useCallback(async () => {
    try {
      const response = await fetch(
        `${FOC_ENGINE_API}/registry/get-registry-contracts`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch registry contract address");
      }
      const data = await response.json();
      // Example response: {"data": {"registry_contracts":["0x05ed0ed4c048e4e30b0aa68410b4344d7c0b6fd92540f57e06a3c7cc43a0cf1a"]}}
      if (data.data.registry_contracts[0] && provider) {
        const contract = data.data.registry_contracts[0];
        setRegistryContractAddress(contract);
        const { abi: registryAbi } = await provider
          .getClassAt(contract)
          .catch((error) => {
            console.error("Error fetching registry ABI:", error);
            return { abi: null };
          });
        if (registryAbi) {
          const registryContract = new Contract(
            registryAbi,
            contract,
            provider,
          );
          setRegistryContract(registryContract);
        }
      }
    } catch (error) {
      console.error("Error fetching registry contract address:", error);
    }
  }, [provider]);

  const fetchAccountsContractAddress = useCallback(async () => {
    try {
      const response = await fetch(
        `${FOC_ENGINE_API}/accounts/get-accounts-contracts`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch accounts contract address");
      }
      const data = await response.json();
      // Example response: {"data": {"accounts_contract":"0x23386fe159ca18338f619b0a753e124db2cebd45f23cc992ce693cde465d617"}}
      if (data.data.accounts_contract && provider) {
        const contract = data.data.accounts_contract;
        setAccountsContractAddress(contract);
        const { abi: accountsAbi } = await provider
          .getClassAt(contract)
          .catch((error) => {
            console.error("Error fetching accounts ABI:", error);
            return { abi: null };
          });
        if (accountsAbi) {
          const accountsContract = new Contract(
            accountsAbi,
            contract,
            provider,
          );
          setAccountsContract(accountsContract);
        }
      }
    } catch (error) {
      console.error("Error fetching accounts contract address:", error);
    }
  }, [provider]);

  useEffect(() => {
    if (!STARKNET_ENABLED) {
      console.warn("Starknet is not enabled, skipping contract address fetch");
      return;
    }

    fetchRegistryContractAddress();
    fetchAccountsContractAddress();
  }, [
    fetchRegistryContractAddress,
    fetchAccountsContractAddress,
    STARKNET_ENABLED,
  ]);

  useEffect(() => {
    if (!STARKNET_ENABLED || !account) {
      return;
    }
    if (registryContract) {
      registryContract.connect(account);
    }
    if (accountsContract) {
      accountsContract.connect(account);
    }
  }, [account, registryContract, accountsContract, STARKNET_ENABLED]);

  const connectContract = useCallback(
    (contractAddress: string) => {
      if (!STARKNET_ENABLED) {
        return;
      }
      setUserContract(contractAddress);
    },
    [STARKNET_ENABLED, provider, account],
  );

  const getAccount = useCallback(
    async (
      accountAddress: string,
      contract?: string,
      includeMetadata = false,
    ) => {
      if (!STARKNET_ENABLED || !accountsContract) {
        return null;
      }
      try {
        /* TODO: Use foc-engine API to fetch account data 
      const response = await fetch(
        `${FOC_ENGINE_API}/accounts/get-account?accountAddress=${accountAddress}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch account data");
      }
      const data = await response.json();
      // Example response: {"data": {"account":{"username":"magic"},"account_address":"0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691","contract_address":"0x23386fe159ca18338f619b0a753e124db2cebd45f23cc992ce693cde465d617"}}
      return data.data;
       */
        let accountData: any;
        if (contract) {
          accountData = await accountsContract.get_contract_account(
            contract,
            accountAddress,
          );
        } else if (userContract) {
          accountData = await accountsContract.get_contract_account(
            userContract,
            accountAddress,
          );
        } else {
          accountData = await accountsContract.get_account(accountAddress);
        }
        if (!accountData || !accountData.username) {
          console.log(`accountData:`, accountData);
          console.warn(`No account data found for address: ${accountAddress}`);
          return null;
        }
        const account: FocAccount = {
          account_address: accountAddress,
          contract_address:
            contract || userContract || accountsContractAddress || "",
          account: {
            username: fromBigNString(accountData.username) || "",
            metadata: includeMetadata
              ? formatMetadata(accountData.metadata) || null
              : null, // Optional metadata field
          },
        };
        return account;
      } catch (error) {
        return null;
      }
    },
    [STARKNET_ENABLED, accountsContract, accountsContractAddress, userContract],
  );

  const refreshUser = useCallback(
    async (contract?: string) => {
      if (!account) {
        console.error("No user account connected");
        setUser(null);
        return;
      }
      const accountData = await getAccount(account.address, contract, true);
      console.log("Refreshed account data:", accountData);
      if (accountData) {
        setUser(accountData);
      } else {
        // If no account data is found, set a default user object
        setUser({
          account_address: account.address,
          contract_address: accountsContractAddress || "",
          account: { username: "", metadata: null }, // Optional metadata field
        });
      }
    },
    [account, getAccount, accountsContractAddress],
  );

  useEffect(() => {
    if (account) {
      refreshUser(userContract);
    }
  }, [account, userContract]);

  const getAccounts = useCallback(
    async (addresses: string[], contract?: string, includeMetadata = false) => {
      if (!STARKNET_ENABLED || !accountsContract) {
        return [];
      }
      try {
        /* TODO: Use foc-engine API to fetch accounts data
        const response = await fetch(
          `${FOC_ENGINE_API}/accounts/get-accounts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ addresses }),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch accounts data");
        }
        const data = await response.json();
        // Example response: {"data": [{"account":{"username":"magic"},"account_address":"0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691","contract_address":"0x23386fe159ca18338f619b0a753e124db2cebd45f23cc992ce693cde465d617"}]}
        return data.data;
        */
        let accountData: any[] = [];
        if (contract) {
          accountData = await accountsContract.get_contract_accounts(
            contract,
            addresses,
          );
        } else if (userContract) {
          accountData = await accountsContract.get_contract_accounts(
            userContract,
            addresses,
          );
        } else {
          accountData = await accountsContract.get_accounts(addresses);
        }
        if (!accountData || accountData.length === 0) {
          console.log(`accountData:`, accountData);
          console.warn("No accounts found for the provided addresses");
          return null;
        }
        const accounts: FocAccount[] = accountData.map(
          (data: any, index: number) => ({
            account_address: addresses[index],
            contract_address:
              contract || userContract || accountsContractAddress || "",
            account: {
              username: fromBigNString(data.username) || "",
              metadata: includeMetadata
                ? formatMetadata(data.metadata) || null
                : null, // Optional metadata field
            },
          }),
        );
        return accounts;
      } catch (error) {
        console.error("Error fetching accounts:", error);
        return null;
      }
    },
    [STARKNET_ENABLED, accountsContract, accountsContractAddress],
  );

  const claimUsername = useCallback(
    async (username: string, contract?: string) => {
      if (!STARKNET_ENABLED) {
        setUser({
          account_address: account?.address || "",
          contract_address:
            contract || userContract || accountsContractAddress || "",
          account: { username, metadata: null }, // Optional metadata field
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
      let entrypoint = "claim_username";
      let calldata: string[] = [];
      if (contract) {
        entrypoint = "claim_contract_username";
        calldata = [contract, usernameHex];
      } else if (userContract) {
        entrypoint = "claim_contract_username";
        calldata = [userContract, usernameHex];
      } else {
        calldata = [usernameHex];
      }
      const call = {
        contractAddress: accountsContractAddress,
        entrypoint: entrypoint,
        calldata: calldata,
      };
      if (network === "SN_DEVNET") {
        await invokeContractCalls([call]);
      } else {
        await invokeWithPaymaster([call]);
      }
      await refreshUser(contract || userContract); // TODO: delays can cause issues, consider using a more robust solution
    },
    [
      accountsContractAddress,
      invokeWithPaymaster,
      STARKNET_ENABLED,
      account,
      network,
      invokeContractCalls,
      refreshUser,
      userContract,
    ],
  );

  const isUsernameUnique = useCallback(
    async (username: string, contract?: string) => {
      if (!STARKNET_ENABLED || !accountsContract) {
        return true;
      }
      const usernameHex = toShortHexString(username);
      if (!usernameHex) {
        console.error("Username invalid");
        return false;
      }
      try {
        let isClaimed = false;
        if (contract) {
          isClaimed = await accountsContract.is_contract_username_claimed(
            contract,
            usernameHex,
          );
        } else if (userContract) {
          isClaimed = await accountsContract.is_contract_username_claimed(
            userContract,
            usernameHex,
          );
        } else {
          isClaimed = await accountsContract.is_username_claimed(usernameHex);
        }
        return !isClaimed;
      } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return false;
      }
    },
    [STARKNET_ENABLED, accountsContract],
  );

  const usernameValidationError = "3-31 characters, a-z A-Z 0-9 and _ only";
  const isUsernameValid = (username: string) => {
    // Add your validation logic here
    // For example, check length and allowed characters
    const regex = /^[a-zA-Z0-9_]{3,31}$/; // Alphanumeric and underscores, 3-31 characters
    return regex.test(username);
  };

  const setUserMetadata = useCallback(
    async (metadata: string[], contract?: string) => {
      if (!STARKNET_ENABLED || !accountsContract) {
        return;
      }
      if (!account) {
        console.error("No user account connected");
        return;
      }
      if (!accountsContractAddress) {
        console.error("Accounts contract address is not set");
        return;
      }
      let entrypoint = "set_account_metadata";
      let calldata: string[] = [];
      if (contract) {
        entrypoint = "set_contract_account_metadata";
        calldata = [contract, metadata.length.toString(), ...metadata];
      } else if (userContract) {
        entrypoint = "set_contract_account_metadata";
        calldata = [userContract, metadata.length.toString(), ...metadata];
      } else {
        entrypoint = "set_account_metadata";
        calldata = [metadata.length.toString(), ...metadata];
      }
      const call: Call = {
        contractAddress: accountsContractAddress,
        entrypoint: entrypoint,
        calldata: calldata,
      };
      if (network === "SN_DEVNET") {
        await invokeContractCalls([call]);
      } else {
        await invokeWithPaymaster([call]);
      }
      await refreshUser(contract || userContract);
    },
    [
      STARKNET_ENABLED,
      accountsContract,
      accountsContractAddress,
      account,
      invokeWithPaymaster,
      invokeContractCalls,
      network,
      refreshUser,
      userContract,
    ],
  );

  const initializeAccount = useCallback(
    async (username: string, metadata: string[] = [], contract?: string) => {
      if (!STARKNET_ENABLED) {
        setUser({
          account_address: account?.address || "",
          contract_address:
            contract || userContract || accountsContractAddress || "",
          account: { username, metadata: null }, // Optional metadata field
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
      let entrypointClaim = "claim_username";
      let calldataClaim: string[] = [];
      let entrypointMetadata = "set_account_metadata";
      let calldataMetadata: string[] = [];
      if (contract) {
        entrypointClaim = "claim_contract_username";
        calldataClaim = [contract, usernameHex];
        entrypointMetadata = "set_contract_account_metadata";
        calldataMetadata = [contract, metadata.length.toString(), ...metadata];
      } else if (userContract) {
        entrypointClaim = "claim_contract_username";
        calldataClaim = [userContract, usernameHex];
        entrypointMetadata = "set_contract_account_metadata";
        calldataMetadata = [
          userContract,
          metadata.length.toString(),
          ...metadata,
        ];
      } else {
        calldataClaim = [usernameHex];
        calldataMetadata = [metadata.length.toString(), ...metadata];
      }
      const calls = [
        {
          contractAddress: accountsContractAddress,
          entrypoint: entrypointClaim,
          calldata: calldataClaim,
        },
        {
          contractAddress: accountsContractAddress,
          entrypoint: entrypointMetadata,
          calldata: calldataMetadata,
        },
      ];
      console.log("Initializing account with:", calls);
      if (network === "SN_DEVNET") {
        await invokeContractCalls(calls);
      } else {
        await invokeWithPaymaster(calls);
      }
      setUser({
        account_address: account?.address || "",
        contract_address:
          contract || userContract || accountsContractAddress || "",
        account: { username, metadata: metadata || null }, // Optional metadata field
      });
      // await refreshUser(contract || userContract); // TODO: delays can cause issues, consider using a more robust solution
    },
    [
      accountsContractAddress,
      invokeWithPaymaster,
      STARKNET_ENABLED,
      account,
      network,
      invokeContractCalls,
      refreshUser,
      userContract,
    ],
  );

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
        unit: unit || "FRI",
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

  const getRegisteredContract = useCallback(
    async (contractName: string, contractVersion: string = "latest") => {
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
        const response = await fetch(
          `${FOC_ENGINE_API}/registry/get-registered-contract?contractName=${contractNameHex}&contractVersion=${contractVersionHex}`,
        );
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
    },
    [],
  );

  const getLatestEventWith = useCallback(
    async (
      contractAddress: string,
      eventType: string,
      filters: Record<string, any> = {},
    ) => {
      if (!STARKNET_ENABLED) {
        return null;
      }
      try {
        const response = await fetch(
          `${FOC_ENGINE_API}/events/get-latest-with?contractAddress=${contractAddress}&eventType=${eventType}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filters),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch latest event");
        }
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("Error fetching latest event:", error);
        return null;
      }
    },
    [],
  );

  const getUniqueEventsWith = useCallback(
    async (
      contractAddress: string,
      eventType: string,
      uniqueKey: string,
      filters: Record<string, any> = {},
    ) => {
      if (!STARKNET_ENABLED) {
        return null;
      }
      try {
        const response = await fetch(
          `${FOC_ENGINE_API}/events/get-unique-with?contractAddress=${contractAddress}&eventType=${eventType}&uniqueKey=${uniqueKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filters),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch unique event");
        }
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("Error fetching unique event:", error);
        return null;
      }
    },
    [],
  );

  const getUniqueEventsOrdered = useCallback(
    async (
      contractAddress: string,
      eventType: string,
      uniqueKey: string,
      orderKey: string,
      filters: Record<string, any> = {},
    ) => {
      if (!STARKNET_ENABLED) {
        return null;
      }
      try {
        const response = await fetch(
          `${FOC_ENGINE_API}/events/get-unique-ordered?contractAddress=${contractAddress}&eventType=${eventType}&uniqueKey=${uniqueKey}&orderKey=${orderKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filters),
          },
        );
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
    },
    [],
  );

  return (
    <FocEngineConnector.Provider
      value={{
        user,
        registryContractAddress,
        registryContract,
        accountsContractAddress,
        accountsContract,
        refreshUser,
        getAccount,
        claimUsername,
        connectContract,
        userContract,
        setUserMetadata,
        isUsernameUnique,
        isUsernameValid,
        usernameValidationError,
        initializeAccount,
        mintFunds,
        getRegisteredContract,
        getLatestEventWith,
        getUniqueEventsWith,
        getUniqueEventsOrdered,
        getAccounts,
      }}
    >
      {children}
    </FocEngineConnector.Provider>
  );
};
