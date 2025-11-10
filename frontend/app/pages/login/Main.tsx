import React from "react";
import { Text, View } from "react-native";
import { useStarknetConnector } from "../../context/StarknetConnector";
import Constants from "expo-constants";
import BasicButton from "../../components/buttons/Basic";
import { Logo } from "../../components/Logo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

type LoginMainPageProps = {
  setLoginPage: (page: string) => void;
  setSettingTab?: (tab: string) => void;
};

export const LoginMainPage: React.FC<LoginMainPageProps> = ({
  setLoginPage,
  setSettingTab,
}) => {
  const { getAvailableKeys, connectStorageAccount } = useStarknetConnector();
  const insets = useSafeAreaInsets();

  const version = Constants.expoConfig?.version || "0.0.1";
  return (
    <View
      style={{
        paddingTop: insets.top,
        overflow: "visible",
      }}
      className="flex-1 items-center justify-around relative bg-transparent"
    >
      <Logo doEnterAnim={true} />
      <Animated.View
        entering={FadeInDown}
        style={{
          bottom: "15%",
        }}
        className="absolute items-center justify-center gap-3"
      >
        <BasicButton
          label="PLAY!"
          onPress={async () => {
            const keys = await getAvailableKeys("pow_game");
            if (keys.length > 0) {
              await connectStorageAccount(keys[0]);
            }
            setLoginPage("accountCreation");
          }}
        />
        <BasicButton
          label="SETTINGS"
          onPress={async () => {
            if (setSettingTab) {
              setSettingTab("Main");
            }
            setLoginPage("settings");
          }}
        />
        <BasicButton
          label="ABOUT"
          onPress={() => {
            setLoginPage("settings");
            if (setSettingTab) {
              setSettingTab("About");
            }
          }}
        />
      </Animated.View>
      <View
        style={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 16,
        }}
        className="absolute bottom-0 w-full px-8 bg-[#10111A]"
      >
        <Animated.View
          entering={FadeInDown}
          className="flex items-center justify-center w-full mb-3"
        >
          <Text className="text-[#fff7ff] font-Pixels text-[16px] text-center">
            Funded by NounsDAO ⌐◨-◨
          </Text>
        </Animated.View>
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
