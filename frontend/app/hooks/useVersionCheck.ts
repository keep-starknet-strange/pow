import { useMemo } from "react";
import * as Application from "expo-application";

/**
 * Compare two semantic versions (major.minor.patch)
 * Returns:
 *  -1 if version1 < version2
 *   0 if version1 === version2
 *   1 if version1 > version2
 */
const compareVersions = (version1: string, version2: string): number => {
  const v1Parts = version1.split(".").map((n) => parseInt(n, 10) || 0);
  const v2Parts = version2.split(".").map((n) => parseInt(n, 10) || 0);

  // Ensure both arrays have 3 parts (major, minor, patch)
  while (v1Parts.length < 3) v1Parts.push(0);
  while (v2Parts.length < 3) v2Parts.push(0);

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] < v2Parts[i]) return -1;
    if (v1Parts[i] > v2Parts[i]) return 1;
  }

  return 0;
};

export interface VersionCheckResult {
  needsUpdate: boolean;
  currentVersion: string;
  minVersion: string | null;
}

/**
 * Hook to check if the current app version meets the minimum required version
 * @param minVersion The minimum required version from remote config
 * @returns Object with needsUpdate flag and version info
 */
export const useVersionCheck = (
  minVersion: string | null,
): VersionCheckResult => {
  return useMemo(() => {
    // Get current app version from expo-application
    const currentVersion =
      Application.nativeApplicationVersion ||
      process.env.EXPO_APP_VERSION ||
      "1.0.0";

    // If no minimum version is set, no update is needed
    if (!minVersion) {
      return {
        needsUpdate: false,
        currentVersion,
        minVersion: null,
      };
    }

    // Compare versions
    const comparison = compareVersions(currentVersion, minVersion);

    return {
      needsUpdate: comparison < 0, // Current version is less than minimum
      currentVersion,
      minVersion,
    };
  }, [minVersion]);
};
