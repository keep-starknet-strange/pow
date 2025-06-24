import React from 'react';
import { Image, View, ScrollView, Text, TouchableOpacity, ImageBackground, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, } from 'react-native';
import { useStarknetConnector } from '../../context/StarknetConnector';
import { useFocEngine } from '../../context/FocEngineConnector';
import { useImageProvider } from '../../context/ImageProvider';
import { PFPView } from '../../components/PFPView';
import BasicButton from '../../components/buttons/Basic';
import { getNounsHeadsList, getNounsBodiesList,
         getNounsAccessoriesList, getNounsGlassesList,
         NounsAttributes, getRandomNounsAttributes
} from '../../configs/nouns';
import background from '../../../assets/background.png';
import backgroundGrid from '../../../assets/background-grid.png';
import { Canvas, Image as SkiaImg, FilterMode, MipmapMode } from '@shopify/react-native-skia';

type AccountCreationProps = {
  setLoginPage: (page: string) => void;
};

export const AccountCreationPage: React.FC<AccountCreationProps> = ({ setLoginPage }) => {
  const version = process.env.EXPO_APP_VERSION || '0.0.1';
  const { account } = useStarknetConnector();
  const { claimUsername } = useFocEngine();
  const { getImage } = useImageProvider();

  const [username, setUsername] = React.useState<string>('');
  const [avatar, setAvatar] = React.useState<NounsAttributes>(getRandomNounsAttributes());
  const [newAvatar, setNewAvatar] = React.useState<NounsAttributes>(avatar);
  const [creatingAvatar, setCreatingAvatar] = React.useState<boolean>(false);
  const startCreatingAvatar = () => {
    setCreatingAvatar(true);
    setNewAvatar(avatar);
  }
  const applyAvatarCreation = () => {
    setCreatingAvatar(false);
    setAvatar(newAvatar);
  }

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100} // tweak this as needed based on header height
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'space-between' }}
            keyboardShouldPersistTaps="handled"
            >
            <Text className="text-[#101119] text-2xl mt-8 font-Pixels">
              Create your account
            </Text>
            <TouchableOpacity className="flex items-center justify-center bg-[#10111910]
                            w-[250px] h-[250px] p-4 mt-8
                            rounded-xl shadow-lg shadow-black/50 relative"
              onPress={startCreatingAvatar}
            >
              <View className="absolute top-0 left-0 w-[250px] h-[250px]">
                <Canvas style={{ flex: 1 }} className="w-full h-full">
                  <SkiaImg
                    image={getImage('block.grid.min')}
                    fit="fill"
                    x={0}
                    y={0}
                    sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
                    width={246}
                    height={246}
                  />
                </Canvas>
              </View>
              <PFPView user={account?.address} attributes={creatingAvatar ? newAvatar : avatar} />
            </TouchableOpacity>
            <Text className="text-[#101119] text-xl mt-4 font-Pixels">
              Create your avatar
            </Text>
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
            </View>
            <View className="flex-1 items-center justify-center gap-4">
              <BasicButton
                label="Save"
                onPress={async () => {
                  await claimUsername(username);
                }}
                style={{ width: 250 }}
              />
              <BasicButton
                label="Cancel"
                onPress={async () => {
                  setLoginPage('login');
                }}
                style={{ width: 250 }}
              />
            </View>
            <View className="flex flex-row items-center justify-between w-full px-10 py-6">
              <Text className="text-[#101119] text-md font-Pixels">Version {version}</Text>
              <Text className="text-[#101119] text-md font-Pixels">We are open source!</Text>
            </View>
            {creatingAvatar && (
              <View className="absolute left-0 right-0 bottom-0 bg-[#272727] rounded-t-3xl px-4 py-2 h-[29rem]
                              flex flex-col items-center justify-start gap-2 w-full
                              shadow-lg shadow-black/50"
                  >
                <View className="flex flex-row items-center justify-between w-full">
                  <Text className="text-white text-lg">Avatar Customization</Text>
                  <View className="flex flex-row gap-2 items-center">
                    <TouchableOpacity
                      onPress={() => {
                        setNewAvatar(getRandomNounsAttributes());
                      }}
                      className="py-2 border-2 border-[#101119] rounded-xl px-2"
                    >
                      <Text className="text-[#101119] text-xl">Random</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setCreatingAvatar(false);
                        setNewAvatar(avatar);
                      }}
                      className="rounded-full p-2"
                    >
                      <Text className="text-white text-2xl">x</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <ScrollView
                  className="flex-1 w-full"
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                >
                  <Text className="text-[#101119] text-md text-left w-full">
                    Heads
                  </Text>
                  <ScrollView
                    className="flex-1 w-full"
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    {getNounsHeadsList().map((head, index) => (
                      <TouchableOpacity
                        key={index}
                        className="p-2 h-20 aspect-square rounded-2xl mx-1"
                        style={{
                          borderWidth: newAvatar.head === index ? 2 : 0,
                          borderColor: newAvatar.head === index ? '#101119' : 'transparent',
                          backgroundColor: newAvatar.head === index ? '#10111910' : 'transparent',
                        }}
                        onPress={() => {
                          setNewAvatar({
                            ...newAvatar,
                            head: index,
                          });
                        }}
                      >
                        <Image
                          source={head}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text className="text-[#101119] text-md text-left w-full">
                    Glasses
                  </Text>
                  <ScrollView
                    className="flex-1 w-full"
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    {getNounsGlassesList().map((glasses, index) => (
                      <TouchableOpacity
                        key={index}
                        className="p-2 h-20 aspect-square rounded-2xl mx-1"
                        style={{
                          borderWidth: newAvatar.glasses === index ? 2 : 0,
                          borderColor: newAvatar.glasses === index ? '#101119' : 'transparent',
                          backgroundColor: newAvatar.glasses === index ? '#10111910' : 'transparent',
                        }}
                        onPress={() => {
                          setNewAvatar({
                            ...newAvatar,
                            glasses: index,
                          });
                        }}
                      >
                        <Image
                          source={glasses}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text className="text-[#101119] text-md text-left w-full">
                    Bodies
                  </Text>
                  <ScrollView
                    className="flex-1 w-full"
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    {getNounsBodiesList().map((body, index) => (
                      <TouchableOpacity
                        key={index}
                        className="p-2 h-20 aspect-square rounded-2xl mx-1"
                        style={{
                          borderWidth: newAvatar.body === index ? 2 : 0,
                          borderColor: newAvatar.body === index ? '#101119' : 'transparent',
                          backgroundColor: newAvatar.body === index ? '#10111910' : 'transparent',
                        }}
                        onPress={() => {
                          setNewAvatar({
                            ...newAvatar,
                            body: index,
                          });
                        }}
                      >
                        <Image
                          source={body}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text className="text-[#101119] text-md text-left w-full">
                    Accessories
                  </Text>
                  <ScrollView
                    className="flex-1 w-full"
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    {getNounsAccessoriesList().map((accessory, index) => (
                      <TouchableOpacity
                        key={index}
                        className="p-2 h-20 aspect-square rounded-2xl mx-1"
                        style={{
                          borderWidth: newAvatar.accessories === index ? 2 : 0,
                          borderColor: newAvatar.accessories === index ? '#101119' : 'transparent',
                          backgroundColor: newAvatar.accessories === index ? '#10111910' : 'transparent',
                        }}
                        onPress={() => {
                          setNewAvatar({
                            ...newAvatar,
                            accessories: index,
                          });
                        }}
                      >
                        <Image
                          source={accessory}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </ScrollView>
                <BasicButton
                  label="Apply"
                  onPress={applyAvatarCreation}
                  style={{ width: 250, marginTop: 20, marginBottom: 20 }}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export default AccountCreationPage;
