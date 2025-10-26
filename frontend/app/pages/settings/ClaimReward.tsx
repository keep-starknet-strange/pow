import React, { useCallback, useEffect, useState } from "react";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react-native";
import { uint256 } from "starknet";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { usePowContractConnector } from "../../context/PowContractConnector";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SectionTitle } from "../../components/claim-reward/SectionTitle";
import { ClaimRewardAction } from "../../components/claim-reward/ClaimRewardAction";
import { useCachedWindowDimensions } from "../../hooks/useCachedDimensions";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { AddressExplorerLink } from "../../components/claim-reward/AddressExplorerLink";
import { PageHeader } from "../../components/claim-reward/PageHeader";
import { WalletButtonRow } from "../../components/claim-reward/WalletButtonRow";
import { LoadingModal } from "../../components/claim-reward/LoadingModal";
import { useEventManager } from "../../stores/useEventManager";
import { InsufficientFundsModal } from "../../components/InsufficientFundsModal";
import { useOpenApp } from "../../hooks/useOpenApp";
import { WalletPresets } from "@/constants/WalletPresets";
import {
  visitorIdToFelt252,
  FINGERPRINT_CONFIG,
} from "../../configs/fingerprint";

// Decode common Starknet u256/BigNumberish shapes using starknet helpers
function decodeU256ToBigInt(raw: any): bigint | null {
  if (raw == null) return null;
  try {
    if (typeof raw === "object" && ("low" in raw || "high" in raw)) {
      return uint256.uint256ToBN(raw as any);
    }
    // Fallback for non-object: use uint256.uint256ToBN if possible, else try BigInt
    try {
      return BigInt(raw);
    } catch {
      return null;
    }
  } catch (_e) {
    return null;
  }
}

type ClaimRewardProps = {
  onBack?: () => void;
};

const ClaimRewardSectionComponent: React.FC<ClaimRewardProps> = ({
  onBack,
}) => {
  const { invokeCalls, network } = useStarknetConnector();
  const { powGameContractAddress, getRewardParams, getRewardPoolBalance } =
    usePowContractConnector();
  const {
    data: visitorData,
    isLoading: fingerprintLoading,
    error: fingerprintHookError,
    getData,
  } = useVisitorData();
  const insets = useSafeAreaInsets();
  const [accountInput, setAccountInput] = useState("");
  const debouncedInput = useDebouncedValue(accountInput, 200);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [rewardAmountStr, setRewardAmountStr] = useState<string>("10");
  const [rewardAmountRaw, setRewardAmountRaw] = useState<bigint | null>(null);
  // no local token address state needed; the connector reads it internally
  const [rewardPrestigeThreshold, setRewardPrestigeThreshold] =
    useState<number>(0);
  const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [fingerprintError, setFingerprintError] = useState<string | null>(null);
  const { width } = useCachedWindowDimensions();
  const { notify } = useEventManager();
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const { openApp } = useOpenApp();

  // Try to manually trigger fingerprint data if it's not loading
  React.useEffect(() => {
    if (
      !fingerprintLoading &&
      !visitorData &&
      !fingerprintHookError &&
      getData
    ) {
      if (__DEV__) {
        console.log(
          "Claim Reward - Manually triggering fingerprint data fetch...",
        );
      }
      getData();
    }
  }, [fingerprintLoading, visitorData, fingerprintHookError, getData]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
  }, [onBack]);

  const claimReward = useCallback(async () => {
    const recipient = (debouncedInput || "").trim();
    if (!recipient) {
      if (__DEV__) console.error("No recipient provided");
      return;
    }
    if (!powGameContractAddress) {
      if (__DEV__) console.error("pow_game contract address not set");
      return;
    }

    // Check if fingerprint is still loading
    if (fingerprintLoading) {
      console.log("Claim Reward - Fingerprint still loading");
      setFingerprintError("Device verification is loading. Please wait...");
      return;
    }

    // Check fingerprint confidence
    if (!visitorData?.visitorId) {
      if (__DEV__) {
        console.log("Claim Reward - No visitor ID available");
      }
      setFingerprintError("Device verification failed. Please try again.");
      return;
    }
    if (__DEV__) {
      console.log(
        "Claim Reward - Fingerprint confidence:",
        visitorData.confidence?.score,
      );
    }
    if (visitorData.confidence.score < FINGERPRINT_CONFIG.confidenceThreshold) {
      setFingerprintError("Device verification confidence too low.");
      return;
    }

    const visitorIdFelt = visitorIdToFelt252(visitorData.visitorId);
    console.log(
      "Claim Reward - Converted visitor ID to felt252:",
      visitorIdFelt,
    );
    const call = {
      contractAddress: powGameContractAddress,
      entrypoint: "claim_reward",
      calldata: [recipient, visitorIdFelt] as string[],
    };
    setClaiming(true);
    setTxErrorMessage(null);
    setFingerprintError(null);
    try {
      const res = await invokeCalls([call], 1);
      const hash = res?.data?.transactionHash || res?.transaction_hash || null;
      if (hash) {
        setClaimed(true);
        setClaimTxHash(hash);
        // Save transaction hash to AsyncStorage after successful transaction
        await AsyncStorage.setItem("rewardClaimedTxHash", hash);
        // Save fingerprint reward claimed flag
        await AsyncStorage.setItem("fingerprintRewardClaimed", "true");
        // Notify achievement system that STRK reward was claimed
        notify("RewardClaimed", { recipient, transactionHash: hash });
      } else {
        throw new Error("Transaction completed but no hash returned");
      }
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
    }
  }, [debouncedInput, powGameContractAddress, invokeCalls, visitorData]);

  useEffect(() => {
    (async () => {
      const params = await getRewardParams?.();
      if (!params) return;
      // Robustly decode u256 amount from various shapes
      const raw = (params as any).rewardAmount;
      const decoded = decodeU256ToBigInt(raw);
      const strkDecimals = 18;
      const divisor = BigInt(10) ** BigInt(strkDecimals);
      const adjusted = decoded != null ? decoded / divisor : null;
      const amountStr =
        adjusted != null ? adjusted.toString() : raw || "unknown";
      setRewardAmountStr(amountStr);
      if ((params as any).rewardPrestigeThreshold != null) {
        setRewardPrestigeThreshold(
          (params as any).rewardPrestigeThreshold as number,
        );
      }
      // Keep bigint raw form for comparisons
      try {
        const big = decoded != null ? BigInt(decoded as any) : null;
        setRewardAmountRaw(big);
      } catch (_e) {
        setRewardAmountRaw(null);
      }
    })();
  }, [getRewardParams]);

  // Check POW contract reward-token balance via connector
  useEffect(() => {
    if (!rewardAmountRaw) return;
    let cancelled = false;
    (async () => {
      try {
        const bal = await getRewardPoolBalance();
        if (cancelled) return;
        if (bal != null && bal < rewardAmountRaw) {
          setShowInsufficientFunds(true);
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Failed to fetch reward pool balance:", error);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getRewardPoolBalance, rewardAmountRaw]);

  // Load saved transaction hash and fingerprint reward status on mount
  useEffect(() => {
    (async () => {
      const savedHash = await AsyncStorage.getItem("rewardClaimedTxHash");
      if (savedHash) {
        setClaimed(true);
        setClaimTxHash(savedHash);
      }
    })();
  }, []);

  const isValidAddress = /^0x[a-fA-F0-9]{63,64}$/.test(
    (debouncedInput || "").trim(),
  );

  const claimState = claimed ? "claimed" : claiming ? "claiming" : "idle";

  const claimLabel =
    claimState === "claimed"
      ? "CLAIMED"
      : claimState === "claiming"
        ? `CLAIMING ${rewardAmountStr} STRK`
        : `CLAIM ${rewardAmountStr} STRK`;

  const claimDisabled =
    claimed ||
    claiming ||
    !isValidAddress ||
    !visitorData?.visitorId ||
    visitorData?.confidence.score < FINGERPRINT_CONFIG.confidenceThreshold;

  const containerWidth = claimState === "claiming" ? 260 : 220;

  const explorerBase =
    network === "SN_SEPOLIA"
      ? "https://sepolia.voyager.online"
      : "https://voyager.online";

  const handleViewClaimTransaction = useCallback(() => {
    if (claimTxHash) {
      Linking.openURL(`${explorerBase}/tx/${claimTxHash}`);
    }
  }, [claimTxHash, explorerBase]);

  return (
    <SafeAreaView style={[styles.safe]}>
      <InsufficientFundsModal
        visible={showInsufficientFunds}
        onBack={() => {
          setShowInsufficientFunds(false);
          handleBack();
        }}
      />
      <PageHeader title="CLAIM REWARD" width={width} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 4 }}
        style={{ flex: 1 }}
      >
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.messageText}>
              Congratulations for completing POW! and reaching Prestige{" "}
              {rewardPrestigeThreshold}.
            </Text>
            {claimed ? (
              <Text style={styles.messageHighlight}>Reward claimed!</Text>
            ) : (
              <>
                <Text style={styles.messageHighlight}>
                  You are now eligible for {rewardAmountStr} STRK
                </Text>
                <Text style={styles.messageSub}>
                  To claim this reward you’ll need a dedicated Starknet wallet.
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Section 1: Wallet Address */}
        <SectionTitle title="Wallet Address" width={width} />
        <View style={styles.section}>
          <View style={styles.card}>
            <WalletButtonRow
              onPressReady={() => openApp(WalletPresets.readyWallet)}
              onPressBraavos={() => openApp(WalletPresets.braavos)}
            />
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

            <AddressExplorerLink
              address={debouncedInput}
              network={network}
              styles={{
                linkSlot: styles.linkSlot,
                linkWrap: styles.linkWrap,
                linkText: styles.linkText,
                linkDisabled: styles.linkDisabled,
                validationSlot: styles.validationSlot,
                errorInline: styles.errorInline,
              }}
            />
          </View>
        </View>

        <View
          style={[
            styles.bottomAction,
            { marginBottom: insets.bottom + 64, width: containerWidth },
          ]}
        >
          <ClaimRewardAction
            action={claimReward}
            label={claimLabel}
            disabled={claimDisabled}
          />
          {claimed && claimTxHash && (
            <TouchableOpacity
              style={styles.voyagerLink}
              onPress={handleViewClaimTransaction}
            >
              <Text style={styles.voyagerLinkText}>View claim on Voyager</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View
        style={[styles.backAction, { bottom: Math.max(insets.bottom - 25, 0) }]}
      >
        <ClaimRewardAction action={handleBack} label="BACK" disabled={false} />
      </View>

      {(txErrorMessage || fingerprintError) && (
        <View style={[styles.bannerOverlay, { top: insets.top + 8 }]}>
          <Text style={styles.errorText}>
            {txErrorMessage || fingerprintError}
          </Text>
        </View>
      )}

      <LoadingModal visible={claiming} text="Claiming…" />
    </SafeAreaView>
  );
};

export const ClaimRewardSection = React.memo(ClaimRewardSectionComponent);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    position: "relative",
    backgroundColor: "#101119",
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
  section: { marginBottom: 10, paddingHorizontal: 8 },
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
    fontSize: 18,
    color: "#e7e7e7",
    textAlign: "center",
    marginTop: 8,
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
  linkSlot: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  validationSlot: {
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  errorText: {
    color: "#f87171",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Xerxes",
  },
  errorInline: {
    color: "#f87171",
    textAlign: "center",
    fontFamily: "Xerxes",
  },
  bottomAction: {
    marginBottom: 16,
    alignSelf: "center",
    width: 220,
  },
  backAction: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: 220,
    // marginBottom: 8,
  },
  bannerOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    alignItems: "center",
    pointerEvents: "none",
  },
  voyagerLink: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  voyagerLinkText: {
    color: "#fff7ff",
    textDecorationLine: "underline",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Pixels",
  },
});
