import 'react-native-get-random-values';
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Linking,
} from "react-native";
import background from "../../assets/background.png";
import { useWalletConnect } from "../hooks/useWalletConnect";
import { useStarknetConnector } from '../context/StarknetConnector';
import BasicButton from '../components/buttons/Basic';
import { WebView } from 'react-native-webview';

export const OffboardPage: React.FC = () => {
  const { connectArgent, connectBraavos, account, txHash, error } = useWalletConnect();
  const {account: gameAccount, invokeContract} = useStarknetConnector();
  const [accountInput, setAccountInput] = useState("");

  const claimReward = async () => {
    if (!gameAccount || accountInput.trim() === "") {
      console.error("No account connected");
      return;
    }
    const contractAddress = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"; // Replace with actual contract address
    const functionName = "claim_reward";
    const accountReceiver = gameAccount || accountInput.trim();
    invokeContract(contractAddress, functionName, [accountReceiver]);
  }

  return (
    <ImageBackground className="flex-1" source={background} resizeMode="cover">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-4xl font-bold text-[#ffff80] mb-4">
          🎉 You earned 10 STRK!
        </Text>

        <Text className="text-xl text-[#e7e7e7] mb-4 text-center">
          Connect your wallet to receive them.
        </Text>

        <View className="py-3 px-6 rounded-xl mb-4">
          <BasicButton
            onPress={connectArgent}
            label="Connect Argent"
          />
        </View>

        <View className="py-3 px-6 rounded-xl mb-4">
          <BasicButton
            onPress={connectBraavos}
            label="Connect Braavos"
          />
        </View>
        <TextInput
          className="bg-[#ffff8010] w-3/4 rounded-lg mt-2 px-2 py-1 text-xl text-[#ffff80] border-2 border-[#ffff80] shadow-lg shadow-black/50"
          placeholder="copy/paste your account address"
          placeholderTextColor="#ffff8080"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          value={accountInput}
          onChangeText={setAccountInput}
        />
  
        <TouchableOpacity
          className="py-2"
          onPress={() => {
            Linking.openURL(`https://starkscan.co/contract/${accountInput}`)
          }}
          >
          <Text className="text-[#80bfff] underline text-center mt-2">
            View on StarkScan  ({accountInput.slice(0, 4)}...{accountInput.slice(-4)})
          </Text>
        </TouchableOpacity>

        <View className='py3'>
          <BasicButton
            label="Claim STRK"
            onPress={claimReward}
            disabled={!accountInput.trim() || !gameAccount}
          />
        </View>

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
