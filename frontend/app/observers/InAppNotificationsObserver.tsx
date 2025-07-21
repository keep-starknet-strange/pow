import { Observer, EventType } from "@/app/stores/useEventManager";
import inAppNotificationsJson from "../configs/inAppNotifications.json";

export class InAppNotificationsObserver implements Observer {
  sendNotification: (noticicationTypeId: number, message?: string) => void;

  constructor(
    sendNotification: (noticicationTypeId: number, message?: string) => void,
  ) {
    this.sendNotification = sendNotification;
  }

  async onNotify(eventName: EventType, data?: any): Promise<void> {
    switch (eventName) {
      case "BuyFailed": {
        const typeId =
          inAppNotificationsJson.find(
            (notification) => notification.eventType === "BuyFailed",
          )?.id || 0;
        this.sendNotification(typeId);
        break;
      }
      case "InvalidPurchase": {
        const typeId =
          inAppNotificationsJson.find(
            (notification) => notification.eventType === "InvalidPurchase",
          )?.id || 0;
        this.sendNotification(typeId);
        break;
      }
      case "BlockFull": {
        const typeId =
          inAppNotificationsJson.find(
            (notification) => notification.eventType === "BlockFull",
          )?.id || 0;
        this.sendNotification(typeId);
        break;
      }
      default:
        break;
    }
  }
}
