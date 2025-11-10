import "ts-node/register";
import { ExpoConfig } from "expo/config";
import { WalletPresets } from "./constants/WalletPresets";

const config: ExpoConfig = {
  name: "POW!",
  slug: "pow",
  version: process.env.EXPO_APP_VERSION || "0.1.0",
  orientation: "portrait",
  icon: "./assets/logo/logo.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    infoPlist: {
      LSApplicationQueriesSchemes: [
        "argent",
        "argentx",
        "argentmobile",
        "ready",
        "ready-wallet",
        "braavos",
        "braavos-btc-straknet-wallet",
        "wc",
      ],
    },
    config: {
      usesNonExemptEncryption: false,
    },
    bundleIdentifier: "com.starknet.pow",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/logo/logo-foreground.png",
      backgroundImage: "./assets/logo/logo-background.png",
    },
    package: "com.starknet.pow",
    edgeToEdgeEnabled: true,
    blockedPermissions: ["android.permission.RECORD_AUDIO"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/logo/logo-foreground.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/logo/logo-empty.png",
        imageWidth: 1024,
        resizeMode: "contain",
        backgroundColor: "#74c874",
      },
    ],
    "expo-secure-store",
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "pow",
        organization: "starkware-industries",
        experimental_android: {
          uploadNativeSymbols: true,
          includeNativeSources: true,
        },
      },
    ],
    "expo-web-browser",
    [
      "react-native-audio-api",
      {
        iosBackgroundMode: false,
        iosMicrophonePermission: "We will never request microphone permission.",
        androidPermissions: [],
        androidForegroundService: false,
      },
    ],
    "expo-asset",
    "./plugins/sentry.ts",
    [
      "./plugins/android-queries.ts",
      {
        packageNames: Object.values(WalletPresets).map((p) => p.androidPackage),
      },
    ],
    "@fingerprintjs/fingerprintjs-pro-react-native"
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
