import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as AppIntegrity from "expo-app-integrity";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { hash } from "starknet";
import { APP_INTEGRITY_CONFIG } from "../configs/appIntegrity";
import { focFunUrl } from "../api/requests";

// Helper to convert string to felt252
function stringToFelt252(input: string): string {
  // Hash the input using Starknet keccak
  const hashBytes = hash.starknetKeccak(input);
  
  // Convert bigint to hex string with 0x prefix
  return `0x${hashBytes.toString(16)}`;
}

// Helper to generate request hash from account address
function generateRequestHash(accountAddress: string): string {
  const timestamp = Date.now().toString();
  return `${accountAddress}_${timestamp}`;
}

// Helper to generate mock UUID for dev mode
function generateMockUserId(): string {
  const uuid = Crypto.randomUUID();
  return stringToFelt252(uuid);
}

interface UseAppIntegrityReturn {
  generateUniqueUserId: (accountAddress: string) => Promise<string>;
  getUserId: (accountAddress: string) => Promise<string | null>;
  markDeviceAsClaimedForReward: (
    accountAddress: string,
    integrityToken?: string,
  ) => Promise<void>;
  isDeviceEligibleForReward: (
    accountAddress: string,
  ) => Promise<boolean>;
  isPrepared: () => boolean; // Android only
  prepareProvider: () => Promise<void>; // Android only
}

export const useAppIntegrity = (): UseAppIntegrityReturn => {
  const [androidProviderPrepared, setAndroidProviderPrepared] = useState(false);

  // Prepare Android integrity provider on mount
  useEffect(() => {
    if (Platform.OS === "android" && APP_INTEGRITY_CONFIG.android) {
      prepareProvider().catch((error) => {
        if (__DEV__) {
          console.error("Failed to prepare Android integrity provider:", error);
        }
      });
    }
  }, []);

  const prepareProvider = useCallback(async () => {
    if (Platform.OS !== "android") {
      return;
    }

    try {
      await AppIntegrity.prepareIntegrityTokenProviderAsync(
        APP_INTEGRITY_CONFIG.android.cloudProjectNumber,
      );
      setAndroidProviderPrepared(true);
      if (__DEV__) {
        console.log("✅ Android integrity provider prepared");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error preparing integrity provider:", error);
      }
      // Provider preparation failure doesn't prevent app from working
      // User ID will be set to '0' if token request fails later
    }
  }, []);

  const generateUniqueUserId = useCallback(
    async (accountAddress: string): Promise<string> => {
      // Dev mode: generate mock UUID
      if (APP_INTEGRITY_CONFIG.devMode) {
        if (__DEV__) {
          console.log("App Integrity: Dev mode - generating mock user ID");
        }
        const mockUserId = generateMockUserId();
        await SecureStore.setItemAsync(
          `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
          mockUserId,
        );
        return mockUserId;
      }

      try {
        if (Platform.OS === "android") {
          return await generateAndroidUserId(accountAddress);
        } else if (Platform.OS === "ios") {
          return await generateIosUserId(accountAddress);
        } else {
          // Unsupported platform
          if (__DEV__) {
            console.log("App Integrity: Unsupported platform");
          }
          return "0";
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error generating unique user ID:", error);
        }
        // On any error, set user ID to '0'
        await SecureStore.setItemAsync(
          `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
          "0",
        );
        return "0";
      }
    },
    [],
  );

  const generateAndroidUserId = async (
    accountAddress: string,
  ): Promise<string> => {
    // Ensure provider is prepared
    if (!androidProviderPrepared) {
      await prepareProvider();
    }

    // Generate request hash
    const requestHash = generateRequestHash(accountAddress);

    // Request integrity token
    let integrityToken: string;
    try {
      integrityToken = await AppIntegrity.requestIntegrityCheckAsync(
        requestHash,
      );
    } catch (error: any) {
      // Handle provider expiration
      if (
        error?.code === "ERR_APP_INTEGRITY_PROVIDER_INVALID" ||
        error?.message?.includes("provider")
      ) {
        if (__DEV__) {
          console.log("Provider expired, re-preparing...");
        }
        await prepareProvider();
        integrityToken = await AppIntegrity.requestIntegrityCheckAsync(
          requestHash,
        );
      } else {
        throw error;
      }
    }

    // Send token to backend for verification and device recall check
    try {
      const response = await fetch(`${focFunUrl}/app-integrity/verify-android`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrityToken,
          requestHash,
          accountAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend verification failed: ${response.status}`);
      }

      const result = await response.json();

      // Check if device already claimed reward (via device recall)
      if (result.deviceRecall?.bitFirst === true) {
        if (__DEV__) {
          console.log(
            "App Integrity: Device already claimed reward (bitFirst = true)",
          );
        }
        // Store '0' to prevent reward claiming
        await SecureStore.setItemAsync(
          `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
          "0",
        );
        return "0";
      }

      // Generate user ID from token
      const userId = stringToFelt252(integrityToken);
      await SecureStore.setItemAsync(
        `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
        userId,
      );

      return userId;
    } catch (error) {
      if (__DEV__) {
        console.error("Error verifying Android integrity token:", error);
      }
      // If backend verification fails, still generate user ID from token
      // This allows account creation to proceed, but may block reward claiming
      const userId = stringToFelt252(integrityToken);
      await SecureStore.setItemAsync(
        `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
        userId,
      );
      return userId;
    }
  };

  const generateIosUserId = async (accountAddress: string): Promise<string> => {
    // Check if App Attest is supported
    if (!AppIntegrity.isSupported) {
      if (__DEV__) {
        console.log("App Integrity: App Attest not supported on this device");
      }
      return "0";
    }

    try {
      // Generate key
      const keyId = await AppIntegrity.generateKeyAsync();

      // Get challenge from backend for attestation
      let challenge: string;
      let attestationObject: string;
      try {
        const challengeResponse = await fetch(
          `${focFunUrl}/app-integrity/get-challenge`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accountAddress }),
          },
        );

        if (!challengeResponse.ok) {
          throw new Error("Failed to get challenge from backend");
        }

        const challengeData = await challengeResponse.json();
        challenge = challengeData.challenge;

        // Attest the key
        attestationObject = await AppIntegrity.attestKeyAsync(keyId, challenge);

        // Send attestation to backend for verification and device check
        const verifyResponse = await fetch(
          `${focFunUrl}/app-integrity/verify-ios`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              attestationObject,
              keyId,
              accountAddress,
            }),
          },
        );

        if (!verifyResponse.ok) {
          throw new Error("Backend verification failed");
        }

        const verifyResult = await verifyResponse.json();

        // Check if device already claimed reward (via DeviceCheck)
        if (verifyResult.hasClaimedReward === true) {
          if (__DEV__) {
            console.log("App Integrity: Device already claimed reward");
          }
          await SecureStore.setItemAsync(
            `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
            "0",
          );
          return "0";
        }

        // Generate user ID from key ID
        const userId = stringToFelt252(keyId);

        // Store key ID and user ID
        await SecureStore.setItemAsync(
          `${APP_INTEGRITY_CONFIG.storage.keyIdKey}_${accountAddress}`,
          keyId,
        );
        await SecureStore.setItemAsync(
          `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
          userId,
        );

        return userId;
      } catch (error) {
        if (__DEV__) {
          console.error("Error with iOS attestation/verification:", error);
        }
        // If attestation or verification fails, generate user ID from key ID anyway
        const userId = stringToFelt252(keyId);
        await SecureStore.setItemAsync(
          `${APP_INTEGRITY_CONFIG.storage.keyIdKey}_${accountAddress}`,
          keyId,
        );
        await SecureStore.setItemAsync(
          `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
          userId,
        );
        return userId;
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error generating iOS user ID:", error);
      }
      return "0";
    }
  };

  const getUserId = useCallback(
    async (accountAddress: string): Promise<string | null> => {
      try {
        const userId = await SecureStore.getItemAsync(
          `${APP_INTEGRITY_CONFIG.storage.userIdKey}_${accountAddress}`,
        );
        return userId;
      } catch (error) {
        if (__DEV__) {
          console.error("Error getting user ID:", error);
        }
        return null;
      }
    },
    [],
  );

  const markDeviceAsClaimedForReward = useCallback(
    async (
      accountAddress: string,
      integrityToken?: string,
    ): Promise<void> => {
      try {
        if (Platform.OS === "android") {
          // For Android, we need the integrity token to write device recall bits
          if (!integrityToken) {
            if (__DEV__) {
              console.warn(
                "Cannot mark Android device as claimed without integrity token",
              );
            }
            return;
          }

          // Call backend to mark device as claimed via Device Recall API
          await fetch(`${focFunUrl}/app-integrity/mark-device-claimed`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              integrityToken,
              platform: "android",
              accountAddress,
            }),
          });
        } else if (Platform.OS === "ios") {
          // For iOS, backend uses DeviceCheck API
          const keyId = await SecureStore.getItemAsync(
            `${APP_INTEGRITY_CONFIG.storage.keyIdKey}_${accountAddress}`,
          );

          if (!keyId) {
            if (__DEV__) {
              console.warn(
                "Cannot mark iOS device as claimed without key ID",
              );
            }
            return;
          }

          await fetch(`${focFunUrl}/app-integrity/mark-device-claimed`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              keyId,
              platform: "ios",
              accountAddress,
            }),
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error marking device as claimed:", error);
        }
        // Don't throw - this is not critical for the claim flow
      }
    },
    [],
  );

  const isDeviceEligibleForReward = useCallback(
    async (accountAddress: string): Promise<boolean> => {
      const userId = await getUserId(accountAddress);
      if (!userId) {
        return false;
      }
      // User ID of '0' means device already claimed or error occurred
      return userId !== "0";
    },
    [getUserId],
  );

  return {
    generateUniqueUserId,
    getUserId,
    markDeviceAsClaimedForReward,
    isDeviceEligibleForReward,
    isPrepared: () => androidProviderPrepared,
    prepareProvider,
  };
};


