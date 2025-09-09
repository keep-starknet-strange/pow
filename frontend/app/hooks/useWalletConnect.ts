import "react-native-get-random-values";
import "@walletconnect/react-native-compat";
import { useState, useEffect } from "react";
import UniversalProvider from "@walletconnect/universal-provider";
import type { SessionTypes } from "@walletconnect/types";
import { Linking } from "react-native";

const WALLET_DEEPLINKS = {
  // Ready (Argent mobile) primary scheme
  ready: (uri: string) => `ready://wc?uri=${encodeURIComponent(uri)}`,
  // Argent variants
  argent: (uri: string) => `argent://wc?uri=${encodeURIComponent(uri)}`,
  argentx: (uri: string) => `argentx://wc?uri=${encodeURIComponent(uri)}`,
  argentmobile: (uri: string) =>
    `argentmobile://wc?uri=${encodeURIComponent(uri)}`,
  // Braavos
  braavos: (uri: string) => `braavos://wc?uri=${encodeURIComponent(uri)}`,
} as const;

const WC_PROJECT_ID =
  (process.env.EXPO_PUBLIC_WC_PROJECT_ID as string | undefined) || "";

// Module-level singleton to avoid multiple initializations
let sharedProvider: any | null = null;
let initPromise: Promise<any> | null = null;
let listenersBound = false;
let coreListenersBound = false;

const STARKNET_MIN_METHODS = [
  // Ready requires these for session + tx requests
  "starknet_account",
  "starknet_requestAddInvokeTransaction",
  "starknet_chainId",
];

const otherStarknetChain = (chain: string): string =>
  chain === "starknet:SNMAIN" ? "starknet:SNSEPOLIA" : "starknet:SNMAIN";

export function useWalletConnect() {
  const [provider, setProvider] = useState<any>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const initializeProvider = async () => {
    const projectId = WC_PROJECT_ID;
    if (!projectId) {
      throw new Error("Missing WalletConnect Project ID");
    }

    const metadata = {
      name: "Wallet connect Test",
      description: "Test app for connecting to Ready",
      url: "https://walletconnect.com/",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };

    // Singleton guard: reuse or await in-flight init
    if (sharedProvider) {
      return sharedProvider;
    }
    if (initPromise) {
      return await initPromise;
    }

    initPromise = (async () => {
      const initOpts: any = {
        projectId,
        metadata,
      };
      // Let SDK choose default relay; uncomment to force a relay
      // initOpts.relayUrl = 'wss://relay.walletconnect.com';

      const initTask = UniversalProvider.init(initOpts);
      const instance: any = await Promise.race([
        initTask,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("WalletConnect init timeout (20s)")),
            20000,
          ),
        ),
      ]);
      sharedProvider = instance;
      listenersBound = true;
      return sharedProvider;
    })();

    try {
      const inst = await initPromise;
      return inst;
    } finally {
      initPromise = null;
    }
  };

  useEffect(() => {
    initializeProvider()
      .then((prov) => {
        setProvider(prov);

        // Check if we already have an active session
        const activeSessions = Object.values(prov.session || {});
        if (activeSessions.length > 0) {
          setSession(activeSessions[0] as SessionTypes.Struct);

          // Extract account if available, with type safety
          const session = activeSessions[0] as
            | { namespaces?: Record<string, any> }
            | undefined;
          const starknetAccounts = session?.namespaces?.starknet?.accounts;
          if (Array.isArray(starknetAccounts) && starknetAccounts.length > 0) {
            const accountAddress = starknetAccounts[0]?.split?.(":")[2];
            if (accountAddress) {
              setAccount(accountAddress);
            }
          }
        }

        // Bind core session listeners once
        if (!coreListenersBound && prov?.client) {
          try {
            const client: any = prov.client;

            client.on?.("session_delete", () => {
              setSession(null);
              setAccount(null);
            });

            client.on?.("session_update", (update: any) => {
              try {
                const updatedSession = (client.session?.get?.(update?.topic) ||
                  null) as SessionTypes.Struct | null;
                if (updatedSession) {
                  setSession(updatedSession);
                  const updatedAccounts =
                    updatedSession?.namespaces?.starknet?.accounts;
                  if (Array.isArray(updatedAccounts) && updatedAccounts[0]) {
                    const updatedAccount = updatedAccounts[0].split(":")[2];
                    if (updatedAccount) setAccount(updatedAccount);
                  }
                }
              } catch (e) {
                // ignore listener errors
              }
            });

            client.on?.("session_event", (event: any) => {
              try {
                if (event?.event?.name === "accountsChanged") {
                  const accounts = event?.event?.data as string[] | undefined;
                  const first = Array.isArray(accounts)
                    ? accounts[0]
                    : undefined;
                  const addr = first?.split?.(":")?.[2];
                  if (addr) setAccount(addr);
                }
                if (event?.event?.name === "chainChanged") {
                  // No-op: keep for future chain-aware UI if needed
                }
              } catch (e) {
                // ignore listener errors
              }
            });

            coreListenersBound = true;
          } catch (e) {
            // ignore binding errors
          }
        }
      })
      .catch((err) => {
        setError("Setup failed: " + (err?.message || "Unknown error"));
      });
  }, []);

  const openWallet = async (uri: string) => {
    const encodedUri = encodeURIComponent(uri);

    // Use Argent's deep link scheme
    const argentScheme = `ready://wc?uri=${encodedUri}`;

    try {
      await Linking.openURL(argentScheme);
    } catch (err) {
      // Fallback to WalletConnect universal link (works in Expo Go)
      const universal = `https://walletconnect.com/wc?uri=${encodedUri}`;
      try {
        await Linking.openURL(universal);
      } catch (e) {
        setError("Failed to open Ready. Please make sure it is installed.");
      }
    }
  };

  const openUriForWallet = async (
    wallet: "argent" | "braavos",
    uri: string,
  ) => {
    const encodedUri = encodeURIComponent(uri);
    const candidates =
      wallet === "argent"
        ? [
            `ready://wc?uri=${encodedUri}`,
            `argent://wc?uri=${encodedUri}`,
            `argentx://wc?uri=${encodedUri}`,
            `argentmobile://wc?uri=${encodedUri}`,
            // Universal link fallbacks specific to Ready/Argent
            `https://app.ready.co/wc?uri=${encodedUri}`,
            `https://ready.co/wc?uri=${encodedUri}`,
          ]
        : [
            `braavos://wc?uri=${encodedUri}`,
            // Braavos universal link fallback
            `https://link.braavos.app/wc?uri=${encodedUri}`,
            `https://braavos.app/wc?uri=${encodedUri}`,
          ];

    let opened = false;
    for (const url of candidates) {
      const can = await Linking.canOpenURL(url).catch(() => false);
      if (can) {
        await Linking.openURL(url);
        opened = true;
        break;
      }
    }
    if (!opened) {
      // Fallback to universal link (works better in Expo Go)
      const universal = `https://walletconnect.com/wc?uri=${encodedUri}`;
      const canUniversal = await Linking.canOpenURL(universal).catch(
        () => false,
      );
      if (canUniversal) {
        await Linking.openURL(universal);
        opened = true;
      }
    }
    return opened;
  };

  const connectWallet = async (wallet: "argent" | "braavos") => {
    if (!provider) return;

    try {
      // Build chain candidates (env-driven primary + variants)
      const envChain = (
        process.env.EXPO_PUBLIC_STARKNET_CHAIN || "SN_MAINNET"
      ).toUpperCase();
      const wantMainnet = envChain.includes("MAIN");
      const chainPrimary = wantMainnet
        ? "starknet:SNMAIN"
        : "starknet:SNSEPOLIA";
      const chainVariant = wantMainnet
        ? "starknet:SN_MAIN"
        : "starknet:SN_SEPOLIA";
      const otherPrimary = wantMainnet
        ? "starknet:SNSEPOLIA"
        : "starknet:SNMAIN";
      const otherVariant = wantMainnet
        ? "starknet:SN_SEPOLIA"
        : "starknet:SN_MAIN";
      const chainCandidates = [
        chainPrimary,
        chainVariant,
        otherPrimary,
        otherVariant,
      ];

      const optionalChains = [
        "starknet:SNMAIN",
        "starknet:SNSEPOLIA",
        "starknet:SN_MAIN",
        "starknet:SN_SEPOLIA",
      ];

      const waitWithTimeout = async <T>(p: Promise<T>, ms: number) => {
        return Promise.race<T | null>([
          p,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
        ]);
      };

      let connected = false;
      for (const chain of chainCandidates) {
        const { uri, approval } = await provider.client.connect({
          requiredNamespaces: {
            starknet: {
              chains: [chain],
              methods: [
                "starknet_account",
                "starknet_requestAddInvokeTransaction",
              ],
              events: ["accountsChanged", "chainChanged"],
            },
          },
          optionalNamespaces: {
            starknet: {
              chains: optionalChains,
              methods: [
                "starknet_account",
                "starknet_requestAddInvokeTransaction",
              ],
              events: ["accountsChanged", "chainChanged"],
            },
          },
        });

        if (uri) await openUriForWallet(wallet, uri);

        const newSession = (await waitWithTimeout(
          approval(),
          15000,
        )) as SessionTypes.Struct | null;
        if (newSession) {
          setSession(newSession);
          if (newSession?.namespaces?.starknet?.accounts?.length > 0) {
            setAccount(
              newSession.namespaces.starknet.accounts[0].split(":")[2],
            );
          }
          connected = true;
          break;
        }
      }
      if (!connected) throw new Error("Wallet did not approve session");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    }
  };

  const connect = async () => connectWallet("argent");
  const connectArgent = async () => connectWallet("argent");
  const connectBraavos = async () => connectWallet("braavos");

  const disconnect = async () => {
    if (!provider || !session) return;

    try {
      if (typeof provider.disconnect === "function") {
        await provider.disconnect();
      } else if (provider?.client && session?.topic) {
        await provider.client.disconnect({
          topic: session.topic,
          reason: { code: 6000, message: "User disconnected" },
        });
      }
      setSession(null);
      setAccount(null);
      setTxHash(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return {
    provider,
    session,
    account,
    error,
    openWallet,
    connect,
    connectArgent,
    connectBraavos,
    disconnect,
    txHash,
  };
}
