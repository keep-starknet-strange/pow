// App Integrity configuration for Google Play Integrity (Android) and App Attest (iOS)
export const APP_INTEGRITY_CONFIG = {
  android: {
    cloudProjectNumber: process.env.EXPO_PUBLIC_ANDROID_CLOUD_PROJECT_NUMBER || "466811", // exploration-apps-466811
    deviceRecall: {
      enabled: true, // Beta feature - must join beta program
      rewardClaimedBit: "bitFirst", // Use first bit to track reward claim
    },
  },
  ios: {
    appAttest: { enabled: true },
    deviceCheck: { enabled: true }, // For persistent device tracking
  },
  devMode: process.env.EXPO_PUBLIC_APP_INTEGRITY_DEV_MODE === "true",
  storage: {
    userIdKey: "app_integrity_user_id",
    keyIdKey: "app_integrity_key_id", // iOS only
  },
};

// Types for app integrity
export interface AppIntegrityError {
  message: string;
  code?: string;
}

// Android Device Recall bit values (read from integrity verdict)
export interface DeviceRecallBits {
  bitFirst?: boolean;
  bitSecond?: boolean;
  bitThird?: boolean;
}





