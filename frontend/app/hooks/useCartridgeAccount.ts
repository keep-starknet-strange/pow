import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import * as Crypto from "expo-crypto";
import { constants, ec, hash, CallData } from "starknet";
import { useStarknetConnector } from "../context/StarknetConnector";
import {
  SEPOLIA_RPC_URL,
  MAINNET_RPC_URL,
  LOCALHOST_RPC_URL,
} from "../context/StarknetConnector";

// Cartridge API URL (for future use)
const CARTRIDGE_API_URL = "https://api.cartridge.gg";

// APP_ID - can be configured via environment variable
const APP_ID =
  process.env.EXPO_PUBLIC_CARTRIDGE_APP_ID || "pow-game";

// Storage keys for Cartridge account info
const STORAGE_KEY_PRIVATE_KEY = "cartridge_private_key";
const STORAGE_KEY_USERNAME = "cartridge_username";
const STORAGE_KEY_ADDRESS = "cartridge_address";

// Helper to generate random private key
const generateRandomKey = (): string => {
  const bytes = new Uint8Array(32);
  Crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Helper to generate username
const generateUsername = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Get chain ID for network
const getChainId = (network: string): string => {
  switch (network) {
    case "SN_SEPOLIA":
      // Sepolia chain ID: 0x534e5f5345504f4c4941
      return "0x534e5f5345504f4c4941";
    case "SN_MAINNET":
      return constants.StarknetChainId.SN_MAIN;
    case "SN_DEVNET":
      // Devnet doesn't have a constant, use a default
      return "0x4445564e4554"; // "DEVNET" in hex
    default:
      return "0x534e5f5345504f4c4941"; // Default to Sepolia
  }
};

// Get RPC URL for network
const getRpcUrl = (network: string): string => {
  switch (network) {
    case "SN_SEPOLIA":
      return SEPOLIA_RPC_URL;
    case "SN_MAINNET":
      return MAINNET_RPC_URL;
    case "SN_DEVNET":
      return LOCALHOST_RPC_URL;
    default:
      return SEPOLIA_RPC_URL;
  }
};

// Generate account address from private key
// Uses a simple deterministic approach - in production this would use Cartridge Controller API
const generateAccountAddress = (privateKey: string, username: string): string => {
  try {
    // Generate public key from private key
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    
    // Create a deterministic address based on public key and username
    // This is a simplified approach - actual Cartridge Controller would use class hash and constructor
    const salt = hash.starknetKeccak(username);
    const address = hash.calculateContractAddressFromHash(
      publicKey,
      "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003", // Argent X class hash as default
      CallData.compile({ owner: publicKey, guardian: "0x0" }),
      salt,
    );
    
    return address;
  } catch (error) {
    if (__DEV__) console.error("Error generating account address:", error);
    // Fallback: use public key directly (not ideal but works)
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    return `0x${publicKey.slice(0, 64)}`;
  }
};

export const useCartridgeAccount = () => {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if account exists in storage
  const checkExistingAccount = useCallback(async (): Promise<boolean> => {
    try {
      const storedAddress = await AsyncStorage.getItem(STORAGE_KEY_ADDRESS);
      const storedPrivateKey = await AsyncStorage.getItem(STORAGE_KEY_PRIVATE_KEY);
      const storedUsername = await AsyncStorage.getItem(STORAGE_KEY_USERNAME);

      if (storedAddress && storedPrivateKey && storedUsername) {
        // Verify the stored address matches what we'd generate from the stored credentials
        try {
          const calculatedAddress = generateAccountAddress(storedPrivateKey, storedUsername);
          
          // Check if addresses match (case-insensitive)
          if (calculatedAddress.toLowerCase() === storedAddress.toLowerCase()) {
            setAccountAddress(storedAddress);
            return true;
          } else {
            // Address mismatch - credentials might be corrupted, clear and recreate
            if (__DEV__) {
              console.warn("Stored address doesn't match calculated address, clearing storage");
            }
            await AsyncStorage.multiRemove([
              STORAGE_KEY_PRIVATE_KEY,
              STORAGE_KEY_USERNAME,
              STORAGE_KEY_ADDRESS,
            ]);
            return false;
          }
        } catch (e) {
          if (__DEV__) console.error("Failed to verify stored account:", e);
          // If verification fails, use stored address anyway
          setAccountAddress(storedAddress);
          return true;
        }
      }
      return false;
    } catch (error) {
      if (__DEV__) console.error("Error checking existing account:", error);
      return false;
    }
  }, []);

  // Create a new account
  const createAccount = useCallback(
    async (username?: string): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        // Generate or use provided username
        const accountUsername = username || generateUsername();

        // Generate private key
        const privateKey = generateRandomKey();

        // Generate deterministic address from private key and username
        const address = generateAccountAddress(privateKey, accountUsername);

        // Save to storage
        await AsyncStorage.setItem(STORAGE_KEY_PRIVATE_KEY, privateKey);
        await AsyncStorage.setItem(STORAGE_KEY_USERNAME, accountUsername);
        await AsyncStorage.setItem(STORAGE_KEY_ADDRESS, address);

        setAccountAddress(address);

        // Note: Account deployment (signup) would happen here in a full Cartridge integration
        // For now, we just create the account locally. The address is valid even if not deployed.
        if (__DEV__) {
          console.log("✅ Cartridge account created:", address);
        }

        setIsLoading(false);
        return address;
      } catch (error) {
        const errorMsg = `Failed to create account: ${error}`;
        setError(errorMsg);
        setIsLoading(false);
        throw new Error(errorMsg);
      }
    },
    [],
  );

  // Login with existing account
  const login = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const hasAccount = await checkExistingAccount();

      if (!hasAccount) {
        throw new Error("No existing account found. Please create a new account.");
      }

      if (!accountAddress) {
        throw new Error("Account address not available");
      }

      setIsLoading(false);
      return accountAddress;
    } catch (error) {
      const errorMsg = `Failed to login: ${error}`;
      setError(errorMsg);
      setIsLoading(false);
      throw new Error(errorMsg);
    }
  }, [checkExistingAccount, accountAddress]);

  // Initialize: Check for existing account on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await checkExistingAccount();
      } catch (error) {
        if (__DEV__) console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [checkExistingAccount]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEY_PRIVATE_KEY,
        STORAGE_KEY_USERNAME,
        STORAGE_KEY_ADDRESS,
      ]);
      setAccountAddress(null);
    } catch (error) {
      if (__DEV__) console.error("Logout error:", error);
    }
  }, []);

  return {
    accountAddress,
    isLoading,
    error,
    createAccount,
    login,
    logout,
    hasAccount: accountAddress !== null,
  };
};


