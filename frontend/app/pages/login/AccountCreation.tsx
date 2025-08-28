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
import { useFocEngine } from "../../context/FocEngineConnector";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useEventManager } from "../../stores/useEventManager";
import { useImages } from "../../hooks/useImages";
import NounsBuilder from "../../components/NounsBuilder";
import BasicButton from "../../components/buttons/Basic";
import AvatarCreator from "./AvatarCreator";
import Constants from "expo-constants";
import { getRandomNounsAttributes, NounsAttributes } from "../../configs/nouns";
import {
  Canvas,
  FilterMode,
  Image as SkiaImg,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
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
    claimUsername,
    accountsContractAddress,
    user,
    mintFunds,
  } = useFocEngine();
  const {
    generatePrivateKey,
    generateAccountAddress,
    deployAccount,
    invokeWithPaymaster,
    network,
    getAvailableKeys,
    storeKeyAndConnect,
  } = useStarknetConnector();
  const { getImage } = useImages();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

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

  // Generate random username using Random Word API
  const generateRandomUsername = async () => {
    setIsGeneratingUsername(true);
    try {
      // Fetch 2 random words from the API
      const response = await fetch(
        "https://random-word-api.herokuapp.com/word?number=2",
      );
      const words = await response.json();

      if (words && Array.isArray(words) && words.length >= 2) {
        // Clean words: remove non-alphanumeric characters and capitalize first letter
        const cleanWord1 = words[0].replace(/[^a-zA-Z0-9]/g, "");
        const cleanWord2 = words[1].replace(/[^a-zA-Z0-9]/g, "");

        // Capitalize first letter of each word
        const word1 =
          cleanWord1.charAt(0).toUpperCase() +
          cleanWord1.slice(1).toLowerCase();
        const word2 =
          cleanWord2.charAt(0).toUpperCase() +
          cleanWord2.slice(1).toLowerCase();

        let combinedUsername = word1 + word2;

        // Ensure max 31 characters
        if (combinedUsername.length > 31) {
          // Try to trim the second word first
          const maxSecondWordLength = 31 - word1.length;
          if (maxSecondWordLength > 3) {
            combinedUsername = word1 + word2.substring(0, maxSecondWordLength);
          } else {
            // If still too long, trim both words proportionally
            const halfLength = Math.floor(31 / 2);
            combinedUsername =
              word1.substring(0, halfLength) +
              word2.substring(0, 31 - halfLength);
          }
        }

        setUsername(combinedUsername);
        setUsernameError(""); // Clear any previous errors
        notify("DiceRoll");
      } else {
        // Fallback if API fails
        setUsername("RandomUser" + Math.floor(Math.random() * 1000));
        notify("BasicError");
      }
    } catch (error) {
      console.error("Error generating random username:", error);
      // Fallback username if API fails
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
        await claimUsername(username);
        // No need to navigate, user will see the account creation process complete
        return;
      }

      // No account exists, create new one using the claim_username logic
      if (!accountsContractAddress) {
        throw new Error("Accounts contract address is not set");
      }

      const privateKey = generatePrivateKey();
      console.log("Creating game account with username claim...");

      if (network === "SN_DEVNET") {
        const accountAddress = generateAccountAddress(privateKey, "devnet");
        await mintFunds(accountAddress, 10n ** 20n); // Mint 1000 ETH
        await deployAccount(privateKey, "devnet");
        await storeKeyAndConnect(privateKey, "pow_game", "devnet");
        // After account is deployed, claim username
        await claimUsername(username);
      } else {
        // For mainnet/sepolia, use paymaster with claim_username call
        const usernameHex = `0x${Array.from(username)
          .map((char) => char.charCodeAt(0).toString(16))
          .join("")}`;

        const claimUsernameCall = {
          contractAddress: accountsContractAddress,
          entrypoint: "claim_username",
          calldata: [usernameHex],
        };

        // This will deploy the account and claim username in one transaction
        await invokeWithPaymaster([claimUsernameCall], privateKey);
        await storeKeyAndConnect(privateKey, "pow_game");
      }

      console.log("Account created and username claimed successfully");
    } catch (error) {
      console.error("Error creating account and claiming username:", error);
      setUsernameError("Failed to create account. Please try again.");
      notify("BasicError");
    } finally {
      setIsSavingAccount(false);
    }
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 items-center justify-around relative"
    >
      <View
        className="absolute top-0 left-0 w-full bg-[#10111A]"
        style={{ height: 60, width: width }}
      />
      <AccountCreationHeader width={width} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={insets.top} // tweak this as needed based on header height
        >
          <AvatarCreator
            avatar={avatar}
            setAvatar={setAvatar}
            newAvatar={newAvatar}
            setNewAvatar={setNewAvatar}
            startCreatingAvatar={startCreatingAvatar}
            creatingAvatar={creatingAvatar}
          />
          <Animated.View
            entering={FadeInDown}
            className="flex flex-col items-center"
          >
            <View className="flex flex-col items-start mt-12 w-screen px-8">
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
                  onPress={generateRandomUsername}
                  disabled={isGeneratingUsername}
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
              {usernameError ? (
                <Text className="text-red-500 text-md mt-2 font-Pixels">
                  {usernameError}
                </Text>
              ) : null}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <Animated.View
        entering={FadeInDown}
        className="flex-1 items-center justify-center gap-4"
      >
        <BasicButton
          label={isSavingAccount ? "Saving..." : "Save"}
          disabled={isSavingAccount}
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
          onPress={async () => {
            setLoginPage("login");
          }}
        />
      </Animated.View>
      <View className="absolute bottom-0 w-full px-8 py-4 pb-6 bg-[#10111A]">
        {!creatingAvatar && (
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
        )}
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

const AccountCreationHeader: React.FC<{ width: number }> = memo(({ width }) => {
  const { getImage } = useImages();
  return (
    <View
      className="absolute top-[60px] left-0 w-full"
      style={{ height: 50, width: width }}
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
          height={50}
        />
      </Canvas>
      <View className="absolute top-0 left-0 w-full h-full">
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
