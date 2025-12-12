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
  // Suspect score threshold for blocking suspicious users (0.0-1.0)
  suspectScoreThreshold: parseFloat(
    process.env.EXPO_PUBLIC_FINGERPRINT_SUSPECT_SCORE_THRESHOLD || "0.5",
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

// Suspect score validation response from backend
export interface SuspectScoreResponse {
  suspectScore: number; // 0.0-1.0, higher is more suspicious
  isValid: boolean;
  visitorId?: string;
  requestId?: string;
  error?: string;
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
