// frontend/app/hooks/useDeviceFingerprint.ts
import { useCallback, useEffect, useState } from 'react';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react-native';
import { DeviceFingerprint } from '../configs/fingerprint';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Simplified reward claim protection hook
export const useRewardClaimProtection = () => {
  const { fingerprint, isLoading, error, isFingerprintValid, refreshFingerprint } = useDeviceFingerprint();
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);

  // Check if this device has already claimed a reward
  const checkRewardClaimStatus = useCallback(async () => {
    if (!fingerprint) return false;
    
    try {
      const claimedDevices = await AsyncStorage.getItem(CLAIMED_DEVICES_KEY);
      if (claimedDevices) {
        const devices: string[] = JSON.parse(claimedDevices);
        const hasClaimed = devices.includes(fingerprint.visitorId);
        setHasClaimedReward(hasClaimed);
        return hasClaimed;
      }
    } catch (error) {
      console.warn('Failed to check reward claim status:', error);
    }
    
    return false;
  }, [fingerprint]);

  // Mark this device as having claimed a reward
  const markRewardAsClaimed = useCallback(async () => {
    if (!fingerprint) return;
    
    try {
      const claimedDevices = await AsyncStorage.getItem(CLAIMED_DEVICES_KEY);
      const devices: string[] = claimedDevices ? JSON.parse(claimedDevices) : [];
      
      if (!devices.includes(fingerprint.visitorId)) {
        devices.push(fingerprint.visitorId);
        await AsyncStorage.setItem(CLAIMED_DEVICES_KEY, JSON.stringify(devices));
        setHasClaimedReward(true);
      }
    } catch (error) {
      console.warn('Failed to mark reward as claimed:', error);
    }
  }, [fingerprint]);

  // Check claim status when fingerprint is available
  useEffect(() => {
    if (fingerprint && isFingerprintValid) {
      checkRewardClaimStatus();
    }
  }, [fingerprint, isFingerprintValid, checkRewardClaimStatus]);

  return {
    fingerprint,
    isLoading: isLoading ?? false,
    error,
    isFingerprintValid,
    hasClaimedReward,
    checkRewardClaimStatus,
    markRewardAsClaimed,
    refreshFingerprint,
  };
};
