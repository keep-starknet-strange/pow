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
import { useEventManager } from "../../stores/useEventManager";
import { useImages } from "../../hooks/useImages";
import NounsBuilder from "../../components/NounsBuilder";
import BasicButton from "../../components/buttons/Basic";
import AvatarCreator from "./AvatarCreator";
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
  const version = process.env.EXPO_APP_VERSION || "0.0.1";
  const { notify } = useEventManager();
  const {
    isUsernameUnique,
    isUsernameValid,
    usernameValidationError,
    initializeAccount,
  } = useFocEngine();
  const { getImage } = useImages();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

  const [usernameError, setUsernameError] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [isGeneratingUsername, setIsGeneratingUsername] = React.useState<boolean>(false);
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
      const response = await fetch('https://random-word-api.herokuapp.com/word?number=2');
      const words = await response.json();
      
      if (words && Array.isArray(words) && words.length >= 2) {
        // Clean words: remove non-alphanumeric characters and capitalize first letter
        const cleanWord1 = words[0].replace(/[^a-zA-Z0-9]/g, '');
        const cleanWord2 = words[1].replace(/[^a-zA-Z0-9]/g, '');
        
        // Capitalize first letter of each word
        const word1 = cleanWord1.charAt(0).toUpperCase() + cleanWord1.slice(1).toLowerCase();
        const word2 = cleanWord2.charAt(0).toUpperCase() + cleanWord2.slice(1).toLowerCase();
        
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
            combinedUsername = word1.substring(0, halfLength) + word2.substring(0, 31 - halfLength);
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
      console.error('Error generating random username:', error);
      // Fallback username if API fails
      setUsername("RandomUser" + Math.floor(Math.random() * 1000));
      notify("BasicError");
    } finally {
      setIsGeneratingUsername(false);
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
                  className="bg-[#10111910] border-2 border-[#101119] p-3 rounded-sm shadow-lg shadow-black/50"
                  style={{ opacity: isGeneratingUsername ? 0.6 : 1 }}
                >
                  <Canvas style={{ width: 24, height: 24 }}>
                    <SkiaImg
                      image={getImage("iconRandom")}
                      x={0}
                      y={0}
                      width={24}
                      height={24}
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
          label="Save"
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
            await initializeAccount(username, [
              `0x` + avatar.head.toString(16),
              `0x` + avatar.body.toString(16),
              `0x` + avatar.glasses.toString(16),
              `0x` + avatar.accessories.toString(16),
            ]);
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
