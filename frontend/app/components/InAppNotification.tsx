import { Text, View } from 'react-native';
import { useInAppNotifications } from '../context/InAppNotifications';
import inAppNotificationsJson from "../configs/inAppNotifications.json";

export const InAppNotification = () => {
  const { inAppNotifications } = useInAppNotifications();

  // TODO: Animation
  // TODO: Improve flow when multiple notifications are present
  return (
    <View className="absolute top-0 right-0 z-[100] w-[65%]">
    {inAppNotifications.length > 0 && (
        <View className="my-2 py-3 px-2 bg-[#ffff8008]
                         border-2 border-r-0 rounded-l-lg"
              style={{
                borderColor: inAppNotificationsJson[inAppNotifications[0].notificationTypeId].color || "#ffff80b0",
              }}
        >
          <Text className="text-md font-bold text-nowrap" 
                style={{
                  color: inAppNotificationsJson[inAppNotifications[0].notificationTypeId].color || "#ffff80b0",
                }}
          >
            {inAppNotifications[0].message}
          </Text>
        </View>
    )}
    </View>
  );
}

export default InAppNotification;
