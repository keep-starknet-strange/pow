import React, { memo, useMemo } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";

import { LoginPage } from "../pages/LoginPage";
import { TabNavigator } from "./TabNavigator";
import { Header } from "../components/Header";
import { InAppNotification } from "../components/InAppNotification";
import { TutorialOverlay } from "../components/TutorialOverlay";

import { useFocEngine } from "../context/FocEngineConnector";
import { useTutorial } from "../stores/useTutorialStore";

const Stack = createStackNavigator();

export const RootNavigator = memo(() => {
  const { user } = useFocEngine();
  const { isTutorialActive } = useTutorial();

  const isAuthenticated = useMemo(
    () => user && user.account.username !== "",
    [user],
  );

  const screenOptions = useMemo(() => ({ headerShown: false }), []);

  return (
    <View className="flex-1 bg-[#101119ff] relative">
      {isAuthenticated ? (
        <>
          {isTutorialActive && <TutorialOverlay />}
          <Header />
          <InAppNotification />
          <TabNavigator />
        </>
      ) : (
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Login" component={LoginPage} />
        </Stack.Navigator>
      )}
    </View>
  );
});
