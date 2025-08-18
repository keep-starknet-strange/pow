import configPlugins from "@expo/config-plugins";
import { ConfigPlugin } from "expo/config-plugins";
import fs from "fs";

const SENTRY_AUTH_TOKEN = "SENTRY_AUTH_TOKEN";

const { withXcodeProject, withAndroidManifest } = configPlugins;

const withSentryAndroidPlugin: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const sentryAuthToken = process.env[SENTRY_AUTH_TOKEN];

    fs.appendFileSync(
      "android/sentry.properties",
      `\nauth.token=${sentryAuthToken}`,
    );
    return config;
  });
};

const withSentryIOSPlugin: ConfigPlugin = (config) => {
  return withXcodeProject(config, (config) => {
    const sentryAuthToken = process.env[SENTRY_AUTH_TOKEN];

    fs.appendFileSync(
      "ios/sentry.properties",
      `\nauth.token=${sentryAuthToken}`,
    );
    return config;
  });
};

const withSentry: ConfigPlugin = (config) => {
  config = withSentryAndroidPlugin(config);
  return withSentryIOSPlugin(config);
};

export default withSentry;
