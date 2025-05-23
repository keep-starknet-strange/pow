import 'react-native-get-random-values';
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  ImageBackground,
  Alert,
} from "react-native";
import { UniversalProvider } from "@walletconnect/universal-provider";
import background from "../../assets/background.png";


export const OffboardPage: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeProvider = async () => {
    try {
      const projectId = "your_walletconnect_project_id"; // Replace this
      const metadata = {
        name: "Click Chain",
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

  const connect = async () => {
    if (!provider) return;

    try {
      const { uri, approval } = await provider.client.connect({
        requiredNamespaces: {
          starknet: {
            chains: ["starknet:SNMAIN"],
            methods: ["starknet_account", "starknet_requestAddInvokeTransaction"],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });

      if (uri) {
        await Linking.openURL(`argent://wc?uri=${encodeURIComponent(uri)}`);
      }

      const newSession = await approval();
      setSession(newSession);

      const accountAddress = newSession.namespaces.starknet.accounts[0].split(":")[2];
      setAccount(accountAddress);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendTransaction = async () => {
    if (!provider || !session || !account) return;

    const amount = "0xa"; // 10 STRK tokens, assumed to be the low u256 amount

    const transaction = {
      accountAddress: account,
      executionRequest: {
        calls: [
          {
            contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // STRK contract
            entrypoint: "transfer",
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
      await Linking.openURL("argent://");

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

  useEffect(() => {
    initializeProvider();
  }, []);

  return (
    <ImageBackground className="flex-1" source={background} resizeMode="cover">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-4xl font-bold text-[#e7e7e7] mb-4">
          🎉 You earned 10 STRK!
        </Text>

        {!account ? (
          <>
            <Text className="text-xl text-[#e7e7e7] mb-4 text-center">
              Connect your wallet to receive them.
            </Text>
            <TouchableOpacity
              className="bg-blue-500 py-3 px-6 rounded-xl mb-4"
              onPress={connect}
            >
              <Text className="text-white text-lg font-bold">Connect Argent</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-[#e7e7e7] mb-2">Connected: {account}</Text>
            <TouchableOpacity
              className="bg-green-500 py-3 px-6 rounded-xl mb-4"
              onPress={sendTransaction}
            >
              <Text className="text-white text-lg font-bold">Claim STRK</Text>
            </TouchableOpacity>
          </>
        )}

        {txHash && (
          <Text className="text-green-300 mt-2 text-center">
            Transaction sent: {txHash}
          </Text>
        )}
        {error && (
          <Text className="text-red-400 mt-2 text-center">Error: {error}</Text>
        )}
      </View>
    </ImageBackground>
  );
};
