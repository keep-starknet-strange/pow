import { Observer, EventType } from "@/app/stores/useEventManager";
import { useTutorialStore, TutorialStep } from "../stores/useTutorialStore";

type Handler = () => void;

export class TutorialObserver implements Observer {
  private handlers = new Map<string, Handler>();

  constructor() {
    // Setup handlers - they will get current store state when called
    this.handlers.set(`MineClicked-mineBlock`, () => {
      const { setVisible } = useTutorialStore.getState();
      setVisible(false);
    });
    this.handlers.set(`MineDone-mineBlock`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set(`TutorialDismissed-balanceExplanation`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set(`TxUpgradePurchased-purchaseTransactions`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set(`TutorialDismissed-purchaseFeeUpgrade`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set(`TutorialDismissed-purchaseSpeedUpgrade`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set(`TxAdded-addTransactionsToBlock`, () => {
      const { setVisible } = useTutorialStore.getState();
      setVisible(false);
    });
    this.handlers.set("MineDone-addTransactionsToBlock", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchPage-Store-checkStore", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("TxUpgradePurchased-purchaseFeeUpgrade", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("TxUpgradePurchased-purchaseSpeedUpgrade", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchStore-Upgrades-purchaseChainUpgrade", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchStore-Automation-purchaseChainAutomation", () => {
      const { setVisible } = useTutorialStore.getState();
      setVisible(false);
    });
    this.handlers.set("DappsPurchased-purchaseChainAutomation", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("L2Purchased-dapps", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchTxTab-dApps-dapps", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SequenceDone-L2Upgrade", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("ProveDone-prover", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("DaDone-dataAvailability", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchPage-Store-l2Store", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchStore-L2-l2StoreTab", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
  }

  async onNotify(eventName: EventType, data?: any): Promise<void> {
    // Get current step from store
    const { step } = useTutorialStore.getState();

    if (
      eventName === "SwitchPage" ||
      eventName === "SwitchStore" ||
      eventName === "SwitchTxTab"
    ) {
      if (data?.name) {
        eventName = eventName + "-" + data.name;
      }
    }
    const handler = this.handlers.get(`${eventName}-${step}`);
    if (handler) {
      handler();
      return;
    }
  }
}
