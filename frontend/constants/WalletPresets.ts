export type AppTarget = {
  iosSchemes: string[]; // e.g., ['braavos://']
  androidSchemes: string[]; // e.g., ['braavos://']
  universalLinks: string[]; // e.g., ['https://braavos.app/']
  iosAppStoreId: string; // numbers only, e.g., '1636013523'
  androidPackage: string; // e.g., 'app.braavos.wallet'
};

export const WalletPresets = {
  braavos: {
    iosSchemes: ["braavos://"],
    androidSchemes: ["braavos://"],
    universalLinks: ["https://braavos.app/"],
    iosAppStoreId: "1636013523",
    androidPackage: "app.braavos.wallet",
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
    androidSchemes: ["ready-wallet://"],
    universalLinks: ["https://www.ready.co/download-ready-wallet"],
    iosAppStoreId: "6744935604",
    androidPackage: "com.ready.wallet",
  } satisfies AppTarget,
};
