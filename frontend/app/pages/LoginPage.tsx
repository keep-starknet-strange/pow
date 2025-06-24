import React, { useState } from 'react';
import { View } from 'react-native';
import { useImageProvider } from "../context/ImageProvider";
import { LoginMainPage } from './login/Main';
import { AccountCreationPage } from './login/AccountCreation';
import { Canvas, Image, FilterMode, MipmapMode } from '@shopify/react-native-skia';

export const LoginPage: React.FC = () => {
  const { getImage } = useImageProvider();

  const loginPages = {
    login: LoginMainPage,
    accountCreation: AccountCreationPage,
  };
  const [currentPage, setCurrentPage] = useState<keyof typeof loginPages>('login');
  const ActivePage = loginPages[currentPage];

  const setLoginPage = (page: string) => {
    setCurrentPage(page as keyof typeof loginPages);
  };

  return (
    <View className="flex-1 items-center">
      <View className="absolute h-[1000px] w-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image image={getImage('background')} fit="fill" x={0} y={0} width={410} height={1000} sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}/>
        </Canvas>
      </View>
      <View className="absolute h-[1000px] w-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image image={getImage('background.grid')} fit="fill" x={0} y={0} width={410} height={1000} sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}/>
        </Canvas>
      </View>
      <ActivePage setLoginPage={setLoginPage} />
    </View>
  );
}

export default LoginPage;
