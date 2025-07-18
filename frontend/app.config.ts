import 'ts-node/register';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
    name: "POW",
    slug: "pow",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        "LSApplicationQueriesSchemes": [
          "argent",
          "argentx",
          "argentmobile",
          "braavos",
          "argent",
          "argentx",
          "argentmobile",
          "braavos"
        ]
      },
      bundleIdentifier: "com.starknet.pow"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.starknet.pow"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-web-browser",
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-secure-store",
      [
        "@sentry/react-native/expo",
        {
          "url": "https://sentry.io/",
          "project": "pow",
          "organization": "starkware-industries"
        }
      ],
      "./plugins/android/signing.ts"
    ],
    experiments: {
      typedRoutes: true
    }
};

export default config;
