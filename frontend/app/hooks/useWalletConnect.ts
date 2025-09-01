import "react-native-get-random-values";
import { useState, useEffect, useCallback } from "react";
import { UniversalProvider } from "@walletconnect/universal-provider";
import type { SessionTypes } from "@walletconnect/types";
import { Linking } from "react-native";
import { useStarknetConnector } from "../context/StarknetConnector";

const WALLET_DEEPLINKS = {
  braavos: (uri: string) => `braavos://wc?uri=${encodeURIComponent(uri)}`,
  argent: (uri: string) => `argent://wc?uri=${encodeURIComponent(uri)}`,
} as const;

const WC_PROJECT_ID = "ad27f7ecf50cf0802b7cd433724dff24";

// Module-level singleton to avoid multiple initializations
let sharedProvider: any | null = null;
let initializing = false;

const STARKNET_MIN_METHODS = [
  "starknet_requestAccounts",
  "starknet_getAccounts",
  "starknet_chainId",
];

// convert network name to Caip2 chain chain ID for WalletConnect
const toCaip2Chain = (network: string): string => {
  switch (network) {
    case "SN_MAINNET":
    case "SN_MAIN":
      return "starknet:SN_MAIN";
    case "SN_SEPOLIA":
      return "starknet:SN_SEPOLIA";
    // Devnet is not supported over WalletConnect; default to Sepolia for testing
    case "SN_DEVNET":
    default:
      return "starknet:SN_SEPOLIA";
  }
};

const otherStarknetChain = (chain: string): string =>
  chain === "starknet:SN_MAIN" ? "starknet:SN_SEPOLIA" : "starknet:SN_MAIN";

export function useWalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWallet, setActiveWallet] = useState<"argent" | "braavos" | null>(
    null,
  );
  const { network } = useStarknetConnector();

  const initializeProvider = async () => {
    try {
      if (sharedProvider) {
        setProvider(sharedProvider);
        // adopt existing session if present
        const existingSessions =
          sharedProvider?.client?.session?.getAll?.() || [];
        if (existingSessions.length > 0) {
          const active = existingSessions[0];
          setSession(active as any);
          const starknetAccounts = (active as any)?.namespaces?.starknet
            ?.accounts;
          if (starknetAccounts?.length > 0) {
            setAccount(starknetAccounts[0].split(":")[2]);
          }
        }
        return;
      }
      if (initializing) return;
      initializing = true;

      const projectId = WC_PROJECT_ID;
      const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || "POW";
      const APP_DESCRIPTION =
        process.env.EXPO_PUBLIC_APP_DESCRIPTION ||
        "Connect your Starknet wallet to POW";
      const APP_URL =
        process.env.EXPO_PUBLIC_APP_URL || "https://example.com";
      const APP_ICON =
        process.env.EXPO_PUBLIC_APP_ICON ||
        "https://avatars.githubusercontent.com/u/118723009";
      const APP_REDIRECT_NATIVE =
        process.env.EXPO_PUBLIC_APP_REDIRECT_NATIVE || "myapp://";
      const APP_REDIRECT_UNIVERSAL =
        process.env.EXPO_PUBLIC_APP_REDIRECT_UNIVERSAL || undefined;

      const metadata: any = {
        name: APP_NAME,
        description: APP_DESCRIPTION,
        url: APP_URL,
        icons: [APP_ICON],
        redirect: {
          native: APP_REDIRECT_NATIVE,
          universal: APP_REDIRECT_UNIVERSAL,
        },
      };

      sharedProvider = await UniversalProvider.init({
        projectId,
        metadata,
        relayUrl: "wss://relay.walletconnect.com",
      });

      setProvider(sharedProvider);
      initializing = false;

      const existingSessions = sharedProvider?.client?.session?.getAll?.() || [];
      if (existingSessions.length > 0) {
        const active = existingSessions[0];
        setSession(active as any);
        const starknetAccounts = (active as any)?.namespaces?.starknet
          ?.accounts;
        if (starknetAccounts?.length > 0) {
          setAccount(starknetAccounts[0].split(":")[2]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Setup failed: " + err.message);
      initializing = false;
    }
  };

  const connect = async (wallet: "argent" | "braavos") => {
    if (!sharedProvider && !provider) await initializeProvider();
    const effectiveProvider = sharedProvider || provider;
    if (!effectiveProvider) return;
    setActiveWallet(wallet);
    setConnecting(true);
    setError(null);

    const preferredChain = toCaip2Chain(network);
    const attemptConnect = async (chain: string) => {
      return await effectiveProvider.client.connect({
        requiredNamespaces: {
          starknet: {
            chains: [chain],
            methods: STARKNET_MIN_METHODS,
            events: ["accountsChanged", "chainChanged"],
          },
        },
        optionalNamespaces: {
          starknet: {
            chains: ["starknet:SN_MAIN", "starknet:SN_SEPOLIA"],
            methods: STARKNET_MIN_METHODS,
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });
    };

    try {
      const { uri, approval } = await attemptConnect(preferredChain);

      if (uri) {
        console.log("WalletConnect URI:", uri);
        // Try wallet-specific scheme first (was working before), then wc:, then universal link
        const deepLink = WALLET_DEEPLINKS[wallet](uri);
        try {
          await Linking.openURL(deepLink);
        } catch (_) {
          try {
            await Linking.openURL(uri);
          } catch (_) {
            try {
              const universal = `https://walletconnect.com/wc?uri=${encodeURIComponent(uri)}`;
              await Linking.openURL(universal);
            } catch (deeplinkError: any) {
              console.error("Deeplink open failed:", deeplinkError?.message || deeplinkError);
              setError(
                wallet === "argent"
                  ? "Could not open Argent via deep link. Try Braavos or paste your address."
                  : "Could not open Braavos. Ensure it is installed and up-to-date.",
              );
            }
          }
        }
      }

      const newSession = await approval();
      setSession(newSession);

      const accountAddress =
        newSession.namespaces.starknet.accounts[0].split(":")[2];
      setAccount(accountAddress);
      setConnecting(false);
    } catch (err: any) {
      // Retry with the other Starknet chain if the wallet can't satisfy the preferred one
      try {
        const fallbackChain = otherStarknetChain(preferredChain);
        const { uri, approval } = await attemptConnect(fallbackChain);
        if (uri) {
          console.log("WalletConnect URI:", uri);
          const deepLink = WALLET_DEEPLINKS[wallet](uri);
          try {
            await Linking.openURL(deepLink);
          } catch (_) {
            try {
              await Linking.openURL(uri);
            } catch (_) {
              try {
                const universal = `https://walletconnect.com/wc?uri=${encodeURIComponent(uri)}`;
                await Linking.openURL(universal);
              } catch (_) {}
            }
          }
        }
        const newSession = await approval();
        setSession(newSession);
        const accountAddress =
          newSession.namespaces.starknet.accounts[0].split(":")[2];
        setAccount(accountAddress);
        setConnecting(false);
      } catch (err2: any) {
        setError(err2.message || err.message);
        setConnecting(false);
      }
    }
  };

  const disconnect = useCallback(async () => {
    if (session && provider?.client) {
      try {
        await provider.client.disconnect({
          topic: session.topic,
          reason: { code: 6000, message: "User disconnected" },
        });
      } catch (_) {}
    }
    setSession(null);
    setAccount(null);
    setTxHash(null);
  }, [session, provider]);

  useEffect(() => {
    initializeProvider();
    if (sharedProvider?.client) {
      const c = sharedProvider.client;
      const onSessionDelete = () => {
        setSession(null);
        setAccount(null);
      };
      const onSessionUpdate = ({ params }: any) => {
        const s = params?.namespaces ? { ...session, namespaces: params.namespaces } : session;
        if (s) setSession(s as any);
      };
      c.on("session_delete", onSessionDelete);
      c.on("session_update", onSessionUpdate);
      return () => {
        c.off("session_delete", onSessionDelete);
        c.off("session_update", onSessionUpdate);
      };
    }
  }, []);

  return {
    connectArgent: () => connect("argent"),
    connectBraavos: () => connect("braavos"),
    account,
    txHash,
    disconnect,
    session,
    connecting,
    error,
  };
}
