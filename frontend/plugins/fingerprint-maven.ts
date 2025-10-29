import configPlugins from "@expo/config-plugins";
import { ConfigPlugin } from "expo/config-plugins";

const { withProjectBuildGradle } = configPlugins;

/**
 * Adds the FingerprintJS Maven repository to Android build.gradle
 * This is required for @fingerprintjs/fingerprintjs-pro-react-native to resolve dependencies
 */
const withFingerprintMaven: ConfigPlugin = (config) => {
  return withProjectBuildGradle(config, (config) => {
    const mavenRepo = "maven { url 'https://maven.fpregistry.io/releases' }";

    // Check if the repository is already added
    if (config.modResults.contents.includes("maven.fpregistry.io")) {
      return config;
    }

    // Find the allprojects { repositories { } } block and add the maven repository
    const allProjectsRegex = /(allprojects\s*\{[\s\S]*?repositories\s*\{)/;

    if (allProjectsRegex.test(config.modResults.contents)) {
      config.modResults.contents = config.modResults.contents.replace(
        allProjectsRegex,
        `$1\n    ${mavenRepo}`,
      );
    }

    return config;
  });
};

export default withFingerprintMaven;
