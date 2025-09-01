import "react-native-get-random-values";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { useWalletConnect } from "../../hooks/useWalletConnect";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { usePowContractConnector } from "../../context/PowContractConnector";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BasicButton from "../../components/buttons/Basic";

type ClaimRewardProps = {
  setSettingTab: (tab: "Main") => void;
};

export const ClaimRewardSection: React.FC = () => {
  const { account, txHash, error } = useWalletConnect();
  const { invokeCalls } = useStarknetConnector();
  const { powGameContractAddress, getRewardParams, getHasClaimedReward } =
    usePowContractConnector();
  const insets = useSafeAreaInsets();
  const [accountInput, setAccountInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState(accountInput);
  const [localTxHash, setLocalTxHash] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [rewardTitle, setRewardTitle] = useState<string>(
    "🎉 You earned 10 STRK!",
  );

  const rewardUnlocked = true;

  const claimReward = async () => {
    const recipient = (debouncedInput || account || "").trim();
    if (!recipient) { 
      console.error("No recipient provided");
      return;
    }
    if (!powGameContractAddress) {
      console.error("pow_game contract address not set");
      return;
    }
    const call = {
      contractAddress: powGameContractAddress,
      entrypoint: "claim_reward",
      calldata: [recipient] as string[],
    };
    setClaiming(true);
    const res = await invokeCalls([call], 1);
    const hash = res?.data?.transactionHash || res?.transaction_hash || null;
    if (hash) setLocalTxHash(hash);
    setClaiming(false);
    setClaimed(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(accountInput);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [accountInput]);

  useEffect(() => {
    (async () => {
      const params = await getRewardParams?.();
      if (!params) return;
      // Format u256 amount (assume low only for now)
      let amountStr = "10";
      const raw = params.rewardAmount as any;
      if (raw?.low || raw?.high) {
        const low = BigInt(raw.low || 0);
        const high = BigInt(raw.high || 0);
        const amount = (high << 128n) + low;
        amountStr = amount.toString();
      }
      setRewardTitle(`🎉 You earned ${amountStr} STRK!`);
      // Check claimed state on mount
      const alreadyClaimed = await getHasClaimedReward?.();
      if (alreadyClaimed === true) setClaimed(true);
    })();
  }, [getRewardParams, getHasClaimedReward]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={[styles.content, { marginBottom: insets.bottom + 140 }]}>
        {!rewardUnlocked ? (
          <Text style={styles.titleAlt}>Keep playing to Earn STRK!</Text>
        ) : (
          <>
            <Text style={styles.title}>{rewardTitle}</Text>

            <Text style={styles.subtitle}>Paste your Starknet address to receive them.</Text>

            <TextInput
              style={styles.input}
              placeholder="copy/paste your account address"
              placeholderTextColor="#10111980"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              value={accountInput}
              onChangeText={setAccountInput}
            />

            <View style={styles.buttonWrap}>
              <BasicButton
                label="Claim STRK"
                onPress={claimReward}
                style={styles.basicButton}
                textStyle={styles.basicButtonText}
                disabled={claimed || claiming || !debouncedInput.trim()}
              />
            </View>

            <View style={styles.linksContainer}>
              {(() => {
                const addr = (debouncedInput || account || "").trim();
                if (!addr) return null;
                return (
                  <TouchableOpacity
                    style={styles.linkWrap}
                    onPress={() =>
                      Linking.openURL(`https://starkscan.co/contract/${addr}`)
                    }
                  >
                    <Text style={styles.linkText}>
                      View address on StarkScan ({addr.slice(0, 6)}...
                      {addr.slice(-6)})
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              {(txHash || localTxHash) && (
                <TouchableOpacity
                  style={styles.linkWrap}
                  onPress={() => {
                    const hash = (txHash || localTxHash) as string;
                    Linking.openURL(`https://starkscan.co/tx/${hash}`);
                  }}
                >
                  <Text style={styles.linkText}>
                    View transaction on StarkScan (
                    {(txHash || localTxHash)?.slice(0, 6)}...
                    {(txHash || localTxHash)?.slice(-6)})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {(txHash || localTxHash) && (
              <Text style={styles.successText}>Reward claimed! 🎊</Text>
            )}
            {claimed && (
              <Text style={styles.successText}>Reward claimed! 🎊</Text>
            )}
            {error && <Text style={styles.errorText}>Error: {error}</Text>}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#101119",
    marginBottom: 12,
  },
  titleAlt: {
    fontSize: 32,
    fontWeight: "700",
    color: "#101119",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#e7e7e7",
    textAlign: "center",
    marginBottom: 16,
  },
  buttonWrap: {
    marginVertical: 10,
  },
  basicButton: {
    alignSelf: "center",
  },
  basicButtonText: {
    fontSize: 24,
  },
  input: {
    width: 300,
    maxWidth: "100%",
    alignSelf: "center",
    minHeight: 46,
    borderRadius: 10,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    color: "#101119",
    borderWidth: 2,
    borderColor: "#101119",
    backgroundColor: "#10111910",
  },
  linkWrap: { paddingVertical: 6 },
  linkText: {
    color: "#101119", // black, readable on green background
    textDecorationLine: "underline",
    textAlign: "center",
    marginVertical: 6,
  },
  linkDisabled: { color: "#9ca3af" },
  linksContainer: {
    marginTop: 6,
    marginBottom: 24,
    width: "100%",
    alignItems: "center",
  },
  successText: { color: "#22c55e", marginTop: 8, textAlign: "center" },
  errorText: { color: "#f87171", marginTop: 8, textAlign: "center" },
});
