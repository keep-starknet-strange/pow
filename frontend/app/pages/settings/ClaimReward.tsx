import "react-native-get-random-values";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Linking } from "react-native";
import { useWalletConnect } from "../../hooks/useWalletConnect";
import { useStarknetConnector } from "../../context/StarknetConnector";
import BasicButton from "../../components/buttons/Basic";

type ClaimRewardProps = {
  setSettingTab: (tab: "Main") => void;
};

export const ClaimRewardSection: React.FC<ClaimRewardProps> = ({
  setSettingTab,
}) => {
  const { connectArgent, connectBraavos, account, txHash, error } =
    useWalletConnect();
  const { account: gameAccount, invokeContract } = useStarknetConnector();
  const [accountInput, setAccountInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState(accountInput);

  // TODO: derive from on-chain prestige state; for now, assume unlocked via UI
  const rewardUnlocked = true;

  const claimReward = async () => {
    // gameAccount is the signer used to call the contract; recipient is where tokens go
    if (!gameAccount) {
      console.error("Game account is not connected");
      return;
    }
    const recipient = (account && account.trim()) || accountInput.trim();
    if (!recipient) {
      console.error("No recipient provided");
      return;
    }
    const contractAddress =
      process.env.EXPO_PUBLIC_POW_GAME_CONTRACT_ADDRESS || "";
    if (!contractAddress) {
      console.error("Missing EXPO_PUBLIC_POW_GAME_CONTRACT_ADDRESS");
      return;
    }
    const functionName = "claim_reward";
    await invokeContract(contractAddress, functionName, [recipient]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(accountInput);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [accountInput]);

  return (
    <View className="flex-1 justify-center items-center px-6">
        {!rewardUnlocked ? (
          <Text className="text-4xl font-bold text-[#101119] mb-4">
            Keep playing to Earn STRK!
          </Text>
        ) : (
          <>
            <Text className="text-4xl font-bold text-[#101119] mb-4">
              🎉 You earned 10 STRK!
            </Text>

            <Text className="text-xl text-[#e7e7e7] mb-4 text-center">
              Connect your wallet to receive them.
            </Text>

            <View className="my-6">
              <BasicButton
                onPress={connectArgent}
                label="Connect Argent"
                style={{ paddingHorizontal: 20 }}
              />
            </View>

            <View className="my-6">
              <BasicButton
                onPress={connectBraavos}
                label="Connect Braavos"
                style={{ paddingHorizontal: 20 }}
              />
            </View>

            <TextInput
              className="bg-[#10111910] w-3/4 rounded-lg my-4 p-2 text-xl text-[#101119] border-2 border-[#101119] shadow-lg shadow-black/50"
              placeholder="copy/paste your account address"
              placeholderTextColor="#10111980"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              value={accountInput}
              onChangeText={setAccountInput}
            />

            <TouchableOpacity
              className="py-2"
              disabled={!debouncedInput.trim()}
              onPress={() => {
                Linking.openURL(
                  `https://starkscan.co/contract/${accountInput}`,
                );
              }}
            >
              <Text
                className={`${!debouncedInput.trim() ? "text-gray-400" : "text-[#80bfff]"} underline text-center my-4`}
              >
                View on StarkScan ({debouncedInput.slice(0, 4)}...
                {debouncedInput.slice(-4)})
              </Text>
            </TouchableOpacity>

            <View className="my-3">
              <BasicButton
                label="Claim STRK"
                onPress={claimReward}
                disabled={!gameAccount || (!debouncedInput.trim() && !account)}
              />
            </View>

            {txHash && (
              <Text className="text-green-300 mt-2 text-center">
                Transaction sent: {txHash}
              </Text>
            )}
            {error && (
              <Text className="text-red-400 mt-2 text-center">
                Error: {error}
              </Text>
            )}
          </>
        )}

        <BasicButton
          label="Back to Settings"
          onPress={() => setSettingTab("Main")}
          style={{ paddingHorizontal: 24, marginTop: 20 }}
        />
      </View>
  );
};
