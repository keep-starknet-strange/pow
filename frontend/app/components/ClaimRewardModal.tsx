import React, { memo, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Window } from "./tutorial/Window";
import { useUpgradesStore } from "../stores/useUpgradesStore";
import { useImages } from "../hooks/useImages";

const ClaimRewardModalComponent: React.FC = () => {
  const { currentPrestige, hasShownClaimModal, setHasShownClaimModal } =
    useUpgradesStore();
  const [shouldShow, setShouldShow] = useState(false);
  const { getImage } = useImages();
  const prestigeImage = getImage("tx.icon.lendme");

  useEffect(() => {
    // Show modal when user reaches prestige 1 for the first time
    const checkAndShowModal = async () => {
      if (currentPrestige >= 1 && !hasShownClaimModal) {
        try {
          const rewardClaimedTxHash = await AsyncStorage.getItem(
            "rewardClaimedTxHash",
          );
          if (rewardClaimedTxHash) {
            // User already claimed reward, don't show modal
            setShouldShow(false);
          } else {
            // User hasn't claimed reward yet, show modal
            setShouldShow(true);
          }
          setHasShownClaimModal(true);
        } catch (error) {
          console.error("Error checking rewardClaimedTxHash:", error);
          // If there's an error reading AsyncStorage, show modal as fallback
          setShouldShow(true);
          setHasShownClaimModal(true);
        }
      }
    };

    checkAndShowModal();
  }, [currentPrestige, hasShownClaimModal, setHasShownClaimModal]);

  const { navigate } = useNavigation();
  const handleClaim = () => {
    setShouldShow(false);
    (navigate as any)("Settings", { initialTab: "ClaimReward" });
  };

  const handleLater = () => {
    setShouldShow(false);
  };

  if (!shouldShow) return null;

  return (
    <View className="absolute inset-0 z-[1002]">
      {/* Dark overlay */}
      <View className="absolute inset-0 bg-black/70" pointerEvents="auto" />

      {/* Modal window */}
      <View className="absolute inset-0 items-center justify-center">
        <Window
          style={{
            width: 320,
          }}
        >
          <View className="items-center px-4 py-4">
            <Text className="text-[26px] font-Teatime text-yellow-400 mb-4 text-center">
              Claim your Reward
            </Text>

            {/* Prestige 1 Icon */}
            <View className="w-24 h-24 mb-4">
              <Canvas style={{ width: 96, height: 96 }}>
                {prestigeImage && (
                  <Image
                    image={prestigeImage}
                    x={0}
                    y={0}
                    width={96}
                    height={96}
                    fit="contain"
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.Nearest,
                    }}
                  />
                )}
              </Canvas>
            </View>

            <Text className="text-[14px] font-Pixels text-gray-100 text-center mb-6 px-2 leading-5">
              <Text className="text-yellow-400">Congratulations</Text> for
              reaching Prestige 1. For your valiant efforts, you have earned{" "}
              <Text className="text-purple-400">STRK tokens</Text>! Go to the
              Settings Page to <Text className="text-yellow-400">claim</Text>!
              Dont spend them all in one place ;)
            </Text>

            {/* Bottom Buttons */}
            <View className="flex-row gap-4">
              <Pressable
                onPress={handleLater}
                className="bg-gray-600 px-6 py-2 rounded-lg"
              >
                <Text className="text-white font-Pixels text-[14px]">
                  Later
                </Text>
              </Pressable>

              <Pressable
                onPress={handleClaim}
                className="bg-yellow-500 px-6 py-2 rounded-lg"
              >
                <Text className="text-black font-Pixels text-[14px]">
                  Claim
                </Text>
              </Pressable>
            </View>
          </View>
        </Window>
      </View>
    </View>
  );
};

export const ClaimRewardModal = memo(ClaimRewardModalComponent);
