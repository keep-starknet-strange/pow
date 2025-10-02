import configPlugins from "@expo/config-plugins";
import {
  AndroidManifest,
  ConfigPlugin,
  ExportedConfigWithProps,
} from "expo/config-plugins";
const { withAndroidManifest } = configPlugins;

// Exported type from expo config;
type PackageQuery = {
  $: {
    "android:name": string;
  };
};

/**
 * Adds the packageNames as queries for deep links to wallets to work
 * https://developer.android.com/training/package-visibility/declaring#package-name
 *
 * @param config
 * @param packageNames
 */
function setQueries(
  config: ExportedConfigWithProps<AndroidManifest>,
  packageNames: string[],
): ExportedConfigWithProps<AndroidManifest> {
  const packageQueries: PackageQuery[] = [];

  for (const packageName of packageNames) {
    packageQueries.push({
      $: {
        "android:name": packageName,
      },
    });
  }

  config.modResults.manifest.queries.push({
    package: packageQueries,
  });

  return config;
}

type QueriesProps = {
  packageNames: string[];
};

const withAndroidQueries: ConfigPlugin<QueriesProps> = (config, options) => {
  return withAndroidManifest(config, async (config) => {
    return setQueries(config, options.packageNames);
  });
};

export default withAndroidQueries;
