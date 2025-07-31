import configPlugins from "@expo/config-plugins";
import { Properties } from "@expo/config-plugins/build/android";
import { ConfigPlugin } from "expo/config-plugins";

const FILE_NAME = "KEYSTORE_FILE_NAME";
const PASSWORD = "KEYSTORE_PASSWORD";
const KEY_ALIAS = "KEYSTORE_KEY_ALIAS";
const KEY_PASSWORD = "KEYSTORE_KEY_PASSWORD";

// Workaround, since this issue is still open
// https://github.com/expo/expo/issues/36591#issuecomment-2849092926
const { withAppBuildGradle, withGradleProperties } = configPlugins;

const withSigning: ConfigPlugin = (config) => {
  config = withSigningConfig(config);

  return withKeystoreProperties(config);
};

//////////// Signing config
const withSigningConfig: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (!config) throw new Error("No config set");

    if (config.modResults.language === "kt") {
      throw new Error(
        "Current plugin can only modify groovy build.gradle files",
      );
    }

    console.log(
      "📝 Modifying android/app/build.gradle to include release config",
    );
    const gradle = config.modResults.contents;
    const withSigningConfigs = attachReleaseSigningConfig(gradle);
    config.modResults.contents =
      setupReleaseSigningConfigInBuildTypes(withSigningConfigs);

    return config;
  });
};

function attachReleaseSigningConfig(content: string): string {
  const signingRegex = new RegExp("signingConfigs {(\\n|.)*?}");

  const replacement = `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('${FILE_NAME}')) {
                storeFile file(${FILE_NAME})
                storePassword ${PASSWORD}
                keyAlias ${KEY_ALIAS}
                keyPassword ${KEY_PASSWORD}
            }
        }`;

  content = content.replace(signingRegex, replacement);

  return content;
}

function setupReleaseSigningConfigInBuildTypes(content: string): string {
  const signingConfig = new RegExp(
    "(buildTypes {(\\n|.)*?release {(\\n|.)*?signingConfigs.)(debug)",
  );

  content = content.replace(signingConfig, "$1release");

  return content;
}

//////////// Keystore setup
const withKeystoreProperties: ConfigPlugin = (config) => {
  return withGradleProperties(config, (config) => {
    if (!config) throw new Error("No config set");

    const fileName = process.env[FILE_NAME];
    const password = process.env[PASSWORD];
    const keyAlias = process.env[KEY_ALIAS];
    const keyPassword = process.env[KEY_PASSWORD];

    if (
      fileName == null ||
      password == null ||
      keyAlias == null ||
      keyPassword == null
    ) {
      console.warn(
        "⚠️  Could not find appropriate env variables to set the keystore details. Ignoring...",
      );
      return config;
    }

    config.modResults?.push({
      type: "property",
      key: FILE_NAME,
      value: fileName,
    });
    config.modResults?.push({
      type: "property",
      key: PASSWORD,
      value: password,
    });
    config.modResults?.push({
      type: "property",
      key: KEY_ALIAS,
      value: keyAlias,
    });
    config.modResults?.push({
      type: "property",
      key: KEY_PASSWORD,
      value: keyPassword,
    });

    return config;
  });
};

export default withSigning;
