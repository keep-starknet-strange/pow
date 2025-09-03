import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Share } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useFocEngine } from "../../context/FocEngineConnector";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { PFPView } from "../../components/PFPView";
import { useImages } from "../../hooks/useImages";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useCachedWindowDimensions } from "../../hooks/useCachedDimensions";

const getPrestigeIcon = (prestige: number) => {
  if (prestige === 0) {
    return `shop.lock`;
  }
  return `prestige.${prestige}`;
};

export const AccountSection: React.FC = () => {
  const { account, getPrivateKey, getAvailableKeys, generateAccountAddress } =
    useStarknetConnector();
  const { user, getAccount } = useFocEngine();
  const { currentPrestige } = useUpgrades();
  const { getImage } = useImages();
  const { width } = useCachedWindowDimensions();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [nounsAttributes, setNounsAttributes] = useState<any>(null);
  const [availableAccount, setAvailableAccount] = useState<string | null>(null);
  const [availableUser, setAvailableUser] = useState<any>(null);

  const loadAccountData = async () => {
    // Check for available accounts first
    const keys = await getAvailableKeys("pow_game");
    if (keys.length > 0) {
      // Get the first available key
      const keyToUse = account?.address
        ? `pow_game_${account.address}`
        : keys[0];
      const pk = await getPrivateKey(keyToUse);
      setPrivateKey(pk);

      // If we have a private key but no connected account, generate the address
      if (pk && !account?.address) {
        const address = generateAccountAddress(pk);
        setAvailableAccount(address);

        // Try to fetch user data for this address
        try {
          const userData = await getAccount(address);
          if (userData) {
            setAvailableUser(userData);
          }
        } catch (error) {
          console.log("Could not fetch user data for available account");
        }
      }
    } else if (account?.address) {
      // If no stored keys but we have a connected account, try to get its key
      const key = await getPrivateKey(`pow_game_${account.address}`);
      setPrivateKey(key);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, [account]);

  const shareOrCopy = async (text: string, label: string) => {
    try {
      await Share.share({
        message: text,
        title: label,
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Animated.View className="flex-1" entering={FadeInUp}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Centered Account Header */}
        <Text className="text-[#101119] text-[40px] font-Xerxes text-center">
          Account
        </Text>

        {/* User Info Section */}
        <View className="mt-2 items-center">
          {/* PFP View with Background */}
          <View className="w-[140px] aspect-square mb-[10px] relative bg-[#10111910] shadow-lg shadow-black/50">
            {/* Grid Background */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <Canvas style={{ width: 140, height: 140 }}>
                <Image
                  image={getImage("block.grid.min")}
                  fit="fill"
                  x={0}
                  y={0}
                  width={140}
                  height={140}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                />
              </Canvas>
            </View>
            {/* PFP View */}
            <View
              style={{
                position: "absolute",
                width: "90%",
                height: "90%",
                top: "5%",
                left: "5%",
              }}
            >
              <PFPView attributes={nounsAttributes} />
            </View>
          </View>

          {/* Username and Prestige in same row */}
          <View className="flex-row items-center justify-center gap-[10px]">
            <Text className="text-[#101119] text-[24px] font-Xerxes text-center">
              {user?.account?.username ||
                availableUser?.account?.username ||
                "Anonymous"}
            </Text>
            <View className="w-[36px] aspect-square">
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <Image
                  image={getImage(getPrestigeIcon(currentPrestige))}
                  fit="contain"
                  x={0}
                  y={0}
                  width={32}
                  height={32}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                />
              </Canvas>
            </View>
          </View>
          {!user && availableUser && (
            <Text className="text-[#101119]/60 text-[12px] font-Pixels text-center mt-1">
              (not connected)
            </Text>
          )}
        </View>

        {/* Starknet Account Section with Window Background */}
        <View className="mt-8 relative">
          {/* Window Background */}
          <View className="absolute inset-0">
            <Canvas style={{ width: width - 64, height: 250 }}>
              <Image
                image={getImage("tutorial.window")}
                fit="fill"
                x={0}
                y={0}
                width={width - 64}
                height={250}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Canvas>
          </View>

          {/* Account Content */}
          <View className="p-6 relative z-10">
            {/* Account Address */}
            <View className="mb-4">
              <Text className="text-white text-[18px] font-Pixels mb-1">
                Starknet Address:
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const addressToShare = account?.address || availableAccount;
                  if (addressToShare) {
                    shareOrCopy(addressToShare, "Account address");
                  }
                }}
                className="flex-row items-center justify-between p-3 rounded-lg"
              >
                <Text className="text-white text-[16px] font-Pixels">
                  {account?.address ? (
                    formatAddress(account.address)
                  ) : availableAccount ? (
                    <>
                      {formatAddress(availableAccount)}
                      <Text className="text-white text-[12px]">
                        {" "}
                        (not connected)
                      </Text>
                    </>
                  ) : (
                    "No account found"
                  )}
                </Text>
                {(account?.address || availableAccount) && (
                  <Ionicons name="share-outline" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Private Key */}
            <View>
              <Text className="text-white text-[18px] font-Pixels mb-1">
                Private Key:
              </Text>
              <View className="p-3 rounded-lg">
                {showPrivateKey ? (
                  <TouchableOpacity
                    onPress={() =>
                      privateKey && shareOrCopy(privateKey, "Private key")
                    }
                    className="flex-row items-center justify-between"
                  >
                    <Text className="text-white text-[14px] font-Pixels flex-1">
                      {privateKey ? formatAddress(privateKey) : "Not available"}
                    </Text>
                    {privateKey && (
                      <Ionicons name="share-outline" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text className="text-white text-[16px] font-Pixels">
                    ••••••••••••
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => setShowPrivateKey(!showPrivateKey)}
                  className="flex-row items-center justify-center p-2 rounded"
                >
                  <Ionicons
                    name={showPrivateKey ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="white"
                  />
                  <Text className="text-white text-[14px] font-Pixels ml-2">
                    {showPrivateKey ? "Hide" : "View"}
                  </Text>
                </TouchableOpacity>
                <Text className="text-[#fff7f7] text-[12px] font-Pixels mt-2 text-center">
                  ⚠️ Save your private key to restore your account later.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default AccountSection;
