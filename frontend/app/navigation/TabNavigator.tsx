import React, { useCallback, memo, useState, useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Pressable, StyleSheet, Text } from "react-native";
import type { LayoutChangeEvent } from "react-native";

import { MainPage } from "../pages/MainPage";
import { StorePage } from "../pages/StorePage";
import { LeaderboardPage } from "../pages/LeaderboardPage";
import { AchievementsPage } from "../pages/AchievementsPage";
import { SettingsPage } from "../pages/SettingsPage";

import { useEventManager } from "@/app/stores/useEventManager";
import { useImages } from "../hooks/useImages";
import { TutorialRefView } from "../components/tutorial/TutorialRefView";
import {
  TargetId,
  useIsTutorialTargetActive,
} from "../stores/useTutorialStore";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useAchievementsHasUnseen,
  useAchievementsUnseenCount,
} from "../stores/useAchievementsStore";

const Tab = createBottomTabNavigator();

const StoreTabButton = memo(
  ({ isActive, onPress }: { isActive: boolean; onPress: any }) => {
    const isStoreTabActive = useIsTutorialTargetActive("storeTab" as TargetId);
    return (
      <View style={styles.relative}>
        <TutorialRefView targetId="storeTab" enabled={true} />
        <TabBarButton
          tabName="Store"
          isActive={isActive || isStoreTabActive}
          onPress={onPress}
        />
      </View>
    );
  },
);

const AchievementsTabButton = memo(
  ({ isActive, onPress }: { isActive: boolean; onPress: any }) => {
    const isAchievementsActive = useIsTutorialTargetActive(
      "achievementsTab" as TargetId,
    );
    const hasUnseen = useAchievementsHasUnseen();
    const unseenCount = useAchievementsUnseenCount();
    return (
      <View style={styles.relative}>
        <TutorialRefView targetId="achievementsTab" enabled={true} />
        <TabBarButton
          tabName="Achievements"
          isActive={isActive || isAchievementsActive}
          onPress={onPress}
        />
        {hasUnseen && <BadgeOverlay count={unseenCount} />}
      </View>
    );
  },
);

const LeaderboardTabButton = memo(
  ({ isActive, onPress }: { isActive: boolean; onPress: any }) => {
    const isLeaderboardActive = useIsTutorialTargetActive(
      "leaderboardTab" as TargetId,
    );
    return (
      <View style={styles.relative}>
        <TutorialRefView targetId="leaderboardTab" enabled={true} />
        <TabBarButton
          tabName="Leaderboard"
          isActive={isActive || isLeaderboardActive}
          onPress={onPress}
        />
      </View>
    );
  },
);

const TabBarButton = memo(
  ({
    tabName,
    isActive,
    onPress,
  }: {
    tabName: string;
    isActive: boolean;
    onPress: any;
  }) => {
    const { getImage } = useImages();
    const [buttonSize, setButtonSize] = useState({ width: 0, height: 0 });

    const tabIcon = useMemo(() => {
      switch (tabName) {
        case "Main":
          return isActive
            ? getImage("nav.icon.game.active")
            : getImage("nav.icon.game");
        case "Store":
          return isActive
            ? getImage("nav.icon.shop.active")
            : getImage("nav.icon.shop");
        case "Achievements":
          return isActive
            ? getImage("nav.icon.flag.active")
            : getImage("nav.icon.flag");
        case "Leaderboard":
          return isActive
            ? getImage("nav.icon.medal.active")
            : getImage("nav.icon.medal");
        case "Settings":
          return isActive
            ? getImage("nav.icon.settings.active")
            : getImage("nav.icon.settings");
        default:
          return null;
      }
    }, [tabName, isActive, getImage]);

    const buttonImage = useMemo(() => {
      return isActive ? getImage("nav.button.active") : getImage("nav.button");
    }, [isActive, getImage]);

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setButtonSize({ width, height });
    }, []);

    const backgroundCanvasStyle = useMemo(
      () => ({
        position: "absolute" as const,
        width: buttonSize.width,
        height: buttonSize.height,
      }),
      [buttonSize],
    );

    const iconCanvasStyle = useMemo(
      () => ({
        width: buttonSize.width * 0.8,
        height: buttonSize.width * 0.8,
      }),
      [buttonSize],
    );

    return (
      <Pressable
        style={styles.tabPressable}
        onPress={onPress}
        onLayout={handleLayout}
      >
        <Canvas style={backgroundCanvasStyle}>
          <Image
            image={buttonImage}
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
        <Canvas style={iconCanvasStyle}>
          <Image
            image={tabIcon}
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
      </Pressable>
    );
  },
);

const BadgeOverlay = memo(({ count }: { count: number }) => {
  const { getImage } = useImages();
  const display = count > 99 ? "99+" : String(count);
  return (
    <View style={styles.badgeContainer} pointerEvents="none">
      <Canvas style={styles.badgeCanvas}>
        <Image
          image={getImage("notif.badge")}
          fit="contain"
          x={0}
          y={0}
          width={22}
          height={22}
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
        />
      </Canvas>
      <View style={styles.badgeTextWrapper}>
        <Pressable
          accessibilityLabel={`Achievements, ${display} new`}
          accessibilityRole="text"
          disabled
        >
          <View>
            <Text style={styles.badgeText}>{display}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
});

export const TabNavigator = memo(() => {
  const { notify } = useEventManager();
  const insets = useSafeAreaInsets();

  const handleTabPress = useCallback(
    (routeName: string) => {
      notify("SwitchPage", { name: routeName });
    },
    [notify],
  );

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: "#101119ff",
      height: 96 + insets.bottom,
      paddingTop: 6,
      borderTopWidth: 0,
      zIndex: 20,
      paddingHorizontal: 10,
    }),
    [insets.bottom],
  );

  const screenOptions = useMemo(
    () => ({
      animation: "shift" as const,
      headerShown: false,
      tabBarStyle,
      tabBarShowLabel: false,
    }),
    [tabBarStyle],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
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
        name="Store"
        component={StorePage}
        options={{
          freezeOnBlur: true,
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
          freezeOnBlur: true,
          tabBarButton: (props) => (
            <LeaderboardTabButton
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
          freezeOnBlur: true,
          tabBarButton: (props) => (
            <AchievementsTabButton
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
        children={(nav) => (
          <SettingsPage
            setLoginPage={null}
            initialTab={(nav.route.params as any)?.initialTab}
          />
        )}
        options={{
          freezeOnBlur: true,
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
});

const styles = StyleSheet.create({
  relative: {
    position: "relative",
  },
  tabPressable: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 1,
  },
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    zIndex: 30,
  },
  badgeCanvas: {
    width: 22,
    height: 22,
  },
  badgeTextWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff7ff",
    fontSize: 12,
    fontFamily: "Xerxes",
    textAlign: "center",
  },
});
