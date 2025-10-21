// Fingerprint Pro configuration
export const FINGERPRINT_CONFIG = {
  // Replace with your actual Fingerprint Pro API key
  apiKey: process.env.EXPO_PUBLIC_FINGERPRINT_API_KEY || 'YHxCwd0avx2lIVi3CQ50',
  // Choose the appropriate region for your users
  region: 'ap' as const, // 'us', 'eu', 'ap' for Asia Pacific
  // Additional configuration options
  options: {
    // Enable extended result for more detailed device information
    extendedResult: true,
    // Set timeout for fingerprint requests
    timeout: 10000,
  },
};

// Types for device fingerprint data
export interface DeviceFingerprint {
  visitorId: string;
  confidence: number;
  requestId: string;
  timestamp: number;
  // Additional device information
  deviceInfo?: {
    os: string;
    osVersion: string;
    device: string;
    browser?: string;
    browserVersion?: string;
  };
}

// Error types
export interface FingerprintError {
  message: string;
  code?: string;
}
