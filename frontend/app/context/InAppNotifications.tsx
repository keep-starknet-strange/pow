import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import inAppNotificationsJson from "../configs/inAppNotifications.json";

export type InAppNotificationType = {
  notificationTypeId: number;
  message: string;
};

type InAppNotificationsContextType = {
  inAppNotifications: InAppNotificationType[];
  sendInAppNotification: (notificationTypeId: number, message?: string) => void;
};

const InAppNotificationsContext = React.createContext<
  InAppNotificationsContextType | undefined
>(undefined);

export const useInAppNotifications = () => {
  const context = useContext(InAppNotificationsContext);
  if (!context) {
    throw new Error(
      "useInAppNotifications must be used within an InAppNotificationsProvider",
    );
  }
  return context;
};

export const InAppNotificationsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [inAppNotifications, setInAppNotifications] = useState<
    InAppNotificationType[]
  >([]);

  const notificationLimit = 5;
  const sendInAppNotification = useCallback(
    (notificationTypeId: number, message?: string) => {
      // Add a new notification to the state ( and remove the oldest one if the limit is reached )
      setInAppNotifications((prev) => {
        const notifMsg =
          message ||
          inAppNotificationsJson[notificationTypeId].message ||
          "Unknown notification type";
        const newNotification = { notificationTypeId, message: notifMsg };
        if (prev.length >= notificationLimit) {
          // Remove the oldest notification
          return [...prev.slice(1), newNotification];
        }
        return [...prev, newNotification];
      });
    },
    [],
  );

  useEffect(() => {
    // Clear notifications after a certain period
    const timer = setTimeout(() => {
      setInAppNotifications((prev) => {
        // Trim the oldest notification
        if (prev.length > 0) {
          return prev.slice(1);
        }
        return prev;
      });
    }, 1500); // Adjust the timeout duration as needed

    return () => clearTimeout(timer);
  }, [inAppNotifications]);

  return (
    <InAppNotificationsContext.Provider
      value={{ inAppNotifications, sendInAppNotification }}
    >
      {children}
    </InAppNotificationsContext.Provider>
  );
};
