// frontend/app/hooks/useDeviceFingerprint.ts
import { useCallback, useEffect, useState } from 'react';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react-native';
import { DeviceFingerprint, FingerprintValidationResult } from '../configs/fingerprint';
import { FOC_ENGINE_API } from '../context/FocEngineConnector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fingerprintRateLimiter } from '../utils/rateLimiter';

const FINGERPRINT_STORAGE_KEY = 'device_fingerprint';
const CLAIMED_DEVICES_KEY = 'claimed_reward_devices';
const FINGERPRINT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface UseDeviceFingerprintReturn {
  fingerprint: DeviceFingerprint | null;
  isLoading: boolean;
  error: any;
  refreshFingerprint: () => void;
  isFingerprintValid: boolean;
}

export const useDeviceFingerprint = (): UseDeviceFingerprintReturn => {
  const { isLoading, error, data, getData } = useVisitorData();
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(null);
  const [isFingerprintValid, setIsFingerprintValid] = useState(false);

  // Load cached fingerprint on mount
  useEffect(() => {
    loadCachedFingerprint();
  }, []);

  // Update fingerprint when data changes
  useEffect(() => {
    if (data && !isLoading && !error) {
      debugger;
      const deviceFingerprint: DeviceFingerprint = {
        visitorId: data.visitorId,
        confidence: data.confidence?.score || 0,
        requestId: data.requestId,
        timestamp: Date.now(),
        deviceInfo: {
          os: 'os' in data ? data.os : 'Unknown',
          osVersion: 'osVersion' in data ? data.osVersion : 'Unknown',
          device: 'device' in data ? data.device : 'Unknown',
          browser: 'Unknown', // Not available in React Native version
          browserVersion: 'Unknown', // Not available in React Native version
        },
      };

      console.log("deviceFingerprint", deviceFingerprint);
      
      setFingerprint(deviceFingerprint);
      cacheFingerprint(deviceFingerprint);
      setIsFingerprintValid(true);
    }
  }, [data, isLoading, error]);

  const loadCachedFingerprint = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(FINGERPRINT_STORAGE_KEY);
      if (cached) {
        const parsed: DeviceFingerprint = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cached fingerprint is still valid (within cache duration)
        if (now - parsed.timestamp < FINGERPRINT_CACHE_DURATION) {
          setFingerprint(parsed);
          setIsFingerprintValid(true);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached fingerprint:', error);
    }
    
    // If no valid cached fingerprint, get fresh one
    getData();
  }, [getData]);

  const cacheFingerprint = useCallback(async (deviceFingerprint: DeviceFingerprint) => {
    try {
      await AsyncStorage.setItem(FINGERPRINT_STORAGE_KEY, JSON.stringify(deviceFingerprint));
    } catch (error) {
      console.warn('Failed to cache fingerprint:', error);
    }
  }, []);

  const refreshFingerprint = useCallback(() => {
    setFingerprint(null);
    setIsFingerprintValid(false);
    getData();
  }, [getData]);

  return {
    fingerprint,
    isLoading: isLoading ?? false,
    error,
    refreshFingerprint,
    isFingerprintValid,
  };
};

// Enhanced fingerprint validation hook
export const useFingerprintValidation = () => {
  const { fingerprint, isLoading, error, isFingerprintValid } = useDeviceFingerprint();
  const [validationResult, setValidationResult] = useState<FingerprintValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFingerprint = useCallback(async (userAddress: string) => {
    if (!fingerprint || !isFingerprintValid) {
      throw new Error('Fingerprint not available');
    }

    // Check rate limiting (using visitor ID as identifier)
    if (!fingerprintRateLimiter.isAllowed(fingerprint.visitorId)) {
      const remaining = fingerprintRateLimiter.getRemainingRequests(fingerprint.visitorId);
      const timeUntilReset = fingerprintRateLimiter.getTimeUntilReset(fingerprint.visitorId);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`);
    }

    setIsValidating(true);
    try {
      const response = await fetch(`${FOC_ENGINE_API}/fingerprint/validate-reward-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: fingerprint.visitorId,
          request_id: fingerprint.requestId,
          user_address: userAddress,
          device_info: JSON.stringify(fingerprint.deviceInfo),
        }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const result = await response.json();
      setValidationResult(result);
      return result;
    } catch (error) {
      console.error('Fingerprint validation error:', error);
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [fingerprint, isFingerprintValid]);

  const checkRewardClaimExists = useCallback(async (visitorId: string) => {
    try {
      const response = await fetch(`${FOC_ENGINE_API}/fingerprint/check-reward-claim/${visitorId}`);
      if (!response.ok) {
        return false;
      }
      return await response.json();
    } catch (error) {
      console.error('Check reward claim error:', error);
      return false;
    }
  }, []);

  return {
    fingerprint,
    isLoading: isLoading || isValidating,
    error,
    isFingerprintValid,
    validationResult,
    validateFingerprint,
    checkRewardClaimExists,
  };
};

// Enhanced reward claim protection hook
export const useRewardClaimProtection = () => {
  const { validateFingerprint, validationResult, isLoading } = useFingerprintValidation();
  const [canClaimReward, setCanClaimReward] = useState<boolean>(false);

  const checkRewardEligibility = useCallback(async (userAddress: string) => {
    if (!userAddress) return false;
    
    try {
      const result = await validateFingerprint(userAddress);
      // For reward claims, we want to allow if the device hasn't claimed before
      // is_unique means the device hasn't claimed a reward before
      // is_valid means the fingerprint is valid
      setCanClaimReward(result.is_unique && result.is_valid);
      return result.is_unique && result.is_valid;
    } catch (error) {
      console.error('Reward eligibility check failed:', error);
      setCanClaimReward(false);
      return false;
    }
  }, [validateFingerprint]);

  return {
    canClaimReward,
    validationResult,
    isLoading,
    checkRewardEligibility,
  };
};
