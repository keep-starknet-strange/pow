import React from "react";
import {
  Image,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { useFocEngine } from "../../context/FocEngineConnector";
import { useImageProvider } from "../../context/ImageProvider";
import { PFPView } from "../../components/PFPView";
import BasicButton from "../../components/buttons/Basic";
import {
  getNounsHeadsList,
  getNounsBodiesList,
  getNounsAccessoriesList,
  getNounsGlassesList,
  NounsAttributes,
  getRandomNounsAttributes,
} from "../../configs/nouns";
import background from "../../../assets/background.png";
import backgroundGrid from "../../../assets/background-grid.png";
import {
  Canvas,
  Image as SkiaImg,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { getImage } = useImageProvider();
  const insets = useSafeAreaInsets();

  const [usernameError, setUsernameError] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [avatar, setAvatar] = React.useState<NounsAttributes>(
    getRandomNounsAttributes(),
  );
  const [newAvatar, setNewAvatar] = React.useState<NounsAttributes>(avatar);
  const [creatingAvatar, setCreatingAvatar] = React.useState<boolean>(false);
  const avatarTabs = [
    { label: "Heads", value: "head", list: getNounsHeadsList() },
    { label: "Glasses", value: "glasses", list: getNounsGlassesList() },
    { label: "Bodies", value: "body", list: getNounsBodiesList() },
    {
      label: "Accessories",
      value: "accessories",
      list: getNounsAccessoriesList(),
    },
  ];
  const [avatarTab, setAvatarTab] = React.useState<{
    label: string;
    value: string;
    list: any[];
  }>(avatarTabs[0]);
  const startCreatingAvatar = () => {
    setCreatingAvatar(true);
    setNewAvatar(avatar);
  };
  const applyAvatarCreation = () => {
    setCreatingAvatar(false);
    setAvatar(newAvatar);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior="position"
            keyboardVerticalOffset={insets.top} // tweak this as needed based on header height
          >
            <View
              style={{
                alignItems: "center",
              }}
            >
              <Text className="text-[#101119] text-2xl mt-8 font-Pixels">
                Create your account
              </Text>
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
              <View className="flex flex-row items-center justify-center mt-4 gap-2">
                <Text className="text-[#101119] text-xl font-Pixels">
                  Create your Noun Avatar
                </Text>
                <TouchableOpacity
                  className="py-1 border-2 border-[#101119] rounded-md px-2"
                  onPress={() => setAvatar(getRandomNounsAttributes())}
                >
                  <Text className="text-[#101119] text-xl font-Pixels">
                    Roll
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="py-1 border-2 border-[#101119] rounded-md px-2"
                  onPress={() => setCreatingAvatar(!creatingAvatar)}
                >
                  <Text className="text-[#101119] text-xl font-Pixels">
                    edit
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex flex-col items-start mt-8 w-screen px-8">
                <Text className="text-[#101119] text-lg font-Pixels">
                  Set up a username
                </Text>
                {/* // TODO: fix/keyboard-covers-input-fields */}
                <TextInput
                  className="bg-[#10111910] w-full rounded-lg mt-2 px-2
                          py-1 text-xl text-[#101119] border-2 border-[#101119]
                          shadow-lg shadow-black/50 font-Pixels"
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
            </View>
          </KeyboardAvoidingView>
          <View className="flex-1 items-center justify-center gap-4">
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
          </View>

          <View className="flex flex-row items-center justify-between w-full px-10 py-2">
            <Text className="text-[#101119] text-md font-Pixels">
              Version {version}
            </Text>
            <Text className="text-[#101119] text-md font-Pixels">
              We are open source!
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {creatingAvatar && (
        <View
          style={{ paddingBottom: insets.bottom }}
          className="absolute left-0 right-0 bottom-0 bg-[#101119] rounded-t-3xl px-4 py-2 h-[30rem]
                              flex flex-col items-center justify-start gap-1 w-full
                              shadow-lg shadow-black/50"
        >
          <View className="flex flex-row items-center justify-between w-full">
            <Text className="text-white text-xl font-Pixels">
              Nouns Builder!
            </Text>
            <View className="flex flex-row gap-2 items-center">
              <TouchableOpacity
                onPress={() => {
                  setNewAvatar(getRandomNounsAttributes());
                }}
                className="py-1 border-2 border-[#fff7ff] rounded-md px-2"
              >
                <Text className="text-[#fff7ff] text-xl font-Pixels">
                  Random
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setCreatingAvatar(false);
                  setNewAvatar(avatar);
                }}
                className="rounded-full p-2"
              >
                <Text className="text-white text-4xl font-Xerxes">x</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex flex-row gap-2 items-center">
            {avatarTabs.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setAvatarTab(tab)}
                className={`py-2 px-4 rounded-sm ${avatarTab.value === tab.value ? "bg-[#fff7ff25]" : "transparent"}`}
              >
                <Text
                  className={`text-lg font-Pixels ${avatarTab.value === tab.value ? "text-white" : "text-[#fff7ffc0]"}`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView
            className="flex-1 w-full"
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex flex-row flex-wrap gap-1 w-full">
              {avatarTab.list.map((part, index) => (
                <TouchableOpacity
                  key={index}
                  className="h-20 aspect-square relative"
                  onPress={() => {
                    setNewAvatar({
                      ...newAvatar,
                      [avatarTab.value as keyof NounsAttributes]: index,
                    });
                  }}
                >
                  <View className="absolute top-0 left-0 h-20 aspect-square">
                    <Canvas style={{ flex: 1 }} className="w-full h-full">
                      <SkiaImg
                        image={
                          newAvatar[
                            avatarTab.value as keyof NounsAttributes
                          ] === index
                            ? getImage("block.bg.yellow")
                            : getImage("block.bg.purple")
                        }
                        fit="cover"
                        x={0}
                        y={0}
                        sampling={{
                          filter: FilterMode.Nearest,
                          mipmap: MipmapMode.Nearest,
                        }}
                        width={68}
                        height={68}
                      />
                    </Canvas>
                  </View>
                  <Image
                    source={part}
                    className="w-full h-full p-4"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <BasicButton
            label="Apply"
            onPress={applyAvatarCreation}
            style={{
              width: 250,
              marginTop: 5,
              marginBottom: 10,
              borderColor: "#fff7ff",
              color: "#fff7ff",
            }}
            textStyle={{ color: "#fff7ff", fontFamily: "Pixels" }}
          />
        </View>
      )}
    </>
  );
};

export default AccountCreationPage;
