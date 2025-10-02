// useOpenApp.ts
import { Linking, Platform } from "react-native";

export type AppTarget = {
  iosSchemes?: string[]; // e.g., ['braavos://']
  androidSchemes?: string[]; // e.g., ['braavos://']
  universalLinks?: string[]; // e.g., ['https://braavos.app/']
  iosAppStoreId?: string; // numbers only, e.g., '1636013523'
  androidPackage?: string; // e.g., 'app.braavos.wallet'
  androidPlayUrl?: string; // optional explicit Play link
};

async function tryOpen(urls: string[]) {
  for (const url of urls) {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // keep trying fallbacks
    }
  }
  return false;
}

async function openStore(
  iosId?: string,
  androidPkg?: string,
  androidPlayUrl?: string,
) {
  if (Platform.OS === "ios" && iosId) {
    return Linking.openURL(`itms-apps://itunes.apple.com/app/id${iosId}`);
  }
  if (Platform.OS === "android") {
    if (androidPlayUrl) return Linking.openURL(androidPlayUrl);
    if (androidPkg) return Linking.openURL(`market://details?id=${androidPkg}`);
  }
  return false;
}

function buildIntentUrl(
  primaryScheme: string | undefined,
  androidPackage?: string,
) {
  if (!androidPackage) return undefined;
  const scheme = (primaryScheme || "app").replace("://", "");
  return `intent://open#Intent;scheme=${scheme};package=${androidPackage};end`;
}

/** Hook */
export function useOpenApp() {
  const openApp = async (target: AppTarget) => {
    const {
      iosSchemes = [],
      androidSchemes = [],
      universalLinks = [],
      iosAppStoreId,
      androidPackage,
      androidPlayUrl,
    } = target;

    // 1) Try app schemes/intent first
    const schemeCandidates: string[] = [];
    if (Platform.OS === "ios") {
      schemeCandidates.push(...iosSchemes);
    } else {
      schemeCandidates.push(...androidSchemes);
      const intentUrl = buildIntentUrl(androidSchemes[0], androidPackage);
      if (intentUrl) schemeCandidates.push(intentUrl);
    }

    const openedApp = await tryOpen(schemeCandidates);
    if (openedApp) return true;

    // 2) If not installed, try opening the app store first
    try {
      const storeRes = await openStore(
        iosAppStoreId,
        androidPackage,
        androidPlayUrl,
      );
      if (storeRes !== false) return true;
    } catch {
      // If store open fails, continue to universal links
    }

    // 3) As a final fallback, try universal links (web)
    if (universalLinks.length > 0) {
      const openedWeb = await tryOpen(universalLinks);
      if (openedWeb) return true;
    }

    return false;
  };

  return { openApp };
}

export const WalletPresets = {
  braavos: {
    iosSchemes: ["braavos://"],
    androidSchemes: ["braavos://"],
    universalLinks: ["https://braavos.app/"],
    iosAppStoreId: "1636013523",
    androidPackage: "app.braavos.wallet",
    androidPlayUrl:
      "https://play.google.com/store/apps/details?id=app.braavos.wallet",
  } satisfies AppTarget,

  ready: {
    iosSchemes: ["ready://", "argent://"],
    androidSchemes: ["ready://", "argent://"],
    universalLinks: ["https://www.ready.co/", "https://ready.co/"],
    iosAppStoreId: "1358741926",
    androidPackage: "im.argent.contractwalletclient",
  } satisfies AppTarget,

  readyWallet: {
    iosSchemes: ["ready-wallet://"],
    androidSchemes: ["readywallet://"],
    universalLinks: ["https://www.ready.co/download-ready-wallet"],
    iosAppStoreId: "6744935604",
    androidPackage: "com.ready.wallet",
    androidPlayUrl:
      "https://play.google.com/store/apps/details?id=com.ready.wallet",
  } satisfies AppTarget,
};
