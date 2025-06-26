import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, TouchableOpacity } from "react-native";

import { MainPage } from "../pages/MainPage";
import { StorePage } from "../pages/StorePage";
import { LeaderboardPage } from "../pages/LeaderboardPage";
import { AchievementsPage } from "../pages/AchievementsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { StakingPage } from "../pages/StakingPage";

import { useStaking } from "../context/Staking";
import { useSound } from "../context/Sound";
import { useEventManager, EventType } from "../context/EventManager";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { TargetId } from "../context/Tutorial";

const Tab = createBottomTabNavigator();

function StoreTabButton() {
  const { ref, onLayout } = useTutorialLayout("storeTab" as TargetId);

  return (
    <TouchableOpacity ref={ref} onLayout={onLayout}>
      <Text style={{ fontSize: 28, color: "#f7f7f7" }}>🛒</Text>
    </TouchableOpacity>
  );
}

export function TabNavigator() {
  const { stakingUnlocked } = useStaking();
  const { playSoundEffect } = useSound();
  const { notify } = useEventManager();

  const handleTabPress = (routeName: string) => {
    notify("switchPage" as EventType, { name: routeName });
    playSoundEffect("BasicClick");
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#010108ff",
          borderTopWidth: 2,
          borderTopColor: "#2020600f0",
          paddingBottom: 24,
          paddingTop: 16,
          height: 90,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: "#f7f7f7",
        tabBarInactiveTintColor: "#f7f7f7",
        tabBarLabelStyle: {
          fontSize: 0, // Hide labels, we're using emoji icons
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Main"
        component={MainPage}
        options={{
          tabBarIcon: () => (
            <Text style={{ fontSize: 28, color: "#f7f7f7" }}>🎮</Text>
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
            tabBarIcon: () => (
              <Text style={{ fontSize: 28, color: "#f7f7f7" }}>🥩</Text>
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
          tabBarIcon: () => <StoreTabButton />,
        }}
        listeners={{
          tabPress: () => handleTabPress("Store"),
        }}
      />

      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardPage}
        options={{
          tabBarIcon: () => (
            <Text style={{ fontSize: 28, color: "#f7f7f7" }}>🏆</Text>
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
          tabBarIcon: () => (
            <Text style={{ fontSize: 28, color: "#f7f7f7" }}>🎉</Text>
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
          tabBarIcon: () => (
            <Text style={{ fontSize: 28, color: "#f7f7f7" }}>⚙️</Text>
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("Settings"),
        }}
      />
    </Tab.Navigator>
  );
}
