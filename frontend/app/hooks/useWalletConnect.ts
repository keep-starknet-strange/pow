 import 'react-native-get-random-values';
 import { useState, useEffect, useCallback } from "react";
 import { UniversalProvider } from "@walletconnect/universal-provider";
 import type { SessionTypes } from '@walletconnect/types';
 import { Linking, Alert } from "react-native";
 
 const WALLET_DEEPLINKS = {
  braavos: (uri: string) => `braavos://wc?uri=${encodeURIComponent(uri)}`,
  argent: (uri: string) => `argent://wc?uri=${encodeURIComponent(uri)}`,
};

const WC_PROJECT_ID = 'ad27f7ecf50cf0802b7cd433724dff24';

 export function useStarknetWalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWallet, setActiveWallet] = useState<'argent' | 'braavos' | null>(null);

  const initializeProvider = async () => {
    try {
      const projectId = WC_PROJECT_ID;
      const metadata = {
        name: "POW",
        description: "Earn STRK and connect to Argent Mobile",
        url: "https://walletconnect.com/",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      };

      const providerInstance = await UniversalProvider.init({
        projectId,
        metadata,
        relayUrl: "wss://relay.walletconnect.com",
      });

      setProvider(providerInstance);

      const activeSessions = Object.values(providerInstance.session || {});
      if (activeSessions.length > 0) {
        const active = activeSessions[0];
        setSession(active);
        const starknetAccounts = active?.namespaces?.starknet?.accounts;
        if (starknetAccounts?.length > 0) {
          setAccount(starknetAccounts[0].split(":")[2]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Setup failed: " + err.message);
    }
  };

  const connect = async (wallet: 'argent' | 'braavos') => {
    if (!provider) return;
    setActiveWallet(wallet);
    setConnecting(true);
    setError(null);

    try {
      const { uri, approval } = await provider.client.connect({
        requiredNamespaces: {
          starknet: {
            chains: ["starknet:SNMAIN"],
            methods: ['starknet_requestAddInvokeTransaction', 'starknet_signMessage'],
            events: ["accountsChanged", "chainChanged"],
          },
        },
        catch (err: any) {
        console.error("Connection failed:", err);
        setError(err.message);
      }
      });
 
      if (uri) {
        console.log("WalletConnect URI:", uri);
        await Linking.openURL(WALLET_DEEPLINKS[wallet](uri));
      }

      const newSession = await approval();
      setSession(newSession);

      const accountAddress = newSession.namespaces.starknet.accounts[0].split(":")[2];
      setAccount(accountAddress);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const claimRewards = async () => {
    if (!provider || !session || !account) return;

    const amount = "0xa"; // 10 STRK tokens, assumed to be the low u256 amount

    const transaction = {
      accountAddress: account,
      executionRequest: {
        calls: [
          {
            contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // STRK contract
            entrypoint: "claimRewards",
            calldata: [
              account, // to self
              amount,
              "0x0",
            ],
          },
        ],
      },
    };

    try {
      if (activeWallet) {
        await Linking.openURL(WALLET_DEEPLINKS[activeWallet](''));
      }

      const result = await provider.client.request({
        topic: session.topic,
        chainId: "starknet:SNMAIN",
        request: {
          method: "starknet_requestAddInvokeTransaction",
          params: {
            accountAddress: transaction.accountAddress,
            executionRequest: transaction.executionRequest,
          },
        },
      });

      if (result?.transaction_hash) {
        setTxHash(result.transaction_hash);
        Alert.alert("Success", `Transaction sent!\nHash: ${result.transaction_hash}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const disconnect = useCallback(async () => {
    if (session && provider.client) {
      await provider.disconnect({
        topic: session.topic,
        reason: { code: 6000, message: 'User disconnected' },
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
    connectArgent: () => connect('argent'),
    connectBraavos: () => connect('braavos'),
    claimRewards,
    txHash,
    disconnect,
    session,
    connecting,
    error,
  };
}
