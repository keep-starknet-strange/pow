import { Observer, EventType } from "../context/EventManager";
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
      this.setVisible(false),
    );
    // TODO: add some steps for the store here?
    this.handlers.set("L2Purchased-purchaseSpeedUpgrade", () =>
      this.advanceStep(),
    );
    this.handlers.set("SequenceDone-L2Upgrade", () => this.advanceStep());
    this.handlers.set("DaDone-dataAvailability", () => this.advanceStep());
    // …and you can add more here without changing onNotify
  }

  async onNotify(eventName: EventType, data?: any): Promise<void> {
    if (data?.name == "Store") {
      eventName = eventName + "-" + data.name;
    }
    const handler = this.handlers.get(`${eventName}-${this.step}`);
    if (handler) {
      handler();
      return;
    }
  }
}
