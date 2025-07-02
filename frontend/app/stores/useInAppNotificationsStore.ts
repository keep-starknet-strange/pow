import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import inAppNotificationsJson from "../configs/inAppNotifications.json";

export type InAppNotificationType = {
  id: string;
  notificationTypeId: number;
  message: string;
};

interface InAppNotificationsState {
  inAppNotifications: InAppNotificationType[];
  sendInAppNotification: (notificationTypeId: number, message?: string) => void;
  clearInAppNotification: (id: string) => void;
}

export const useInAppNotificationsStore = create<InAppNotificationsState>(
  (set) => ({
    inAppNotifications: [],

    sendInAppNotification: (notificationTypeId: number, message?: string) => {
      const notificationLimit = 5;

      set((state) => {
        const notifMsg =
          message ||
          inAppNotificationsJson[notificationTypeId]?.message ||
          "Unknown notification type";

        const newNotification: InAppNotificationType = {
          id: uuidv4(),
          notificationTypeId,
          message: notifMsg,
        };

        if (state.inAppNotifications.length >= notificationLimit) {
          return {
            inAppNotifications: [
              ...state.inAppNotifications.slice(1),
              newNotification,
            ],
          };
        }

        return {
          inAppNotifications: [...state.inAppNotifications, newNotification],
        };
      });
    },

    clearInAppNotification: (id: string) => {
      set((state) => ({
        inAppNotifications: state.inAppNotifications.filter((n) => n.id !== id),
      }));
    },
  }),
);

export const useInAppNotifications = () => {
  const { inAppNotifications, sendInAppNotification, clearInAppNotification } =
    useInAppNotificationsStore();

  return {
    inAppNotifications,
    sendInAppNotification,
    clearInAppNotification,
  };
};
