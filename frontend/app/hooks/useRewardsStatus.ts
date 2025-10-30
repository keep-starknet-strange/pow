import { useEffect, useState } from "react";
import { usePowContractConnector } from "../context/PowContractConnector";
import { useStarknetConnector } from "../context/StarknetConnector";
import { useUpgradesStore } from "../stores/useUpgradesStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useVisitorId } from "./useVisitorId";

export function useRewardsStatus() {
  const [isRewardAvailable, setIsRewardAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    getAreRewardsPaused,
    getRewardParams,
    getHasClaimedReward,
    hasClaimedUserReward,
  } = usePowContractConnector();
  const { account } = useStarknetConnector();
  const { currentPrestige } = useUpgradesStore();
  const { visitorId } = useVisitorId();

  useEffect(() => {
    const checkRewardStatus = async () => {
      try {
        // Check if already claimed via AsyncStorage
        const claimedTxHash = await AsyncStorage.getItem("rewardClaimedTxHash");
        if (claimedTxHash) {
          setIsRewardAvailable(false);
          setIsLoading(false);
          return;
        }

        // Check if rewards are paused
        const paused = await getAreRewardsPaused();
        if (paused) {
          setIsRewardAvailable(false);
          setIsLoading(false);
          return;
        }

        // Check if user has claimed via account address
        if (account?.address) {
          const accountClaimed = await getHasClaimedReward();
          if (accountClaimed) {
            setIsRewardAvailable(false);
            setIsLoading(false);
            return;
          }
        }

        // Check if user has claimed via visitor ID (fingerprint)
        if (visitorId && visitorId !== "0x0") {
          const visitorClaimed = await hasClaimedUserReward(visitorId);
          if (visitorClaimed) {
            setIsRewardAvailable(false);
            setIsLoading(false);
            return;
          }
        }

        // Check prestige threshold
        const params = await getRewardParams();
        const threshold = params?.rewardPrestigeThreshold || 1;

        setIsRewardAvailable(currentPrestige >= threshold);
      } catch (error) {
        console.error("Error checking reward status:", error);
        setIsRewardAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRewardStatus();
  }, [
    currentPrestige,
    getAreRewardsPaused,
    getRewardParams,
    getHasClaimedReward,
    hasClaimedUserReward,
    account,
    visitorId,
  ]);

  return { isRewardAvailable, isLoading };
}
