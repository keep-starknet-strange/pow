import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import { useImageProvider } from "../context/ImageProvider";
import { LoginMainPage } from "./login/Main";
import { AccountCreationPage } from "./login/AccountCreation";
import { SettingsPage } from "./SettingsPage";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export const LoginPage: React.FC = () => {
  const { getImage } = useImageProvider();
  const { width, height } = Dimensions.get("window");

  const loginPages = {
    login: LoginMainPage,
    accountCreation: AccountCreationPage,
    settings: SettingsPage,
  };
  const [currentPage, setCurrentPage] =
    useState<keyof typeof loginPages>("login");
  const ActivePage = loginPages[currentPage];

  const setLoginPage = (page: string) => {
    setCurrentPage(page as keyof typeof loginPages);
  };

  return (
    <View className="flex-1 items-center">
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("background")}
            fit="cover"
            x={0}
            y={0}
            width={width}
            height={height}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("background.grid")}
            fit="cover"
            x={0}
            y={0}
            width={width}
            height={height}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      <ActivePage setLoginPage={setLoginPage} />
    </View>
  );
};

export default LoginPage;
