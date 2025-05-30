import React from 'react';
import { Image, View, ScrollView, Text, TouchableOpacity, ImageBackground, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, } from 'react-native';
import { useStarknetConnector } from '../../context/StarknetConnector';
import { PFPView } from '../../components/PFPView';
import BasicButton from '../../components/buttons/Basic';
import { getNounsHeadsList, getNounsBodiesList,
         getNounsAccessoriesList, getNounsGlassesList,
         NounsAttributes, getRandomNounsAttributes
} from '../../configs/nouns';
import background from '../../../assets/background.png';

type AccountCreationProps = {
  setLoginPage: (page: string) => void;
};

export const AccountCreationPage: React.FC<AccountCreationProps> = ({ setLoginPage }) => {
  const version = process.env.EXPO_APP_VERSION || '0.0.1';
  const { account, deployAccount, connectAccount, getMyAddress, invokeInitMyGame } = useStarknetConnector();

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
        <ImageBackground
          source={background}
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'space-between' }}
            keyboardShouldPersistTaps="handled"
            >
            <Text className="text-[#ffff80] text-lg mt-8">
              Create your account
            </Text>
            <TouchableOpacity className="flex items-center justify-center bg-[#ffff8010]
                            w-2/3 aspect-square p-4 mt-8
                            border-2 border-[#ffff80] overflow-hidden
                            rounded-xl shadow-lg shadow-black/50"
              onPress={startCreatingAvatar}
            >
              <PFPView user={account?.address} attributes={creatingAvatar ? newAvatar : avatar} />
            </TouchableOpacity>
            <Text className="text-[#ffff80] text-xl mt-4">
              Create your avatar
            </Text>
            <View className="flex flex-col items-start mt-8 w-screen px-8">
              <Text className="text-[#ffff80] text-md">
                Set up a username
              </Text>
              {/* // TODO: fix/keyboard-covers-input-fields */}
              <TextInput
                className="bg-[#ffff8010] w-full rounded-lg mt-2 px-2 py-1 text-xl text-[#ffff80] border-2 border-[#ffff80] shadow-lg shadow-black/50"
                placeholder="Satoshi"
                placeholderTextColor="#ffff8080"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                value={username}
                onChangeText={setUsername}
              />
              <Text className="text-[#a0a0a0] text-md mt-2">
                Please notice: your username will be public
              </Text>
            </View>
            <View className="flex-1 items-center justify-center gap-4">
              <BasicButton
                label="Save"
                onPress={async () => {
                  await deployAccount();
                  await connectAccount();
                  await invokeInitMyGame();
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
              <Text className="text-white text-sm">Version {version}</Text>
              <Text className="text-white text-sm">We are open source!</Text>
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
                      className="py-2 border-2 border-[#ffff80] rounded-xl px-2"
                    >
                      <Text className="text-[#ffff80] text-xl">Random</Text>
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
                <Text className="text-[#ffff80] text-md text-left w-full">
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
                        borderColor: newAvatar.head === index ? '#ffff80' : 'transparent',
                        backgroundColor: newAvatar.head === index ? '#ffff8010' : 'transparent',
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
                <Text className="text-[#ffff80] text-md text-left w-full">
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
                        borderColor: newAvatar.glasses === index ? '#ffff80' : 'transparent',
                        backgroundColor: newAvatar.glasses === index ? '#ffff8010' : 'transparent',
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
                <Text className="text-[#ffff80] text-md text-left w-full">
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
                        borderColor: newAvatar.body === index ? '#ffff80' : 'transparent',
                        backgroundColor: newAvatar.body === index ? '#ffff8010' : 'transparent',
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
                <Text className="text-[#ffff80] text-md text-left w-full">
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
                        borderColor: newAvatar.accessories === index ? '#ffff80' : 'transparent',
                        backgroundColor: newAvatar.accessories === index ? '#ffff8010' : 'transparent',
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
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export default AccountCreationPage;
