import { useEffect, useState } from "react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react-native";
import { visitorIdToFelt252 } from "../configs/fingerprint";

/**
 * Hook to get the visitor ID from fingerprint and convert it to felt252 format.
 * Falls back to "0x0" if fingerprint fails or trial is over.
 * 
 * @returns An object containing:
 * - visitorId: The visitor ID in felt252 format (or "0x0" if unavailable)
 * - isLoading: Whether the fingerprint data is still loading
 * - rawVisitorData: The raw visitor data object from fingerprintjs
 * - hasVisitorId: Whether a valid visitor ID was retrieved
 */
export function useVisitorId() {
  const { data: visitorData, isLoading, error } = useVisitorData();
  const [visitorId, setVisitorId] = useState<string>("0x0");
  const [hasVisitorId, setHasVisitorId] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!visitorData?.visitorId) {
      // No visitor ID available (trial ended, API failure, etc.)
      setVisitorId("0x0");
      setHasVisitorId(false);
      if (__DEV__) {
        console.log("useVisitorId: No visitor ID available, using fallback 0x0");
      }
      return;
    }

    // Convert visitor ID to felt252 format
    const visitorIdFelt = visitorIdToFelt252(visitorData.visitorId);
    setVisitorId(visitorIdFelt);
    setHasVisitorId(true);
    if (__DEV__) {
      console.log("useVisitorId: Successfully loaded visitor ID:", visitorIdFelt);
      console.log("useVisitorId: Confidence:", visitorData.confidence?.score);
    }
  }, [visitorData, isLoading, error]);

  return {
    visitorId,
    isLoading,
    error,
    rawVisitorData: visitorData,
    hasVisitorId,
  };
}

