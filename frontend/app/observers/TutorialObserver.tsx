import { Observer, EventType } from "@/app/stores/useEventManager";
import { TutorialStep } from "../stores/useTutorialStore";

type Handler = () => void;

export class TutorialObserver implements Observer {
  private handlers = new Map<string, Handler>();

  constructor(
    private advanceStep: () => void,
    private setVisible: (visible: boolean) => void,
    private step: TutorialStep,
  ) {
    this.handlers.set(`MineClicked-mineBlock`, () => this.setVisible(false));
    this.handlers.set(`MineDone-mineBlock`, () => {
      this.advanceStep();
      this.setVisible(true);
    });
    this.handlers.set(`BalanceTutorialDismissed-balanceExplanation`, () =>
      this.advanceStep(),
    );
    this.handlers.set(`TxUpgradePurchased-purchaseTransactions`, () =>
      this.advanceStep(),
    );
    this.handlers.set(`TxAdded-addTransactionsToBlock`, () =>
      this.setVisible(false),
    );
    this.handlers.set("MineDone-addTransactionsToBlock", () =>
      this.advanceStep(),
    );
    this.handlers.set("SwitchPage-Store-checkStore", () => this.advanceStep());
    this.handlers.set("TxUpgradePurchased-purchaseFeeUpgrade", () =>
      this.advanceStep(),
    );
    this.handlers.set("TxUpgradePurchased-purchaseSpeedUpgrade", () =>
      this.advanceStep(),
    );
    this.handlers.set("SwitchStore-Upgrades-purchaseChainUpgrade", () =>
      this.advanceStep(),
    );
    this.handlers.set("SwitchStore-Automation-purchaseChainAutomation", () =>
      this.setVisible(false),
    );
    this.handlers.set("DappsPurchased-purchaseChainAutomation", () => {
      this.advanceStep();
      this.setVisible(true);
    });
    this.handlers.set("L2Purchased-dapps", () => this.advanceStep());
    this.handlers.set("SwitchTxTab-dApps-dapps", () => this.advanceStep());
    this.handlers.set("SequenceDone-L2Upgrade", () => this.advanceStep());
    this.handlers.set("ProveDone-prover", () => this.advanceStep());
    this.handlers.set("DaDone-dataAvailability", () => this.advanceStep());
    this.handlers.set("SwitchPage-Store-l2Store", () => this.advanceStep());
    this.handlers.set("SwitchStore-L2-l2StoreTab", () => this.advanceStep());
  }

  async onNotify(eventName: EventType, data?: any): Promise<void> {
    if (
      eventName === "SwitchPage" ||
      eventName === "SwitchStore" ||
      eventName === "SwitchTxTab"
    ) {
      if (data?.name) {
        eventName = eventName + "-" + data.name;
      }
    }
    const handler = this.handlers.get(`${eventName}-${this.step}`);
    if (handler) {
      handler();
      return;
    }
  }
}
