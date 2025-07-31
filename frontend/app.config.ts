import "ts-node/register";
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "POW!",
  slug: "pow",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/logo/pow.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    infoPlist: {
      LSApplicationQueriesSchemes: [
        "argent",
        "argentx",
        "argentmobile",
        "braavos",
      ],
    },
    bundleIdentifier: "com.starknet.pow",
    buildNumber: "1",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/logo/pow.png",
      backgroundColor: "#ffffff",
    },
    package: "com.starknet.pow",
    edgeToEdgeEnabled: true,
    versionCode: 1,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/logo/pow.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/logo/pow.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-secure-store",
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "pow",
        organization: "starkware-industries",
      },
    ],
    "expo-web-browser",
    "expo-audio",
    "./plugins/android/signing.ts",
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
