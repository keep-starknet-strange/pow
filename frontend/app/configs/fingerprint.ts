// Fingerprint Pro configuration
export const FINGERPRINT_CONFIG = {
  // Use environment variable for API key
  apiKey: process.env.EXPO_PUBLIC_FINGERPRINT_KEY || 'YHxCwd0avx2lIVi3CQ50',
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

// Validation result types
export interface FingerprintValidationResult {
  is_unique: boolean;
  is_valid: boolean;
  message?: string;
  timestamp?: number;
}

// Utility function to convert visitor ID string to felt252 hex format
export function visitorIdToFelt252(visitorId: string): string {
  // Convert string to bytes and encode as hex
  const bytes = new TextEncoder().encode(visitorId);
  const hex = Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  
  // Prepend with 0x and ensure it fits within felt252 range
  return `0x${hex}`;
}
