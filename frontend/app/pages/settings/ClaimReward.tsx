import "react-native-get-random-values";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { usePowContractConnector } from "../../context/PowContractConnector";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BasicButton from "../../components/buttons/Basic";
import { useWalletConnect } from "../../hooks/useWalletConnect";

type ClaimRewardProps = {
  setSettingTab: (tab: "Main") => void;
};

export const ClaimRewardSection: React.FC = () => {
  const { invokeCalls } = useStarknetConnector();
  const { powGameContractAddress, getRewardParams } = usePowContractConnector();
  const { sendInAppNotification } = require("@/app/stores/useInAppNotificationsStore");
  const insets = useSafeAreaInsets();
  const {
    connectArgent,
    account,
    error: wcError,
    disconnect,
  } = useWalletConnect();
  const [accountInput, setAccountInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState(accountInput);
  const [localTxHash, setLocalTxHash] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [rewardTitle, setRewardTitle] = useState<string>(
    "🎉 You earned 10 STRK!",
  );
  const [walletError, setWalletError] = useState<string | null>(null);
  const [busyText, setBusyText] = useState<string | null>(null);
  const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);

  const rewardUnlocked = true;

  const claimReward = async () => {
    const recipient = (debouncedInput || "").trim();
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
    setBusyText("Submitting transaction…");
    setTxErrorMessage(null);
    try {
      const res = await invokeCalls([call], 1);
      const hash = res?.data?.transactionHash || res?.transaction_hash || null;
      if (hash) setLocalTxHash(hash);
      setClaimed(true);
    } catch (err: any) {
      const raw = (err && (err.message || String(err))) || "";
      const alreadyClaimed = /reward already claimed/i.test(raw);
      const friendly = alreadyClaimed
        ? "Reward already claimed"
        : "Transaction failed. Please try again.";
      setTxErrorMessage(friendly);
      try {
        const { useInAppNotificationsStore } = require("@/app/stores/useInAppNotificationsStore");
        useInAppNotificationsStore.getState().sendInAppNotification(4, friendly);
      } catch {}
      setClaimed(false);
    } finally {
      setClaiming(false);
      setBusyText(null);
    }
  };

  const handleConnectBraavos = async () => {
    setWalletError(null);
    setBusyText("Opening Braavos…");
    try {
      const candidates = ["braavos://", "https://braavos.app"];
      let opened = false;
      for (const url of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const can = await Linking.canOpenURL(url).catch(() => false);
        if (can) {
          // eslint-disable-next-line no-await-in-loop
          await Linking.openURL(url);
          opened = true;
          break;
        }
      }
      if (!opened) {
        Alert.alert(
          "Braavos not found",
          "Please install Braavos, then copy your address and paste it here.",
        );
      } else {
        Alert.alert(
          "Open Braavos",
          "Copy your Starknet address in Braavos, then return and paste it here.",
        );
      }
    } finally {
      setBusyText(null);
    }
  };
  const handleConnectArgent = () => {
    setWalletError(null);
    setBusyText("Waiting for wallet approval…");
    (async () => {
      try {
        await connectArgent();
      } finally {
        setBusyText(null);
      }
    })();
  };

  useEffect(() => {
    if (walletError) {
      Alert.alert("Wallet Error", walletError);
    }
  }, [walletError]);

  useEffect(() => {
    if (wcError) setWalletError(wcError);
  }, [wcError]);

  useEffect(() => {
    if (account && !accountInput) {
      setAccountInput(account);
    }
  }, [account]);

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
    })();
  }, [getRewardParams]);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top - 12, 0) }]}>    
      <View style={[styles.content, { marginBottom: insets.bottom + 220 }]}>        
        <Modal visible={!!busyText} transparent animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>{busyText}</Text>
            </View>
          </View>
        </Modal>
        {!rewardUnlocked ? (
          <Text style={styles.titleAlt}>Keep playing to Earn STRK!</Text>
        ) : (
          <>
            <Text style={styles.title}>{rewardTitle}</Text>

            <View style={styles.buttonWrap}>
              <BasicButton
                onPress={handleConnectBraavos}
                label="Connect Braavos"
                style={styles.basicButton}
                textStyle={styles.basicButtonText}
                // disabled={connecting}
              />
            </View>

            <View style={styles.buttonWrap}>
              <BasicButton
                onPress={handleConnectArgent}
                label="Connect Argent"
                style={styles.basicButton}
                textStyle={styles.basicButtonText}
                // disabled={connecting}
              />
            </View>

            {account ? (
              <Text style={styles.subtitle}>
                Connected wallet: {account.slice(0, 6)}...{account.slice(-6)}
              </Text>
            ) : null}

            <Text style={styles.subtitle}>
              Paste your Starknet address to receive them.
            </Text>

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

            <View
              style={[
                styles.linksContainer,
                { marginBottom: insets.bottom + 160 },
              ]}
            >
              {(() => {
                const addr = (debouncedInput || "").trim();
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

              {localTxHash && (
                <TouchableOpacity
                  style={styles.linkWrap}
                  onPress={() => {
                    const hash = localTxHash as string;
                    Linking.openURL(`https://starkscan.co/tx/${hash}`);
                  }}
                >
                  <Text style={styles.linkText}>
                    View transaction on StarkScan ({localTxHash?.slice(0, 6)}...
                    {localTxHash?.slice(-6)})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {localTxHash && (
              <Text style={styles.successText}>Reward claimed! 🎊</Text>
            )}
            {claimed && (
              <Text style={styles.successText}>Reward claimed! 🎊</Text>
            )}
            {txErrorMessage && (
              <Text style={styles.errorText}>{txErrorMessage}</Text>
            )}
            {walletError && (
              <Text style={styles.errorText}>Error: {walletError}</Text>
            )}
            <Text style={styles.hintText}>
              If you use Braavos, open the app, copy your address, and paste it
              above.
            </Text>
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
    fontFamily: "Xerxes",
  },
  titleAlt: {
    fontSize: 32,
    fontWeight: "700",
    color: "#101119",
    marginBottom: 12,
    fontFamily: "Xerxes",
  },
  subtitle: {
    fontSize: 18,
    color: "#e7e7e7",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Xerxes",
  },
  buttonWrap: {
    marginVertical: 10,
  },
  basicButton: {
    alignSelf: "center",
  },
  basicButtonText: {
    fontSize: 24,
    fontFamily: "Xerxes",
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
    fontFamily: "Xerxes",
  },
  linkWrap: { paddingVertical: 6 },
  linkText: {
    color: "#101119", // black, readable on green background
    textDecorationLine: "underline",
    textAlign: "center",
    marginVertical: 6,
    fontFamily: "Xerxes",
  },
  linkDisabled: { color: "#9ca3af" },
  linksContainer: {
    marginTop: 10,
    marginBottom: 64,
    width: "100%",
    alignItems: "center",
  },
  successText: { color: "#22c55e", marginTop: 8, textAlign: "center", fontFamily: "Xerxes" },
  errorText: { color: "#f87171", marginTop: 8, textAlign: "center", fontFamily: "Xerxes" },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "#101119",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    maxWidth: 280,
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Xerxes",
  },
  hintText: {
    fontSize: 14,
    color: "#e7e7e7",
    textAlign: "center",
    marginTop: 12,
    fontFamily: "Xerxes",
  },
});
