import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useVisitorId } from "../../hooks/useVisitorId";

/**
 * Component that handles authentication on app startup
 * Attempts to authenticate with fingerprint data if not already authenticated
 */
export const AuthInitializer: React.FC = () => {
  const { isAuthenticated, isLoading, authenticateWithFingerprint } = useAuth();
  const { sealedResult, rawVisitorData, isLoading: fingerprintLoading } =
    useVisitorId();

  useEffect(() => {
    // Wait for auth context and fingerprint to load
    if (isLoading || fingerprintLoading) {
      return;
    }

    // If already authenticated, no need to do anything
    if (isAuthenticated) {
      if (__DEV__) {
        console.log("AuthInitializer: Already authenticated");
      }
      return;
    }

    // If we have sealed result, try to authenticate
    if (sealedResult) {
      const requestId = rawVisitorData?.requestId;
      authenticateWithFingerprint(sealedResult, requestId)
        .then((result) => {
          if (result) {
            if (__DEV__) {
              console.log("AuthInitializer: Successfully authenticated on startup");
            }
          } else {
            if (__DEV__) {
              console.warn(
                "AuthInitializer: Failed to authenticate on startup",
              );
            }
          }
        })
        .catch((error) => {
          if (__DEV__) {
            console.error("AuthInitializer: Error during authentication:", error);
          }
        });
    } else {
      if (__DEV__) {
        console.warn(
          "AuthInitializer: No sealed result available for authentication",
        );
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    fingerprintLoading,
    sealedResult,
    rawVisitorData,
    authenticateWithFingerprint,
  ]);

  return null;
};

