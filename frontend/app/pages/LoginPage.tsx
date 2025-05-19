import React from 'react';
import { Image, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useStarknetConnector } from '../context/StarknetConnector';
import BasicButton from '../components/buttons/Basic';
import logo from '../../assets/logo/pow.png';
import titleDesc from '../../assets/images/title-desc.png';
import background from '../../assets/background.png';
import starknetLogo from '../../assets/logo/starknet.png';

export const LoginPage: React.FC = () => {
  const version = process.env.EXPO_APP_VERSION || '0.0.1';
  const { account, deployAccount, connectAccount, getMyAddress, invokeInitMyGame } = useStarknetConnector();
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
          label="PLAY!"
          onPress={async () => {
            await deployAccount();
            await connectAccount();
            await invokeInitMyGame();
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

export default LoginPage;
