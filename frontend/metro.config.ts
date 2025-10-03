const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");
const {
  wrapWithAudioAPIMetroConfig,
} = require("react-native-audio-api/metro-config");

let config = getSentryExpoConfig(__dirname, {
  annotateReactComponents: true,
});
config.resolver.unstable_conditionNames = [
  "browser",
  "require",
  "react-native",
];
config.resolver.extraNodeModules = {
  crypto: require.resolve("expo-crypto"),
  stream: require.resolve("readable-stream"),
};

config = withNativeWind(config, { input: "./app/global.css" });
config = wrapWithAudioAPIMetroConfig(config);
config = module.exports = wrapWithReanimatedMetroConfig(config);
