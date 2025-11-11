import { useEffect, useState } from "react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react-native";
import { visitorIdToFelt252, FINGERPRINT_CONFIG } from "../configs/fingerprint";

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
 */
export function useVisitorId() {
  const { data: visitorData, isLoading, error, getData } = useVisitorData();
  const [visitorId, setVisitorId] = useState<string>("0x0");
  const [hasVisitorId, setHasVisitorId] = useState<boolean>(false);

  // Debug logging
  useEffect(() => {
    if (__DEV__) {
      console.log("useVisitorId: Hook state update:", {
        isLoading,
        error,
        visitorData: visitorData ? "present" : "undefined",
        visitorId: visitorData?.visitorId,
        confidence: visitorData?.confidence?.score,
        hasGetData: !!getData,
        visitorDataFull: visitorData,
      });
    }
  }, [isLoading, error, visitorData, getData]);

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
  };
}
