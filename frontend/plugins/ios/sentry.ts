import configPlugins from "@expo/config-plugins";
import { ConfigPlugin } from "expo/config-plugins";
import fs from "fs";

const SENTRY_AUTH_TOKEN = "SENTRY_AUTH_TOKEN";

const { withXcodeProject } = configPlugins;

// This plugin is used to add the Sentry auth token to the sentry.properties file.
const withSigning: ConfigPlugin = (config) => {
  return withXcodeProject(config, (config) => {
    const sentryAuthToken = process.env[SENTRY_AUTH_TOKEN];

    fs.appendFileSync("ios/sentry.properties", `\nauth.token=${sentryAuthToken}`);
    return config;
  });
};

export default withSigning;