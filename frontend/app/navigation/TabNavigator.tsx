import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity } from "react-native";

import { MainPage } from "../pages/MainPage";
import { StorePage } from "../pages/StorePage";
import { LeaderboardPage } from "../pages/LeaderboardPage";
import { AchievementsPage } from "../pages/AchievementsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { StakingPage } from "../pages/StakingPage";

import { useStaking } from "../context/Staking";
import { useEventManager } from "../context/EventManager";
import { useImageProvider } from "../context/ImageProvider";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { TargetId } from "../context/Tutorial";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

const Tab = createBottomTabNavigator();

function StoreTabButton({
  isActive,
  onPress
}: {
  isActive: boolean;
  onPress: any;
}) {
  const { ref, onLayout } = useTutorialLayout("storeTab" as TargetId);

  return (
    <View ref={ref} onLayout={onLayout} className="">
      <TabBarButton
        tabName="Store"
        isActive={isActive}
        onPress={onPress}
      />
    </View>
  );
}

function TabBarButton({
  tabName,
  isActive,
  onPress
}: {
  tabName: string;
  isActive: boolean;
  onPress: any;
}) {
  const { getImage } = useImageProvider();
  const getTabIcon = (tabName: string, selected: boolean) => {
    switch (tabName) {
      case "Main":
        return selected
          ? getImage("nav.icon.game.active")
          : getImage("nav.icon.game");
      case "Store":
        return selected
          ? getImage("nav.icon.shop.active")
          : getImage("nav.icon.shop");
      case "Achievements":
        return selected
          ? getImage("nav.icon.flag.active")
          : getImage("nav.icon.flag");
      case "Leaderboard":
        return selected
          ? getImage("nav.icon.medal.active")
          : getImage("nav.icon.medal");
      case "Settings":
        return selected
          ? getImage("nav.icon.settings.active")
          : getImage("nav.icon.settings");
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      className="flex flex-row h-[68px] w-[68px] relative"
      onPress={onPress}
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={
            isActive
              ? getImage("nav.button.active")
              : getImage("nav.button")
          }
          fit="fill"
          x={0}
          y={0}
          width={68}
          height={68}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
      <Canvas
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 68,
          height: 68,
        }}
      >
        <Image
          image={getTabIcon(tabName, isActive)}
          fit="contain"
          x={10}
          y={10}
          width={48}
          height={48}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
    </TouchableOpacity>
  );
}

export function TabNavigator() {
  const { stakingUnlocked } = useStaking();
  const { notify } = useEventManager();

  const handleTabPress = (routeName: string) => {
    notify("SwitchPage", { name: routeName });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#101119ff",
          borderTopWidth: 0,
          paddingBottom: 24,
          paddingTop: 8,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 96,
          zIndex: 20,
          paddingHorizontal: 16,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Main"
        component={MainPage}
        options={{
          tabBarButton: (props) => (
            <TabBarButton
              tabName="Main"
              isActive={props["aria-selected"] || false}
              onPress={props.onPress}
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("Main"),
        }}
      />

      {stakingUnlocked && (
        <Tab.Screen
          name="Staking"
          component={StakingPage}
          options={{
            tabBarButton: (props) => (
              <TabBarButton
                tabName="Staking"
                isActive={props["aria-selected"] || false}
                onPress={props.onPress}
              />
            ),
          }}
          listeners={{
            tabPress: () => handleTabPress("Staking"),
          }}
        />
      )}

      <Tab.Screen
        name="Store"
        component={StorePage}
        options={{
          tabBarButton: (props) => (
            <StoreTabButton
              isActive={props["aria-selected"] || false}
              onPress={props.onPress}
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("Store"),
        }}
      />

      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardPage}
        options={{
          tabBarButton: (props) => (
            <TabBarButton
              tabName="Leaderboard"
              isActive={props["aria-selected"] || false}
              onPress={props.onPress}
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("Leaderboard"),
        }}
      />

      <Tab.Screen
        name="Achievements"
        component={AchievementsPage}
        options={{
          tabBarButton: (props) => (
            <TabBarButton
              tabName="Achievements"
              isActive={props["aria-selected"] || false}
              onPress={props.onPress}
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("Achievements"),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsPage}
        options={{
          tabBarButton: (props) => (
            <TabBarButton
              tabName="Settings"
              isActive={props["aria-selected"] || false}
              onPress={props.onPress}
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("Settings"),
        }}
      />
    </Tab.Navigator>
  );
}
