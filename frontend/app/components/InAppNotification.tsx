import { Animated, Text, useAnimatedValue, View } from "react-native";
import {
  InAppNotificationType,
  useInAppNotifications,
} from "../context/InAppNotifications";
import inAppNotificationsJson from "../configs/inAppNotifications.json";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";

const HEADER_HEIGHT = 76;

export const InAppNotification = () => {
  const { inAppNotifications, clearInAppNotification } =
    useInAppNotifications();
  const [activeNotification, setActiveNotification] =
    useState<InAppNotificationType | null>(null);
  const insets = useSafeAreaInsets();

  const opacityAnimation = useAnimatedValue(0);
  const translationAnimation = useAnimatedValue(-HEADER_HEIGHT);

  useEffect(() => {
    setActiveNotification(inAppNotifications[0]);
  }, [inAppNotifications]);

  useEffect(() => {
    if (activeNotification != null) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translationAnimation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(translationAnimation, {
            delay: 800,
            toValue: -HEADER_HEIGHT,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            delay: 600,
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (activeNotification) {
          clearInAppNotification(activeNotification.id);
        }
      });
    }
  }, [opacityAnimation, activeNotification]);

  // TODO: Improve flow when multiple notifications are present
  return (
    <View
      style={{
        marginTop: insets.top + HEADER_HEIGHT,
        position: "absolute",
        zIndex: 100,
        width: "100%",
        alignItems: "center",
      }}
    >
      {activeNotification && (
        <Animated.View
          className="my-2 py-3 px-2 bg-[#1011198b] border-2 rounded"
          style={{
            borderColor:
              inAppNotificationsJson[activeNotification.notificationTypeId]
                .color || "#101119b0",
            opacity: opacityAnimation,
            transform: [{ translateY: translationAnimation }],
          }}
        >
          <Text
            className="text-md font-bold text-nowrap"
            style={{
              color:
                inAppNotificationsJson[activeNotification.notificationTypeId]
                  .color || "#101119b0",
            }}
          >
            {inAppNotifications[0]?.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default InAppNotification;
