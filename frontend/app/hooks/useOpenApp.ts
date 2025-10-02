// useOpenApp.ts
import { Linking, Platform } from "react-native";
import { AppTarget } from "@/constants/WalletPresets";

async function tryOpenUrls(urls: string[]) {
  for (const url of urls) {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        return true;
      } else {
        console.warn("Cannot open url", url);
      }
    } catch (error) {
      console.error(error);
      // keep trying fallbacks
    }
  }
  return false;
}

async function openStore(iosId?: string, androidPkg?: string) {
  if (Platform.OS === "ios" && iosId) {
    return Linking.openURL(`itms-apps://itunes.apple.com/app/id${iosId}`);
  }
  if (Platform.OS === "android" && androidPkg) {
    return Linking.openURL(`market://details?id=${androidPkg}`);
  }
  return false;
}

/** Hook */
export function useOpenApp() {
  const openApp = async (target: AppTarget) => {
    const {
      iosSchemes,
      androidSchemes,
      universalLinks,
      iosAppStoreId,
      androidPackage,
    } = target;

    // 1) Try app schemes/intent first
    const openedApp = await tryOpenUrls(
      Platform.OS == "ios" ? iosSchemes : androidSchemes,
    );

    if (openedApp) return true;

    // 2) If not installed, try opening the app store first
    try {
      const storeRes = await openStore(iosAppStoreId, androidPackage);
      if (storeRes !== false) return true;
    } catch {
      // If store open fails, continue to universal links
    }

    // 3) As a final fallback, try universal links (web)
    if (universalLinks.length > 0) {
      const openedWeb = await tryOpenUrls(universalLinks);
      if (openedWeb) return true;
    }

    return false;
  };

  return { openApp };
}
