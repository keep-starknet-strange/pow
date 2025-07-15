import { Observer, EventType } from "../context/EventManager";
import inAppNotificationsJson from "../configs/inAppNotifications.json";

export class InAppNotificationsObserver implements Observer {
  sendNotification: (noticicationTypeId: number, message?: string) => void;

  constructor(
    sendNotification: (noticicationTypeId: number, message?: string) => void,
  ) {
    this.sendNotification = sendNotification;
  }

  onNotify(eventName: EventType, data?: any): void {
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
      default:
        break;
    }
  }
}
