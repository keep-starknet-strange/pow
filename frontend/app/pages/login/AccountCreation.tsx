import React, { memo } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocEngine } from "../../context/FocEngineConnector";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { usePowContractConnector } from "../../context/PowContractConnector";
import { useEventManager } from "../../stores/useEventManager";
import { useImages } from "../../hooks/useImages";
import NounsBuilder from "../../components/NounsBuilder";
import BasicButton from "../../components/buttons/Basic";
import AvatarCreator from "./AvatarCreator";
import Constants from "expo-constants";
import { getRandomNounsAttributes, NounsAttributes } from "../../configs/nouns";
import { generateRandomUsername } from "../../utils/usernameGenerator";
import { useVisitorId } from "../../hooks/useVisitorId";
import {
  Canvas,
  FilterMode,
  Image as SkiaImg,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Marquee } from "@animatereactnative/marquee";

type AccountCreationProps = {
  setLoginPage: (page: string) => void;
};

export const AccountCreationPage: React.FC<AccountCreationProps> = ({
  setLoginPage,
}) => {
  const version = Constants.expoConfig?.version || "0.0.1";
  const { notify } = useEventManager();
  const {
    isUsernameUnique,
    isUsernameValid,
    usernameValidationError,
    initializeAccount,
    accountsContractAddress,
    mintFunds,
  } = useFocEngine();
  const {
    generatePrivateKey,
    generateAccountAddress,
    deployAccount,
    network,
    getAvailableKeys,
    storeKeyAndConnect,
  } = useStarknetConnector();
  const { setUserToAddress, hasClaimedUserReward } = usePowContractConnector();
  const { visitorId, isLoading: fingerprintLoading, error: fingerprintHookError, rawVisitorData: visitorData } = useVisitorId();

  const { getImage } = useImages();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const [avatarContainerSize, setAvatarContainerSize] = React.useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const [usernameError, setUsernameError] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [isGeneratingUsername, setIsGeneratingUsername] =
    React.useState<boolean>(false);
  const [isSavingAccount, setIsSavingAccount] = React.useState<boolean>(false);
  const [avatar, setAvatar] = React.useState<NounsAttributes>(
    getRandomNounsAttributes(),
  );
  const [newAvatar, setNewAvatar] = React.useState<NounsAttributes>(avatar);
  const [creatingAvatar, setCreatingAvatar] = React.useState<boolean>(false);

  // Extract fingerprint integration logic into separate function
  const handleFingerprintIntegration = async () => {
    try {
      // visitorId is already in felt252 format from the hook
      console.log('Using visitor ID:', visitorId);
      
      // Set user to address mapping
      await setUserToAddress(visitorId);
      console.log('Successfully set user to address mapping');
      
      // Check if this fingerprint has already claimed reward (skip check if visitorId is 0x0)
      if (visitorId !== "0x0") {
        const hasClaimed = await hasClaimedUserReward(visitorId);
        console.log('Has claimed user reward:', hasClaimed);
        if (hasClaimed) {
          // Store in AsyncStorage that this fingerprint has claimed reward
          await AsyncStorage.setItem("fingerprintRewardClaimed", "true");
          console.log('Stored fingerprint reward claimed flag');
        }
      }
    } catch (fingerprintError) {
      console.error("Error handling fingerprint data:", fingerprintError);
      // Don't fail account creation if fingerprint fails
    }
  };

  const startCreatingAvatar = () => {
    setCreatingAvatar(true);
    setNewAvatar(avatar);
    notify("BasicClick");
  };

  const applyAvatarCreation = () => {
    setCreatingAvatar(false);
    setAvatar(newAvatar);
    notify("BasicClick");
  };

  const handleGenerateRandomUsername = async () => {
    setIsGeneratingUsername(true);
    try {
      const combinedUsername = generateRandomUsername();
      setUsername(combinedUsername);
      setUsernameError(""); // Clear any previous errors
      notify("DiceRoll");
    } catch (error) {
      console.error("Error generating random username:", error);
      // Fallback username if generation fails
      setUsername("RandomUser" + Math.floor(Math.random() * 1000));
      notify("BasicError");
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const createAccountAndClaimUsername = async () => {
    setIsSavingAccount(true);
    try {
      // First check if we already have an account connected
      const keys = await getAvailableKeys("pow_game");
      if (keys.length > 0) {
        // Account exists, just claim username
        await initializeAccount(username, [
          `0x` + avatar.head.toString(16),
          `0x` + avatar.body.toString(16),
          `0x` + avatar.glasses.toString(16),
          `0x` + avatar.accessories.toString(16),
        ]);
        // No need to navigate, user will see the account creation process complete
        return;
      }

      // No account exists, create new one using the claim_username logic
      if (!accountsContractAddress) {
        throw new Error("Accounts contract address is not set");
      }

      const privateKey = generatePrivateKey();
      if (network === "SN_DEVNET") {
        const accountAddress = generateAccountAddress(privateKey, "devnet");
        await mintFunds(accountAddress, 10n ** 20n); // Mint 1000 ETH
        await deployAccount(privateKey, "devnet");
        await storeKeyAndConnect(privateKey, "pow_game", "devnet");
        // After account is deployed, claim username
        await initializeAccount(username, [
          `0x` + avatar.head.toString(16),
          `0x` + avatar.body.toString(16),
          `0x` + avatar.glasses.toString(16),
          `0x` + avatar.accessories.toString(16),
        ]);
      } else {
        // This will deploy the account and claim username in one transaction with retries
        await initializeAccount(
          username,
          [
            `0x` + avatar.head.toString(16),
            `0x` + avatar.body.toString(16),
            `0x` + avatar.glasses.toString(16),
            `0x` + avatar.accessories.toString(16),
          ],
          undefined,
          privateKey,
          3,
        );
      }

      // Handle fingerprint integration after account creation
      if (fingerprintLoading) {
        // Set a timeout to retry fingerprint integration after a delay
        setTimeout(async () => {
          if (visitorId && visitorId !== "0x0") {
            await handleFingerprintIntegration();
          } else {
            if (__DEV__) {
              console.log('Fingerprint data still not available after timeout');
            }
          }
        }, 3000); // Wait 3 seconds and retry
      } else if (visitorId && visitorId !== "0x0") {
        await handleFingerprintIntegration();
      } else {
        if (__DEV__) {
          console.log('No visitor ID available for fingerprint integration');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error creating account and claiming username:", error);
      }
      setUsernameError("Failed to create account. Please try again.");
      notify("BasicError");
    } finally {
      setIsSavingAccount(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <AccountCreationHeader width={width} topInset={insets.top} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{
            flex: 0.7,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setAvatarContainerSize({ width, height });
            }}
          >
            <AvatarCreator
              containerSize={avatarContainerSize}
              avatar={avatar}
              setAvatar={setAvatar}
              newAvatar={newAvatar}
              setNewAvatar={setNewAvatar}
              startCreatingAvatar={startCreatingAvatar}
              creatingAvatar={creatingAvatar}
            />
          </View>

          <Animated.View
            entering={FadeInDown}
            className="flex flex-col items-start w-screen px-8 my-2"
          >
            <Text className="text-[#101119] text-lg font-Pixels">
              Set up a username
            </Text>
            <View className="flex-row items-center w-full mt-1 gap-2">
              <TextInput
                className="bg-[#10111910] flex-1 px-2
                            pt-1 text-[32px] text-[#101119] border-2 border-[#101119]
                            shadow-lg shadow-black/50 font-Teatime"
                selectionColor="#101119"
                placeholder="Satoshi"
                placeholderTextColor="#10111980"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                value={username}
                onChangeText={setUsername}
              />
              <Pressable
                onPress={handleGenerateRandomUsername}
                disabled={isGeneratingUsername || isSavingAccount}
                className="shadow-lg shadow-black/50"
              >
                <Canvas style={{ width: 40, height: 40 }}>
                  <SkiaImg
                    image={getImage("icon.random")}
                    x={0}
                    y={0}
                    width={40}
                    height={40}
                    fit="contain"
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.Nearest,
                    }}
                  />
                </Canvas>
              </Pressable>
            </View>
            <Text className="text-[#101119a0] text-md mt-2 font-Pixels">
              Please notice: your username will be public
            </Text>
            {fingerprintLoading && (
              <Text className="text-[#10111980] text-sm mt-1 font-Pixels">
                Loading device fingerprint...
              </Text>
            )}
            {!fingerprintLoading && !visitorData && !fingerprintHookError && (
              <Text className="text-[#10111980] text-sm mt-1 font-Pixels">
                Fingerprint not loaded. Try refreshing the page.
              </Text>
            )}
            {usernameError ? (
              <Text className="text-red-500 text-md mt-2 font-Pixels">
                {usernameError}
              </Text>
            ) : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <Animated.View
        style={{
          flex: 0.3,
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
        entering={FadeInDown}
      >
        <BasicButton
          label={
            isSavingAccount 
              ? "Saving..." 
              : fingerprintLoading 
                ? "Loading fingerprint..." 
                : "Save"
          }
          disabled={isSavingAccount || fingerprintLoading}
          onPress={async () => {
            if (!isUsernameValid(username)) {
              setUsernameError(`Invalid username:\n${usernameValidationError}`);
              notify("BasicError");
              return;
            }
            if (!(await isUsernameUnique(username))) {
              setUsernameError("This username is unavailable.");
              notify("BasicError");
              return;
            }
            await createAccountAndClaimUsername();
          }}
        />
        <BasicButton
          label="Cancel"
          disabled={isSavingAccount}
          onPress={async () => {
            setLoginPage("login");
          }}
        />
      </Animated.View>

      <View
        style={{
          alignSelf: "flex-end",
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
        className="w-full px-8 bg-[#10111A]"
      >
        <Animated.View
          entering={FadeInDown}
          className="flex flex-row items-center justify-between w-full"
        >
          <Text className="text-[#fff7ff] font-Pixels text-[16px]">
            version {version}
          </Text>
          <Text className="text-[#fff7ff] font-Pixels text-[16px]">
            We're open source!
          </Text>
        </Animated.View>
      </View>

      {creatingAvatar && (
        <NounsBuilder
          avatar={avatar}
          setCreatingAvatar={setCreatingAvatar}
          applyAvatarCreation={applyAvatarCreation}
          newAvatar={newAvatar}
          setNewAvatar={setNewAvatar}
        />
      )}
    </View>
  );
};

const AccountCreationHeader: React.FC<{ width: number; topInset: number }> =
  memo(({ width, topInset }) => {
    const { getImage } = useImages();
    return (
      <View
        className="relative top-0 left-0 w-full"
        style={{ height: 50 + topInset, width: width }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <SkiaImg
            image={getImage("bar.top")}
            fit="fill"
            x={0}
            y={0}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            width={width}
            height={50 + topInset}
          />
        </Canvas>
        <View
          className="absolute top-0 left-0 w-full"
          style={{ paddingTop: topInset }}
        >
          <Marquee spacing={0} speed={1}>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-[#fff7ff] font-Teatime text-[40px]">
                CREATE YOUR ACCOUNT
              </Text>
              <View className="w-2 aspect-square bg-[#fff7ff] mx-4" />
            </View>
          </Marquee>
        </View>
      </View>
    );
  });

export default AccountCreationPage;
