import React from "react";
import { SafeAreaView, Text, View, BackHandler } from "react-native";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { usePowContractConnector } from "../../context/PowContractConnector";
import Constants from "expo-constants";
import BasicButton from "../../components/buttons/Basic";
import logo from "../../../assets/logo/pow.webp";
import starknetLogo from "../../../assets/logo/starknet.webp";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

type LoginMainPageProps = {
  setLoginPage: (page: string) => void;
};

export const LoginMainPage: React.FC<LoginMainPageProps> = ({
  setLoginPage,
}) => {
  const { getImage } = useImages();
  const { getAvailableKeys, connectStorageAccount } = useStarknetConnector();
  const { createGameAccount } = usePowContractConnector();
  const insets = useSafeAreaInsets();

  const version = Constants.expoConfig?.version || "0.0.1";
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 items-center justify-around relative"
    >
      <Animated.View
        entering={FadeInUp}
        className="relative mt-[130px]"
        style={{ width: 322, height: 214 }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("logo")}
            fit="contain"
            x={0}
            y={0}
            width={322}
            height={214}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <View
          className="absolute bottom-[30px] right-[20px]"
          style={{ width: 182, height: 18 }}
        >
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getImage("logo.sub")}
              fit="contain"
              x={0}
              y={0}
              width={182}
              height={18}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
        </View>
      </Animated.View>
      <Animated.View
        entering={FadeInDown}
        className="items-center justify-center gap-3"
      >
        <BasicButton
          label="PLAY!"
          onPress={async () => {
            const keys = await getAvailableKeys("pow_game");
            if (keys.length > 0) {
              await connectStorageAccount(keys[0]);
            } else {
              await createGameAccount();
            }
            setLoginPage("accountCreation");
          }}
        />
        <BasicButton
          label="SETTINGS"
          onPress={async () => {
            setLoginPage("settings");
          }}
        />
        <BasicButton
          label="CLOSE"
          onPress={() => {
            BackHandler.exitApp();
          }}
        />
      </Animated.View>
      <View className="absolute bottom-0 w-full px-8 py-4 pb-6 bg-[#10111A]">
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
      </View>
    </View>
  );
};

export default LoginMainPage;
