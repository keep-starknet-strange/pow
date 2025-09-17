const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

let config = getSentryExpoConfig(__dirname);
config.resolver.unstable_conditionNames = [
  "browser",
  "require",
  "react-native",
];
config.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-crypto"),
  stream: require.resolve("readable-stream"),
};

config = withNativeWind(config, { input: "./app/global.css" });
module.exports = wrapWithReanimatedMetroConfig(config);
