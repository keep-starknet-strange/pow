// Fingerprint Pro configuration
export const FINGERPRINT_CONFIG = {
  // Use environment variable for API key
  apiKey: process.env.EXPO_PUBLIC_FINGERPRINT_KEY || "",
  // Choose the appropriate region for your users
  region: (process.env.EXPO_PUBLIC_FINGERPRINT_REGION || "ap") as
    | "us"
    | "eu"
    | "ap",
  // Confidence score threshold for device verification
  confidenceThreshold: parseFloat(
    process.env.EXPO_PUBLIC_FINGERPRINT_CONFIDENCE_THRESHOLD || "0.7",
  ),
  // Suspect score threshold for blocking suspicious devices
  suspectScoreThreshold: parseInt(
    process.env.EXPO_PUBLIC_FINGERPRINT_SUSPECT_SCORE_THRESHOLD || "5",
  ),
  // Additional configuration options
  options: {
    // Enable extended result for more detailed device information
    extendedResult:
      process.env.EXPO_PUBLIC_FINGERPRINT_EXTENDED_RESULT === "true",
    // Set timeout for fingerprint requests
    timeout: parseInt(process.env.EXPO_PUBLIC_FINGERPRINT_TIMEOUT || "10000"),
    // Enable/disable debugging
    debug: process.env.EXPO_PUBLIC_FINGERPRINT_DEBUG === "true",
    // Retry configuration for failed fingerprint requests
    maxRetries: parseInt(
      process.env.EXPO_PUBLIC_FINGERPRINT_MAX_RETRIES || "3",
    ),
    retryDelay: parseInt(
      process.env.EXPO_PUBLIC_FINGERPRINT_RETRY_DELAY || "1000",
    ),
    // Cache configuration
    cacheEnabled: process.env.EXPO_PUBLIC_FINGERPRINT_CACHE_ENABLED !== "false",
    cacheExpiration: parseInt(
      process.env.EXPO_PUBLIC_FINGERPRINT_CACHE_EXPIRATION || "300000",
    ), // 5 minutes
    // Rate limiting
    rateLimitEnabled:
      process.env.EXPO_PUBLIC_FINGERPRINT_RATE_LIMIT_ENABLED !== "false",
    rateLimitWindow: parseInt(
      process.env.EXPO_PUBLIC_FINGERPRINT_RATE_LIMIT_WINDOW || "60000",
    ), // 1 minute
    rateLimitMaxRequests: parseInt(
      process.env.EXPO_PUBLIC_FINGERPRINT_RATE_LIMIT_MAX_REQUESTS || "10",
    ),
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

// Validation result types *for BE implementation
export interface FingerprintValidationResult {
  is_unique: boolean;
  is_valid: boolean;
  message?: string;
  timestamp?: number;
}

// Suspect Score types
export interface SuspectScore {
  data: {
    result: number;
  };
}

// Smart Signals types - all signals follow the pattern: { data: { result: boolean } }
export interface BooleanSmartSignal {
  data: {
    result: boolean;
  };
}

// High Activity signal has additional fields
export interface HighActivitySignal {
  data: {
    result: boolean;
    dailyRequests?: number;
  };
}

// Factory Reset signal has timestamp fields
export interface FactoryResetSignal {
  data: {
    time: string; // ISO 8601 format
    timestamp: number; // Unix epoch time
  };
}

// Union type for all signal types
export type SmartSignal =
  | BooleanSmartSignal
  | HighActivitySignal
  | FactoryResetSignal;

// Smart Signals collection
export interface SmartSignals {
  emulator?: BooleanSmartSignal;
  jailbroken?: BooleanSmartSignal;
  rootApps?: BooleanSmartSignal;
  frida?: BooleanSmartSignal;
  clonedApp?: BooleanSmartSignal;
  highActivity?: HighActivitySignal;
  factoryReset?: FactoryResetSignal;
  [key: string]: SmartSignal | undefined;
}

// Utility function to convert visitor ID string to felt252 hex format
export function visitorIdToFelt252(visitorId: string): string {
  // Convert string to bytes and encode as hex
  const bytes = new TextEncoder().encode(visitorId);
  const hex = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  // Prepend with 0x and ensure it fits within felt252 range
  return `0x${hex}`;
}
