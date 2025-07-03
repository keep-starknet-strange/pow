import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity } from "react-native";

import { MainPage } from "../pages/MainPage";
import { StorePage } from "../pages/StorePage";
import { LeaderboardPage } from "../pages/LeaderboardPage";
import { AchievementsPage } from "../pages/AchievementsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { StakingPage } from "../pages/StakingPage";

import { useEventManager } from "../context/EventManager";
import { useImages } from "../hooks/useImages";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { TargetId } from "../stores/useTutorialStore";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

function StoreTabButton({
  isActive,
  onPress,
}: {
  isActive: boolean;
  onPress: any;
}) {
  const { ref, onLayout } = useTutorialLayout("storeTab" as TargetId);

  return (
    <View ref={ref} onLayout={onLayout} className="">
      <TabBarButton tabName="Store" isActive={isActive} onPress={onPress} />
    </View>
  );
}

function TabBarButton({
  tabName,
  isActive,
  onPress,
}: {
  tabName: string;
  isActive: boolean;
  onPress: any;
}) {
  const { stakingUnlocked } = useStaking();
  const { getImage } = useImages();
  const buttonRef = useRef<View>(null);
  const [buttonSize, setButtonSize] = useState({ width: 0, height: 0 });

  const getTabIcon = useCallback(
    (tabName: string, selected: boolean) => {
      switch (tabName) {
        case "Main":
          return selected
            ? getImage("nav.icon.game.active")
            : getImage("nav.icon.game");
        case "Staking":
          return selected
            ? getImage("nav.icon.staking.active")
            : getImage("nav.icon.staking");
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
    },
    [getImage],
  );

  useLayoutEffect(() => {
    buttonRef.current?.measure((_x, _y, width, height, _pageX, _pageY) => {
      setButtonSize({ width: width, height: height });
    });
  }, [buttonRef, setButtonSize, stakingUnlocked]);

  return (
    <TouchableOpacity
      className="h-full justify-center items-center mx-[1px]"
      ref={buttonRef}
      onPress={onPress}
    >
      <Canvas
        style={{
          position: "absolute",
          width: buttonSize.width,
          height: buttonSize.height,
        }}
      >
        <Image
          image={
            isActive ? getImage("nav.button.active") : getImage("nav.button")
          }
          fit="fill"
          x={0}
          y={0}
          width={buttonSize.width}
          height={buttonSize.height}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
      <Canvas
        style={{
          width: buttonSize.width * 0.8,
          height: buttonSize.width * 0.8,
        }}
      >
        <Image
          image={getTabIcon(tabName, isActive)}
          fit="contain"
          x={0}
          y={0}
          width={buttonSize.width * 0.8}
          height={buttonSize.width * 0.8}
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
  const { notify } = useEventManager();
  const insets = useSafeAreaInsets();
  const handleTabPress = (routeName: string) => {
    notify("SwitchPage", { name: routeName });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        animation: "shift",
        popToTopOnBlur: true,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#101119ff",
          height: 96 + insets.bottom,
          paddingTop: 6,
          borderTopWidth: 0,
          zIndex: 20,
          paddingHorizontal: 10,
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
        children={() => <SettingsPage setLoginPage={null} />}
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
