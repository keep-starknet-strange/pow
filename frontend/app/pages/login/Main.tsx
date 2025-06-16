import React from 'react';
import { Image, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { usePowContractConnector } from '../../context/PowContractConnector';
import BasicButton from '../../components/buttons/Basic';
import logo from '../../../assets/logo/pow.png';
import titleDesc from '../../../assets/images/title-desc.png';
import background from '../../../assets/background.png';
import starknetLogo from '../../../assets/logo/starknet.png';

type LoginMainPageProps = {
  setLoginPage: (page: string) => void;
};

export const LoginMainPage: React.FC<LoginMainPageProps> = ({ setLoginPage }) => {
  const { initMyGame } = usePowContractConnector();

  const version = process.env.EXPO_APP_VERSION || '0.0.1';
  return (
    <ImageBackground
      className="flex-1 items-center justify-between"
      source={background}
      resizeMode="cover"
    >
      <View className="flex items-center justify-center">
        <Image
          source={logo}
          style={{ width: 300, height: 300, marginTop: 100 }}
          resizeMode="contain"
        />
        <Image
          source={titleDesc}
          style={{ width: 300, height: 30 }}
          resizeMode="contain"
        />
      </View>
      <View className="flex-1 items-center justify-center gap-4">
        <BasicButton
          label="Play!"
          onPress={async () => {
            await initMyGame();
            setLoginPage('accountCreation');
          }}
          style={{ width: 250 }}
        />
        <BasicButton
          label="Settings"
          onPress={async () => {
          }}
          style={{ width: 250 }}
        />
        <View className="flex flex-row items-center justify-between gap-2">
          <Text className="text-white text-md">
            Powered by Starknet
          </Text>
          <Image
            source={starknetLogo}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>
      </View>
      <View className="flex flex-row items-center justify-between w-full px-10 py-6">
        <Text className="text-white text-sm">Version {version}</Text>
        <Text className="text-white text-sm">We are open source!</Text>
      </View>
    </ImageBackground>
  );
}

export default LoginMainPage;
