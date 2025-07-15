import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from "react-native";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useFocEngine } from "../../context/FocEngineConnector";
import { useImages } from "../../hooks/useImages";
import { PFPView } from "../../components/PFPView";
import NounsBuilder from "../../components/NounsBuilder";
import BasicButton from "../../components/buttons/Basic";
import {
  getRandomNounsAttributes,
  NounsAttributes,
} from "../../configs/nouns";
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
  const { account } = useStarknetConnector();
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
  const [avatar, setAvatar] = React.useState<NounsAttributes>(
    getRandomNounsAttributes(),
  );
  const [newAvatar, setNewAvatar] = React.useState<NounsAttributes>(avatar);
  const [creatingAvatar, setCreatingAvatar] = React.useState<boolean>(false);
  const startCreatingAvatar = () => {
    setCreatingAvatar(true);
    setNewAvatar(avatar);
  };
  const applyAvatarCreation = () => {
    setCreatingAvatar(false);
    setAvatar(newAvatar);
  };

  const HEADER_HEIGHT = 60;

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={insets.top} // tweak this as needed based on header height
        >
          <Animated.View
            entering={FadeInUp}
            style={{
              alignItems: "center",
              marginTop: HEADER_HEIGHT,
            }}
          >
            <View className="relative">
              <TouchableOpacity
                className="flex items-center justify-center bg-[#10111910]
                            w-[250px] h-[250px] p-4 mt-8
                            rounded-xl shadow-lg shadow-black/50 relative"
                onPress={startCreatingAvatar}
              >
                <View className="absolute top-0 left-0 w-[250px] h-[250px]">
                  <Canvas style={{ flex: 1 }} className="w-full h-full">
                    <SkiaImg
                      image={getImage("block.grid.min")}
                      fit="fill"
                      x={0}
                      y={0}
                      sampling={{
                        filter: FilterMode.Nearest,
                        mipmap: MipmapMode.Nearest,
                      }}
                      width={246}
                      height={246}
                    />
                  </Canvas>
                </View>
                <PFPView
                  user={account?.address}
                  attributes={creatingAvatar ? newAvatar : avatar}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute top-[85px] right-[-42px]"
                onPress={startCreatingAvatar}
              >
                <Canvas style={{ width: 40, height: 40 }}>
                  <SkiaImg
                    image={getImage("icon.edit")}
                    fit="contain"
                    x={0}
                    y={0}
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.Nearest,
                    }}
                    width={40}
                    height={40}
                  />
                </Canvas>
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute top-[40px] right-[-42px]"
                onPress={() => {
                  const newAvatar = getRandomNounsAttributes();
                  setAvatar(newAvatar);
                  setNewAvatar(newAvatar);
                }}
              >
                <Canvas style={{ width: 40, height: 40 }}>
                  <SkiaImg
                    image={getImage("icon.random")}
                    fit="contain"
                    x={0}
                    y={0}
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.Nearest,
                    }}
                    width={40}
                    height={40}
                  />
                </Canvas>
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center justify-center mt-1 gap-2">
              <Text className="text-[#101119] text-[18px] font-Pixels">
                Create your Noun Avatar
              </Text>
            </View>
          </Animated.View>
          <Animated.View
            entering={FadeInDown}
            className="flex flex-col items-center"
          >
            <View className="flex flex-col items-start mt-12 w-screen px-8">
              <Text className="text-[#101119] text-lg font-Pixels">
                Set up a username
              </Text>
              {/* // TODO: fix/keyboard-covers-input-fields */}
              <TextInput
                className="bg-[#10111910] w-full mt-1 px-2
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
              setUsernameError(
                `Invalid username:\n${usernameValidationError}`,
              );
              return;
            }
            if (!(await isUsernameUnique(username))) {
              setUsernameError("This username is unavailable.");
              return;
            }
            await initializeAccount(username, [
              `0x` + avatar.head.toString(16),
              `0x` + avatar.body.toString(16),
              `0x` + avatar.glasses.toString(16),
              `0x` + avatar.accessories.toString(16),
            ]);
          }}
          style={{ width: 250 }}
        />
        <BasicButton
          label="Cancel"
          onPress={async () => {
            setLoginPage("login");
          }}
          style={{ width: 250 }}
        />
      </Animated.View>
      <View className="absolute bottom-0 w-full px-8 py-4 pb-6 bg-[#10111A]">
        {!creatingAvatar && (
          <Animated.View
            entering={FadeInDown}
            className="flex flex-row items-center justify-between w-full"
          >
            <Text className="text-[#fff7ff] font-Pixels text-[16px]">version {version}</Text>
            <Text className="text-[#fff7ff] font-Pixels text-[16px]">We're open source!</Text>
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

export default AccountCreationPage;
