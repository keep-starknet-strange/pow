import React, { memo, useMemo, useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";

import { LoginPage } from "../pages/LoginPage";
import { TabNavigator } from "./TabNavigator";
import { Header } from "../components/Header";
import { InAppNotification } from "../components/InAppNotification";
import { TutorialOverlay } from "../components/TutorialOverlay";
import { RevertModal } from "../components/RevertModal";
import { LoadingScreen } from "../pages/LoadingScreen";

import { useFocEngine } from "../context/FocEngineConnector";
import { useTutorial } from "../stores/useTutorialStore";
import { ShareActionModal } from "@/app/components/ShareActionModal";

const Stack = createStackNavigator();

export const RootNavigator = memo(() => {
  const { user } = useFocEngine();
  const { isTutorialActive } = useTutorial();

  const userAccountConnected = useMemo(
    () => user && user.account.username !== "",
    [user],
  );

  const screenOptions = useMemo(() => ({ headerShown: false }), []);

  return (
    <View className="flex-1 bg-[#101119ff] relative">
      {userAccountConnected ? (
        <>
          {isTutorialActive && <TutorialOverlay />}
          <Header />
          <InAppNotification />
          <ShareActionModal />
          <TabNavigator />
        </>
      ) : (
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Login" component={LoginPage} />
        </Stack.Navigator>
      )}
      <LoadingScreen />
      <RevertModal />
    </View>
  );
});
