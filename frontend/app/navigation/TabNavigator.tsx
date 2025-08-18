import React, {
  useCallback,
  memo,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Pressable } from "react-native";

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

const Tab = createBottomTabNavigator();

const StoreTabButton = memo(
  ({ isActive, onPress }: { isActive: boolean; onPress: any }) => {
    const isStoreTabActive = useIsTutorialTargetActive("storeTab" as TargetId);
    return (
      <View className="relative">
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
    const buttonRef = useRef<View>(null);
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

    useLayoutEffect(() => {
      buttonRef.current?.measure((_x, _y, width, height, _pageX, _pageY) => {
        setButtonSize({ width: width, height: height });
      });
    }, [buttonRef, setButtonSize]);

    return (
      <Pressable
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
        <Canvas
          style={{
            width: buttonSize.width * 0.8,
            height: buttonSize.width * 0.8,
          }}
        >
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
          freezeOnBlur: true,
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
