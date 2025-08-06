import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";

import { LoginPage } from "../pages/LoginPage";
import { TabNavigator } from "./TabNavigator";
import { Header } from "../components/Header";
import { InAppNotification } from "../components/InAppNotification";
import { useFocEngine } from "../context/FocEngineConnector";

const Stack = createStackNavigator();

export function RootNavigator() {
  const { user } = useFocEngine();

  const isAuthenticated = user && user.account.username !== "";

  return (
    <View className="flex-1 bg-[#101119ff] relative">
      {isAuthenticated ? (
        <>
          <Header />
          <InAppNotification />
          <TabNavigator />
        </>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginPage} />
        </Stack.Navigator>
      )}
    </View>
  );
}
