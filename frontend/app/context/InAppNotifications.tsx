import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import inAppNotificationsJson from "../configs/inAppNotifications.json";
import { v4 as uuidv4 } from "uuid";

export type InAppNotificationType = {
  id: string;
  notificationTypeId: number;
  message: string;
};

type InAppNotificationsContextType = {
  inAppNotifications: InAppNotificationType[];
  sendInAppNotification: (notificationTypeId: number, message?: string) => void;
  clearInAppNotification: (id: string) => void;
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
        const newNotification = {
          id: uuidv4(),
          notificationTypeId,
          message: notifMsg,
        };
        if (prev.length >= notificationLimit) {
          // Remove the oldest notification
          return [...prev.slice(1), newNotification];
        }
        return [...prev, newNotification];
      });
    },
    [],
  );

  const clearInAppNotification = useCallback((id: string) => {
    setInAppNotifications((prev) => {
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  return (
    <InAppNotificationsContext.Provider
      value={{
        inAppNotifications,
        sendInAppNotification,
        clearInAppNotification,
      }}
    >
      {children}
    </InAppNotificationsContext.Provider>
  );
};
