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
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { usePowContractConnector } from "../../context/PowContractConnector";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWalletConnect } from "../../hooks/useWalletConnect";
import { SectionTitle } from "../../components/claim-reward/SectionTitle";
import { ClaimRewardAction } from "../../components/claim-reward/ClaimRewardAction";
import { useCachedWindowDimensions } from "../../hooks/useCachedDimensions";
import { BackGround } from "../../components/claim-reward/BackGround";
import { PageHeader } from "../../components/claim-reward/PageHeader";

// Decode various shapes of a Starknet u256 into a bigint
function decodeU256ToBigInt(raw: any): bigint | null {
  if (raw == null) return null;
  try {
    // Shape: { low, high }
    if (typeof raw === "object" && ("low" in raw || "high" in raw)) {
      const lowRaw = (raw as any).low ?? 0;
      const highRaw = (raw as any).high ?? 0;
      const low = BigInt(
        typeof lowRaw === "string" ||
          typeof lowRaw === "number" ||
          typeof lowRaw === "bigint"
          ? lowRaw
          : (lowRaw?.toString?.() ?? 0),
      );
      const high = BigInt(
        typeof highRaw === "string" ||
          typeof highRaw === "number" ||
          typeof highRaw === "bigint"
          ? highRaw
          : (highRaw?.toString?.() ?? 0),
      );
      return (high << 128n) + low;
    }

    // BN-like or BigNumberish with toString()
    if (typeof raw === "object" && typeof raw.toString === "function") {
      return BigInt(raw.toString());
    }

    // Hex or decimal string
    if (typeof raw === "string") {
      return BigInt(raw);
    }

    // Number or bigint
    if (typeof raw === "number" || typeof raw === "bigint") {
      return BigInt(raw);
    }

    return null;
  } catch (_e) {
    return null;
  }
}

type ClaimRewardProps = {
  setSettingTab?: (tab: "Main") => void;
  onBack?: () => void;
};

export const ClaimRewardSection: React.FC<ClaimRewardProps> = ({ onBack }) => {
  const { invokeCalls, network } = useStarknetConnector();
  const { powGameContractAddress, getRewardParams } = usePowContractConnector();
  const insets = useSafeAreaInsets();
  const [accountInput, setAccountInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState(accountInput);
  const [localTxHash, setLocalTxHash] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [rewardAmountStr, setRewardAmountStr] = useState<string>("10");
  const [rewardPrestigeThreshold, setRewardPrestigeThreshold] =
    useState<number>(0);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [busyText, setBusyText] = useState<string | null>(null);
  const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
  const { width, height } = useCachedWindowDimensions();

  const claimReward = async () => {
    const recipient = (debouncedInput || "").trim();
    if (!recipient) {
      if (__DEV__) console.error("No recipient provided");
      return;
    }
    if (!powGameContractAddress) {
      if (__DEV__) console.error("pow_game contract address not set");
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
        const {
          useInAppNotificationsStore,
        } = require("@/app/stores/useInAppNotificationsStore");
        useInAppNotificationsStore
          .getState()
          .sendInAppNotification(4, friendly);
      } catch (e) {
        // ignore notification errors
      }
      setClaimed(false);
    } finally {
      setClaiming(false);
      setBusyText(null);
    }
  };

  useEffect(() => {
    if (walletError) {
      Alert.alert("Wallet Error", walletError);
    }
  }, [walletError]);

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
      // Robustly decode u256 amount from various shapes
      const raw = (params as any).rewardAmount;
      const decoded = decodeU256ToBigInt(raw);
      if (__DEV__) {
        console.log(
          "getRewardParams raw:",
          params,
          "decoded:",
          decoded?.toString(),
        );
      }
      const amountStr = decoded != null ? decoded.toString() : "10";
      setRewardAmountStr(amountStr);
      if ((params as any).rewardPrestigeThreshold != null) {
        setRewardPrestigeThreshold(
          (params as any).rewardPrestigeThreshold as number,
        );
      }
    })();
  }, [getRewardParams]);

  const openReadyWallet = async () => {
    const scheme = "ready://open";
    try {
      await Linking.openURL(scheme);
      return;
    } catch (_e) {
      if (__DEV__) {
        console.debug("Failed to open READY wallet scheme");
      }
    }
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL(
          "https://apps.apple.com/us/app/ready-earn-on-bitcoin-usdc/id1358741926",
        );
      } else {
        const pkg = "im.argent.contractwalletclien";
        const market = `market://details?id=${pkg}`;
        const web = `https://play.google.com/store/apps/details?id=${pkg}`;
        await Linking.openURL(market).catch(() => Linking.openURL(web));
      }
    } catch (_e) {
      if (__DEV__) {
        console.debug("Failed to open READY install link");
      }
    }
  };
  //
  const openBraavosWallet = async () => {
    const scheme = "braavos://openr";
    try {
      await Linking.openURL(scheme);
      return;
    } catch (_e) {
      if (__DEV__) {
        console.debug("Failed to open BRAAVOS wallet scheme");
      }
    }
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL(
          "https://apps.apple.com/us/app/braavos-wallet/id1636013523",
        );
      } else {
        const pkg = "app.braavos.wallet";
        const market = `market://details?id=${pkg}`;
        const web = `https://play.google.com/store/apps/details?id=${pkg}`;
        await Linking.openURL(market).catch(() => Linking.openURL(web));
      }
    } catch (_e) {
      if (__DEV__) {
        console.debug("Failed to open BRAAVOS install link");
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safe]}>
      <BackGround width={width} height={height} />
      <PageHeader title="CLAIM REWARD" width={width} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 12 }}
        style={{ flex: 1 }}
      >
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.messageText}>
              Congratulations for completing POW! and reaching Prestige{" "}
              {rewardPrestigeThreshold}.
            </Text>
            <Text style={styles.messageHighlight}>
              You are now eligible for {rewardAmountStr} STRK
            </Text>
            <Text style={styles.messageSub}>
              To claim this reward you’ll need a dedicated Starknet wallet.
            </Text>
          </View>
        </View>

        {/* Section 1: Wallet Address */}
        <SectionTitle title="Wallet Address" width={width} />
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.buttonRow}>
              <ClaimRewardAction
                action={openReadyWallet}
                label="READY"
                style={styles.equalButton}
              />
              <ClaimRewardAction
                action={openBraavosWallet}
                label="BRAAVOS"
                style={styles.equalButton}
              />
            </View>
            <Text style={styles.hintInline}>
              Open a wallet above and paste an address to receive your STRK.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="copy/paste your account address"
              placeholderTextColor="#bfbfc6"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              value={accountInput}
              onChangeText={setAccountInput}
            />

            {(() => {
              const addr = (debouncedInput || "").trim();
              const enabled = !!addr;
              return (
                <View style={styles.linkSlot}>
                  <TouchableOpacity
                    style={styles.linkWrap}
                    disabled={!enabled}
                    onPress={() => {
                      if (!enabled) return;
                      Linking.openURL(`https://starkscan.co/contract/${addr}`);
                    }}
                  >
                    <Text
                      style={[styles.linkText, !enabled && styles.linkDisabled]}
                    >
                      View address on StarkScan
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        </View>

        <View
          style={[styles.bottomAction, { marginBottom: insets.bottom + 96 }]}
        >
          <ClaimRewardAction
            action={claimReward}
            label="CLAIM"
            disabled={claimed || claiming || !debouncedInput.trim()}
          />
        </View>

        {localTxHash && (
          <Text style={styles.successText}>Reward claimed! 🎊</Text>
        )}
        {claimed && <Text style={styles.successText}>Reward claimed! 🎊</Text>}
        {txErrorMessage && (
          <Text style={styles.errorText}>{txErrorMessage}</Text>
        )}
        {walletError && (
          <Text style={styles.errorText}>Error: {walletError}</Text>
        )}
      </ScrollView>

      <View
        style={[styles.backAction, { bottom: Math.max(insets.bottom - 25, 0) }]}
      >
        <ClaimRewardAction
          action={() => {
            if (onBack) onBack();
          }}
          label="BACK"
          disabled={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    position: "relative",
  },
  screen: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 80,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#101119",
    marginBottom: 8,
    fontFamily: "Xerxes",
  },
  titleAlt: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101119",
    marginBottom: 8,
    fontFamily: "Xerxes",
  },
  subtitle: {
    fontSize: 16,
    color: "#e7e7e7",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Xerxes",
  },
  buttonWrap: {
    marginVertical: 10,
  },
  basicButton: {
    alignSelf: "center",
  },
  basicButtonText: {
    fontSize: 20,
    fontFamily: "Xerxes",
  },
  input: {
    width: 300,
    maxWidth: "100%",
    alignSelf: "center",
    minHeight: 46,
    borderRadius: 10,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    color: "#fff7ff",
    borderWidth: 2,
    borderColor: "#39274E",
    backgroundColor: "#0f0f14",
    fontFamily: "Pixels",
  },
  section: { marginBottom: 10 },
  card: {
    backgroundColor: "rgba(16,17,25,0.75)",
    borderWidth: 1,
    borderColor: "#39274E",
    borderRadius: 6,
    padding: 12,
  },
  messageText: {
    fontFamily: "Pixels",
    fontSize: 18,
    color: "#e7e7e7",
    textAlign: "center",
  },
  messageHighlight: {
    fontFamily: "Pixels",
    fontSize: 18,
    textAlign: "center",
    color: "#22c55e",
  },
  messageSub: {
    fontFamily: "Pixels",
    fontSize: 16,
    color: "#e7e7e7",
    textAlign: "center",
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    columnGap: 16,
    marginBottom: 12,
  },
  equalButton: {
    flex: 1,
  },
  hintInline: {
    fontFamily: "Pixels",
    fontSize: 16,
    color: "#e7e7e7",
    textAlign: "center",
    marginTop: 8,
  },
  linkWrap: { paddingVertical: 6 },
  linkText: {
    color: "#fff7ff",
    textDecorationLine: "underline",
    textAlign: "center",
    marginVertical: 4,
    fontFamily: "Pixels",
  },
  linkDisabled: { color: "#9ca3af", textDecorationLine: "none" },
  linksContainer: {
    marginTop: 8,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  linkSlot: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  successText: {
    color: "#22c55e",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Xerxes",
  },
  errorText: {
    color: "#f87171",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Xerxes",
  },
  loadingOverlay: {
    flex: 1,
    // backgroundColor: "#00000080",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    // backgroundColor: "#101119",
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
  bottomAction: {
    marginBottom: 16,
    alignSelf: "center",
    width: 150,
  },
  backAction: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: 150,
    // marginBottom: 8,
  },
});
