import { Observer, EventType } from "@/app/stores/useEventManager";
import inAppNotificationsJson from "../configs/inAppNotifications.json";

export class InAppNotificationsObserver implements Observer {
  sendNotification: (noticicationTypeId: number, message?: string) => void;
  private blockFullAttempts: number = 0; // Counter for consecutive BlockFull attempts

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
        // Increment consecutive block full attempts
        this.blockFullAttempts++;
        
        // Only show notification after 3 consecutive attempts
        if (this.blockFullAttempts >= 3) {
          const typeId =
            inAppNotificationsJson.find(
              (notification) => notification.eventType === "BlockFull",
            )?.id || 0;
          this.sendNotification(typeId);
          this.blockFullAttempts = 0; // Reset counter after showing notification
        }
        break;
      }
      case "TxAdded":
      case "ItemPurchased":
      case "UpgradePurchased":
      case "AutomationPurchased": {
        // Reset block full attempts counter when these successful events occur
        this.blockFullAttempts = 0;
        break;
      }
      default:
        break;
    }
  }
}
