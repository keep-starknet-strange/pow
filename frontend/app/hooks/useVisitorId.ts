import { useEffect, useState, useMemo } from "react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react-native";
import {
  visitorIdToFelt252,
  FINGERPRINT_CONFIG,
  type SmartSignals,
} from "../configs/fingerprint";

/**
 * Hook to get the visitor ID from fingerprint and convert it to felt252 format.
 * Falls back to "0x0" if fingerprint fails or trial is over.
 *
 * @returns An object containing:
 * - visitorId: The visitor ID in felt252 format (or "0x0" if unavailable)
 * - isLoading: Whether the fingerprint data is still loading
 * - rawVisitorData: The raw visitor data object from fingerprintjs
 * - hasVisitorId: Whether a valid visitor ID was retrieved
 * - tagEvent: Function to tag a Fingerprint event with custom metadata and linkedId
 * - suspectScore: The suspect score from fingerprint (undefined if not available)
 * - isEmulator: Whether emulator signal was detected (undefined if not available)
 * - isJailbroken: Whether jailbroken signal was detected (iOS, undefined if not available)
 * - isRooted: Whether rootApps signal was detected (Android, undefined if not available)
 * - isFrida: Whether frida signal was detected (undefined if not available)
 * - isClonedApp: Whether clonedApp signal was detected (Android, undefined if not available)
 * - isHighActivity: Whether highActivity signal was detected (undefined if not available)
 * - hasRecentFactoryReset: Whether factory reset was detected recently (undefined if not available)
 * - isDeviceBlocked: Whether the device should be blocked based on suspect score or any suspicious signals
 */
export function useVisitorId() {
  const { data: visitorData, isLoading, error, getData } = useVisitorData();
  const [visitorId, setVisitorId] = useState<string>("0x0");
  const [hasVisitorId, setHasVisitorId] = useState<boolean>(false);

  // Extract suspect score
  const suspectScore = useMemo(() => {
    // Type assertion needed as FingerprintJS types may not include suspectScore
    const data = visitorData as any;
    if (!data?.suspectScore?.data || data.suspectScore.data.result === undefined) {
      return undefined;
    }
    return data.suspectScore.data.result as number;
  }, [visitorData]);

  // Extract all device integrity and abuse prevention signals
  const signals = useMemo(() => {
    // Type assertion needed as FingerprintJS types may not include signals
    const data = visitorData as any;
    return data?.signals as SmartSignals | undefined;
  }, [visitorData]);

  // Device integrity signals
  const isEmulator = useMemo(() => {
    return signals?.emulator?.data?.result === true;
  }, [signals]);

  const isJailbroken = useMemo(() => {
    return signals?.jailbroken?.data?.result === true;
  }, [signals]);

  const isRooted = useMemo(() => {
    return signals?.rootApps?.data?.result === true;
  }, [signals]);

  const isFrida = useMemo(() => {
    return signals?.frida?.data?.result === true;
  }, [signals]);

  const isClonedApp = useMemo(() => {
    return signals?.clonedApp?.data?.result === true;
  }, [signals]);

  // Abuse prevention signals
  const isHighActivity = useMemo(() => {
    return signals?.highActivity?.data?.result === true;
  }, [signals]);

  // Factory reset detection - check if reset was recent (not epoch and within last 30 days)
  const hasRecentFactoryReset = useMemo(() => {
    const factoryReset = signals?.factoryReset;
    if (!factoryReset?.data) {
      return undefined;
    }

    const timestamp = factoryReset.data.timestamp;
    // Epoch (0) means never reset (or iOS simulator)
    if (timestamp === 0) {
      return false;
    }

    // Check if reset was within last 30 days (30 * 24 * 60 * 60 * 1000 ms)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const resetTime = timestamp * 1000; // Convert to milliseconds
    return resetTime > thirtyDaysAgo;
  }, [signals]);

  // Check if device should be blocked
  const isDeviceBlocked = useMemo(() => {
    if (isLoading || error || !visitorData) {
      return false; // Don't block while loading or on error
    }

    // Check suspect score threshold
    if (suspectScore !== undefined && suspectScore >= FINGERPRINT_CONFIG.suspectScoreThreshold) {
      if (__DEV__) {
        console.log("useVisitorId: Device blocked due to suspect score:", suspectScore);
      }
      return true;
    }

    // Check device integrity signals
    if (isEmulator === true) {
      if (__DEV__) {
        console.log("useVisitorId: Device blocked due to emulator detection");
      }
      return true;
    }

    if (isJailbroken === true) {
      if (__DEV__) {
        console.log("useVisitorId: Device blocked due to jailbroken detection");
      }
      return true;
    }

    if (isRooted === true) {
      if (__DEV__) {
        console.log("useVisitorId: Device blocked due to rooted device detection");
      }
      return true;
    }

    if (isFrida === true) {
      if (__DEV__) {
        console.log("useVisitorId: Device blocked due to Frida detection");
      }
      return true;
    }

    if (isClonedApp === true) {
      if (__DEV__) {
        console.log("useVisitorId: Device blocked due to cloned app detection");
      }
      return true;
    }

    // Check abuse prevention signals
    if (isHighActivity === true) {
      if (__DEV__) {
        console.log("useVisitorId: Device blocked due to high activity detection");
      }
      return true;
    }

    if (hasRecentFactoryReset === true) {
      if (__DEV__) {
        console.log("useVisitorId: Device blocked due to recent factory reset");
      }
      return true;
    }

    return false;
  }, [
    isLoading,
    error,
    visitorData,
    suspectScore,
    isEmulator,
    isJailbroken,
    isRooted,
    isFrida,
    isClonedApp,
    isHighActivity,
    hasRecentFactoryReset,
  ]);

  // Debug logging
  useEffect(() => {
    if (__DEV__) {
      console.log("useVisitorId: Hook state update:", {
        isLoading,
        error,
        visitorData: visitorData ? "present" : "undefined",
        visitorId: visitorData?.visitorId,
        confidence: visitorData?.confidence?.score,
        suspectScore,
        isEmulator,
        isJailbroken,
        isRooted,
        isFrida,
        isClonedApp,
        isHighActivity,
        hasRecentFactoryReset,
        isDeviceBlocked,
        hasGetData: !!getData,
        visitorDataFull: visitorData,
      });
    }
  }, [
    isLoading,
    error,
    visitorData,
    getData,
    suspectScore,
    isEmulator,
    isJailbroken,
    isRooted,
    isFrida,
    isClonedApp,
    isHighActivity,
    hasRecentFactoryReset,
    isDeviceBlocked,
  ]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      if (__DEV__) {
        console.error("useVisitorId: Fingerprint error:", error);
      }
      setVisitorId("0x0");
      setHasVisitorId(false);
      return;
    }

    if (!visitorData?.visitorId) {
      // No visitor ID available (trial ended, API failure, etc.)
      setVisitorId("0x0");
      setHasVisitorId(false);
      if (__DEV__) {
        console.log(
          "useVisitorId: No visitor ID available, using fallback 0x0",
          {
            visitorData,
            error,
            hasVisitorData: !!visitorData,
            visitorIdInData: visitorData?.visitorId,
            confidence: visitorData?.confidence?.score,
            confidenceThreshold: FINGERPRINT_CONFIG.confidenceThreshold,
          },
        );
      }
      return;
    }

    // Convert visitor ID to felt252 format
    const visitorIdFelt = visitorIdToFelt252(visitorData.visitorId);
    setVisitorId(visitorIdFelt);
    setHasVisitorId(true);
    if (__DEV__) {
      console.log(
        "useVisitorId: Successfully loaded visitor ID:",
        visitorIdFelt,
      );
      console.log("useVisitorId: Confidence:", visitorData.confidence?.score);
    }
  }, [visitorData, isLoading, error]);

  // Function to tag events with custom metadata and linkedId
  const tagEvent = async (
    tag: Record<string, any>,
    linkedId?: string,
  ): Promise<any> => {
    if (!getData) {
      if (__DEV__) {
        console.warn("useVisitorId: getData is not available for tagging");
      }
      return null;
    }

    try {
      const result = await getData(tag, linkedId);
      if (__DEV__) {
        console.log("useVisitorId: Tagged event:", {
          tag,
          linkedId,
          visitorId: result?.visitorId,
          requestId: result?.requestId,
        });
      }
      return result;
    } catch (error) {
      if (__DEV__) {
        console.error("useVisitorId: Error tagging event:", error);
      }
      throw error;
    }
  };

  return {
    visitorId,
    isLoading,
    error,
    rawVisitorData: visitorData,
    hasVisitorId,
    tagEvent,
    suspectScore,
    isEmulator,
    isJailbroken,
    isRooted,
    isFrida,
    isClonedApp,
    isHighActivity,
    hasRecentFactoryReset,
    isDeviceBlocked,
  };
}
