import React, { memo, useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  TextInput,
  Pressable,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import BasicButton from "../../components/buttons/Basic";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useFocEngine } from "../../context/FocEngineConnector";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { PFPView } from "../../components/PFPView";
import { useImages } from "../../hooks/useImages";
import prestigeConfig from "../../configs/prestige.json";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useEventManager } from "../../stores/useEventManager";
import { useCachedWindowDimensions } from "../../hooks/useCachedDimensions";
import { useTutorialStore } from "../../stores/useTutorialStore";
import {
  getRandomNounsAttributes,
  createNounsAttributes,
} from "../../configs/nouns";

const getPrestigeIcon = (prestige: number) => {
  if (prestige === 0) {
    return `shop.lock`;
  }
  return `prestige.${prestige}`;
};

const getPrestigeColor = (prestige: number) => {
  const config = prestigeConfig.find((p) => p.id === prestige);
  return config?.color || "#FF0000";
};

const isValidPrivateKey = (key: string): boolean => {
  // Remove 0x prefix if present
  const cleanKey = key.startsWith("0x") ? key.slice(2) : key;
  // Check if it's a valid hex string of 64 characters (32 bytes)
  return /^[0-9a-fA-F]{63}$/.test(cleanKey);
};

export const AccountSection: React.FC = memo(() => {
  const {
    account,
    getPrivateKey,
    getAvailableKeys,
    generateAccountAddress,
    storeKeyAndConnect,
  } = useStarknetConnector();
  const { user, getAccount, getAccounts } = useFocEngine();
  const { currentPrestige } = useUpgrades();
  const { getImage } = useImages();
  const { width } = useCachedWindowDimensions();
  const { notify } = useEventManager();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [availableAccount, setAvailableAccount] = useState<string | null>(null);
  const [availableUser, setAvailableUser] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restorePrivateKey, setRestorePrivateKey] = useState("");
  const [restoreError, setRestoreError] = useState("");

  const nounsAttributes = useMemo(() => {
    // First try to get from connected user
    if (user?.account?.metadata && user.account.metadata.length === 4) {
      return createNounsAttributes(
        parseInt(user.account.metadata[0], 16),
        parseInt(user.account.metadata[1], 16),
        parseInt(user.account.metadata[2], 16),
        parseInt(user.account.metadata[3], 16),
      );
    }
    // Then try available user if not connected (check both possible data structures)
    if (
      availableUser?.account?.metadata &&
      availableUser.account.metadata.length === 4
    ) {
      return createNounsAttributes(
        parseInt(availableUser.account.metadata[0], 16),
        parseInt(availableUser.account.metadata[1], 16),
        parseInt(availableUser.account.metadata[2], 16),
        parseInt(availableUser.account.metadata[3], 16),
      );
    }
    // Fall back to random attributes based on account address
    const addressToUse =
      user?.account_address ||
      availableUser?.account_address ||
      account?.address ||
      availableAccount;
    return getRandomNounsAttributes(addressToUse);
  }, [
    user?.account?.metadata,
    availableUser?.account?.metadata,
    user?.account_address,
    availableUser?.account_address,
    account?.address,
    availableAccount,
  ]);

  const loadAccountData = async () => {
    // Check for available accounts first
    const keys = await getAvailableKeys("pow_game");
    if (keys.length > 0) {
      // Find the key that matches the connected account if available
      let keyToUse = keys[0]; // Default to first available key

      if (account?.address) {
        // Find the key that contains the connected account address
        const matchingKey = keys.find((key) =>
          key.toLowerCase().includes(account.address.toLowerCase()),
        );
        if (matchingKey) {
          keyToUse = matchingKey;
        }
      }

      const pk = await getPrivateKey(keyToUse);
      setPrivateKey(pk);

      // If we have a private key but no connected account, generate the address
      if (pk && !account?.address) {
        const address = generateAccountAddress(pk);
        setAvailableAccount(address);

        // Try to fetch user data for this address using getAccounts (like in Leaderboard)
        try {
          const accounts = await getAccounts([address], undefined, true);
          if (accounts && accounts.length > 0) {
            setAvailableUser(accounts[0]);
          } else {
            // Fallback to getAccount if getAccounts doesn't return data
            const userData = await getAccount(address);
            if (userData) {
              setAvailableUser(userData);
            }
          }
        } catch (error) {
          console.log("Could not fetch user data for available account");
        }
      }
    } else if (account?.address) {
      // If no stored keys but we have a connected account, try to find any matching key
      // This handles edge cases where keys list might not be properly loaded
      const allKeys = await getAvailableKeys("pow_game");
      const matchingKey = allKeys.find((key) =>
        key.toLowerCase().includes(account.address.toLowerCase()),
      );
      if (matchingKey) {
        const pk = await getPrivateKey(matchingKey);
        setPrivateKey(pk);
      }
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

  const handleRestoreAccount = async () => {
    if (!restorePrivateKey.trim()) {
      setRestoreError("Please enter a private key");
      return;
    }

    const cleanKey = restorePrivateKey.startsWith("0x")
      ? restorePrivateKey
      : `0x${restorePrivateKey}`;

    if (!isValidPrivateKey(cleanKey)) {
      setRestoreError("Invalid private key format. Must be 64 hex characters.");
      return;
    }

    try {
      setRestoreError("");
      await storeKeyAndConnect(cleanKey, "pow_game");
      setIsRestoring(false);
      setRestorePrivateKey("");
      // Mark tutorial as complete since restoring old account
      const { completeTutorial } = useTutorialStore.getState();
      completeTutorial();
      // Reload account data to show the restored account
      await loadAccountData();
    } catch (error) {
      console.error("Error restoring account:", error);
      setRestoreError(
        "Failed to restore account. Please check your private key.",
      );
    }
  };

  const cancelRestore = () => {
    setIsRestoring(false);
    setRestorePrivateKey("");
    setRestoreError("");
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
              {currentPrestige > 0 && (
                <View
                  className="absolute inset-[-4px] rounded-lg"
                  style={{
                    borderColor: getPrestigeColor(currentPrestige) + "80",
                    borderWidth: 4,
                    shadowColor: getPrestigeColor(currentPrestige),
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                />
              )}
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
            <View className="w-[40px] aspect-square relative flex">
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <Image
                  image={getImage(getPrestigeIcon(currentPrestige))}
                  fit="contain"
                  x={4}
                  y={4}
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
            {isRestoring ? (
              /* Restore Mode */
              <View>
                <Text className="text-white text-[18px] font-Pixels mb-3">
                  Restore Account
                </Text>
                <Text className="text-white text-[14px] font-Pixels mb-2">
                  Enter your private key:
                </Text>
                <TextInput
                  className="bg-[#ffffff20] text-white text-[14px] font-Pixels p-2 rounded border border-white/30 mb-2"
                  placeholder="Private key (0x...)"
                  placeholderTextColor="#ffffff60"
                  value={restorePrivateKey}
                  onChangeText={setRestorePrivateKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                  numberOfLines={3}
                  secureTextEntry
                />
                {restoreError ? (
                  <Text className="text-red-400 text-[12px] font-Pixels mb-2">
                    {restoreError}
                  </Text>
                ) : null}
                <View className="flex-row gap-3 justify-center mt-4">
                  {/* Restore Button */}
                  <Pressable
                    onPress={() => {
                      notify("BasicClick");
                      handleRestoreAccount();
                    }}
                    className="relative"
                    style={{ width: 110, height: 40 }}
                  >
                    <Canvas style={{ flex: 1, width: 110, height: 40 }}>
                      <Image
                        image={getImage("staking.button")}
                        fit="fill"
                        x={0}
                        y={0}
                        width={110}
                        height={40}
                        sampling={{
                          filter: FilterMode.Nearest,
                          mipmap: MipmapMode.Nearest,
                        }}
                      />
                    </Canvas>
                    <Text
                      className="absolute inset-0 text-white font-Teatime text-[24px] text-center"
                      style={{ lineHeight: 40 }}
                    >
                      Restore
                    </Text>
                  </Pressable>

                  {/* Cancel Button */}
                  <Pressable
                    onPress={() => {
                      notify("BasicClick");
                      cancelRestore();
                    }}
                    className="relative"
                    style={{ width: 110, height: 40 }}
                  >
                    <Canvas style={{ flex: 1, width: 110, height: 40 }}>
                      <Image
                        image={getImage("staking.button")}
                        fit="fill"
                        x={0}
                        y={0}
                        width={110}
                        height={40}
                        sampling={{
                          filter: FilterMode.Nearest,
                          mipmap: MipmapMode.Nearest,
                        }}
                      />
                    </Canvas>
                    <Text
                      className="absolute inset-0 text-white font-Teatime text-[24px] text-center"
                      style={{ lineHeight: 40 }}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                </View>
                <Text className="text-[#fff7f7] text-[12px] font-Pixels mt-4 text-center">
                  Using the power of Starknet, you can securely restore your
                  accounts state. Your account is truly yours. Forever.
                </Text>
              </View>
            ) : (
              /* Normal Mode */
              <>
                {/* Account Address */}
                <View className="mb-4">
                  <Text className="text-white text-[18px] font-Pixels mb-1">
                    Starknet Address:
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const addressToShare =
                        account?.address || availableAccount;
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
                          {privateKey
                            ? formatAddress(privateKey)
                            : "Not available"}
                        </Text>
                        {privateKey && (
                          <Ionicons
                            name="share-outline"
                            size={20}
                            color="white"
                          />
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
                        name={
                          showPrivateKey ? "eye-off-outline" : "eye-outline"
                        }
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
              </>
            )}
          </View>
        </View>

        {/* Restore Button - only show when no account is found and not currently restoring */}
        {!account?.address && !availableAccount && !isRestoring && (
          <View className="mt-6 items-center">
            <BasicButton label="Restore" onPress={() => setIsRestoring(true)} />
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
});

export default AccountSection;
