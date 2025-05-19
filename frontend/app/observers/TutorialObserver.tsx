import { Observer, EventType } from '../context/EventManager'
import { TutorialStep } from '../context/Tutorial';

type Handler = () => void;

export class TutorialObserver implements Observer {
  private handlers = new Map<string, Handler>();

  constructor(
    private advanceStep: () => void,
    private setVisible: (visible: boolean) => void,
    private step: TutorialStep
  ) {
    this.handlers.set(`MineClicked-mineBlock`,                    ()=> this.setVisible(false));
    this.handlers.set(`MineDone-mineBlock`,                       ()=> { this.advanceStep(); this.setVisible(true); });
    this.handlers.set(`TxUpgradePurchased-purchaseTransactions`,  ()=> this.advanceStep());
    this.handlers.set(`TxAdded-addTransactionsToBlock`,           ()=> this.setVisible(false));
    this.handlers.set('MineDone-addTransactionsToBlock',          ()=> this.advanceStep());
    this.handlers.set('StoreTabClicked-checkStore',               ()=> this.advanceStep());
    this.handlers.set('TxUpgradePurchased-purchaseFeeUpgrade',    ()=> this.advanceStep());
    this.handlers.set('TxUpgradePurchased-purchaseSpeedUpgrade',  ()=> this.advanceStep());
    // …and you can add more here without changing onNotify
  }
  
  onNotify(eventName: EventType, data?: any): void {
    console.log("handler", eventName, this.step);
    const handler = this.handlers.get(`${eventName}-${this.step}`);
    console.log("handler", handler);
    if (handler) {
      handler();
      return;
    }
  }
}
