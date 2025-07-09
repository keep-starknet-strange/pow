import React from "react";
import { Image, Text, View } from "react-native";
import { useStarknetConnector } from "../../context/StarknetConnector";
import { usePowContractConnector } from "../../context/PowContractConnector";
import BasicButton from "../../components/buttons/Basic";
import logo from "../../../assets/logo/pow.png";
import starknetLogo from "../../../assets/logo/starknet.png";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LoginMainPageProps = {
  setLoginPage: (page: string) => void;
};

export const LoginMainPage: React.FC<LoginMainPageProps> = ({
  setLoginPage,
}) => {
  const { getAvailableKeys, connectStorageAccount } = useStarknetConnector();
  const { createGameAccount } = usePowContractConnector();
  const insets = useSafeAreaInsets();

  const version = process.env.EXPO_APP_VERSION || "0.0.1";
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 items-center justify-between"
    >
      <View className="flex items-center justify-center">
        <Image
          source={logo}
          style={{ width: 300, height: 300, marginTop: 100 }}
          resizeMode="contain"
        />
        <Text className="text-[#101119] text-2xl font-Xerxes text-center">
          Click. Build. Mine.
        </Text>
      </View>
      <View className="flex-1 items-center justify-center gap-2">
        <BasicButton
          label="Play!"
          onPress={async () => {
            const keys = await getAvailableKeys("pow_game");
            if (keys.length > 0) {
              await connectStorageAccount(keys[0]);
            } else {
              await createGameAccount();
            }
            setLoginPage("accountCreation");
          }}
          style={{ width: 250 }}
        />
        <BasicButton
          label="Settings"
          onPress={async () => {
            setLoginPage("settings");
          }}
          style={{ width: 250 }}
        />
        <View className="flex flex-row items-center justify-between gap-2">
          <Text className="text-[#101119] text-lg font-Pixels">
            Powered by Starknet
          </Text>
          <Image
            source={starknetLogo}
            style={{ width: 30, height: 30 }}
            resizeMode="contain"
          />
        </View>
      </View>
      <View className="flex flex-row items-center justify-between w-full px-10 py-2">
        <Text className="text-[#101119] font-Pixels">Version {version}</Text>
        <Text className="text-[#101119] font-Pixels">We are open source!</Text>
      </View>
    </View>
  );
};

export default LoginMainPage;
