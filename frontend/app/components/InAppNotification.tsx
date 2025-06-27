import { Text, View } from "react-native";
import { useInAppNotifications } from "../context/InAppNotifications";
import inAppNotificationsJson from "../configs/inAppNotifications.json";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const InAppNotification = () => {
  const { inAppNotifications } = useInAppNotifications();
  const insets = useSafeAreaInsets();

  // TODO: Animation
  // TODO: Improve flow when multiple notifications are present
  return (
    <View
      style={{
        paddingTop: insets.top,
      }}
      className="absolute top-0 right-0 z-[100] w-[65%]"
    >
      {inAppNotifications.length > 0 && (
        <View
          className="my-2 py-3 px-2 bg-[#10111908]
                         border-2 border-r-0 rounded-l-lg"
          style={{
            borderColor:
              inAppNotificationsJson[inAppNotifications[0].notificationTypeId]
                .color || "#101119b0",
          }}
        >
          <Text
            className="text-md font-bold text-nowrap"
            style={{
              color:
                inAppNotificationsJson[inAppNotifications[0].notificationTypeId]
                  .color || "#101119b0",
            }}
          >
            {inAppNotifications[0].message}
          </Text>
        </View>
      )}
    </View>
  );
};

export default InAppNotification;
