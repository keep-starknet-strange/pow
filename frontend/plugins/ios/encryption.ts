import configPlugins from "@expo/config-plugins";
import { ConfigPlugin } from "expo/config-plugins";

const { withInfoPlist } = configPlugins;

// This plugin is used to declare that the app does not use proprietary encryption.
const withEncryptionDeclaration: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults["ITSAppUsesNonExemptEncryption"] = false;
    return config;
  });
};

export default withEncryptionDeclaration;