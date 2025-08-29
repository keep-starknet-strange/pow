import "react-native-get-random-values";
import { useState, useEffect, useCallback } from "react";
import { UniversalProvider } from "@walletconnect/universal-provider";
import type { SessionTypes } from "@walletconnect/types";
import { Linking, Alert } from "react-native";

const WALLET_DEEPLINKS = {
  braavos: (uri: string) => `braavos://wc?uri=${encodeURIComponent(uri)}`,
  argent: (uri: string) => `argent://wc?uri=${encodeURIComponent(uri)}`,
};

const WC_PROJECT_ID = "ad27f7ecf50cf0802b7cd433724dff24";

// Module-level singleton to avoid multiple initializations
let sharedProvider: any | null = null;
let initializing = false;

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

  const initializeProvider = async () => {
    try {
      if (sharedProvider) {
        setProvider(sharedProvider);
        // adopt existing session if present
        const activeSessions = Object.values(sharedProvider.session || {});
        if (activeSessions.length > 0) {
          const active = activeSessions[0];
          setSession(active as any);
          const starknetAccounts = (active as any)?.namespaces?.starknet?.accounts;
          if (starknetAccounts?.length > 0) {
            setAccount(starknetAccounts[0].split(":")[2]);
          }
        }
        return;
      }
      if (initializing) return;
      initializing = true;

      const projectId = WC_PROJECT_ID;
      const metadata = {
        name: "POW",
        description: "Earn STRK and connect to Argent Mobile",
        url: "https://walletconnect.com/",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      };

      sharedProvider = await UniversalProvider.init({
        projectId,
        metadata,
        relayUrl: "wss://relay.walletconnect.com",
      });

      setProvider(sharedProvider);
      initializing = false;

      const activeSessions = Object.values(sharedProvider.session || {});
      if (activeSessions.length > 0) {
        const active = activeSessions[0];
        setSession(active as any);
        const starknetAccounts = (active as any)?.namespaces?.starknet?.accounts;
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

    try {
      const { uri, approval } = await effectiveProvider.client.connect({
        requiredNamespaces: {
          starknet: {
            chains: ["starknet:SNMAIN"],
            methods: [
              "starknet_requestAddInvokeTransaction",
              "starknet_signMessage",
            ],
            events: ["accountsChanged", "chainChanged"],
          },
        },
        catch(err: any) {
          console.error("Connection failed:", err);
          setError(err.message);
        },
      });

      if (uri) {
        console.log("WalletConnect URI:", uri);
        await Linking.openURL(WALLET_DEEPLINKS[wallet](uri));
      }

      const newSession = await approval();
      setSession(newSession);

      const accountAddress =
        newSession.namespaces.starknet.accounts[0].split(":")[2];
      setAccount(accountAddress);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const disconnect = useCallback(async () => {
    if (session && provider.client) {
      await provider.disconnect({
        topic: session.topic,
        reason: { code: 6000, message: "User disconnected" },
      });
      setSession(null);
      setAccount(null);
      setTxHash(null);
    }
  }, [session, provider]);

  useEffect(() => {
    initializeProvider();
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
