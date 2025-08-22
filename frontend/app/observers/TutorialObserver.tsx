import { Observer, EventType } from "@/app/stores/useEventManager";
import { useTutorialStore } from "../stores/useTutorialStore";

type Handler = () => void;

export class TutorialObserver implements Observer {
  private handlers = new Map<string, Handler>();

  constructor() {
    // Setup handlers - they will get current store state when called
    // each step is triggered by an event + some data maybe and the previous step

    // mineBlock step
    this.handlers.set(`MineClicked-mineBlock`, () => {
      const { setVisible } = useTutorialStore.getState();
      setVisible(false);
    });

    // balanceExplanation step
    this.handlers.set(`MineDone-mineBlock`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // purchaseTransactions step
    this.handlers.set(`TutorialDismissed-balanceExplanation`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // addTransactionsToBlock step
    this.handlers.set(`TxUpgradePurchased-purchaseTransactions`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set(`TxAdded-addTransactionsToBlock`, () => {
      const { setVisible } = useTutorialStore.getState();
      // break in tutorial
      setVisible(false);
    });

    // finishMiningBlock step
    this.handlers.set("BlockIsBuilt-addTransactionsToBlock", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // checkStore step
    this.handlers.set("MineDone-finishMiningBlock", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // purchaseFeeUpgrade step
    this.handlers.set("SwitchPage-Store-checkStore", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // purchaseSpeedUpgrade step purchase the upgrade or click got it
    this.handlers.set(`TutorialDismissed-purchaseFeeUpgrade`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("TxUpgradePurchased-purchaseFeeUpgrade", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // purchaseChainUpgrade tab step if they purchase the upgrade or click got it
    this.handlers.set(`TutorialDismissed-purchaseSpeedUpgrade`, () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("TxUpgradePurchased-purchaseSpeedUpgrade", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // purchaseChainAutomation step if they purchase the upgrade or click got it
    this.handlers.set("SwitchStore-Upgrades-purchaseChainUpgrade", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchStore-Automation-purchaseChainAutomation", () => {
      const { setVisible } = useTutorialStore.getState();
      setVisible(false);
    });

    // checkAchievements step
    this.handlers.set("MineDone-2-purchaseChainAutomation", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchPage-Achievements-checkAchievements", () => {
      const { setVisible } = useTutorialStore.getState();
      // break in tutorial
      setVisible(false);
    });

    // dapps step
    this.handlers.set("DappsPurchased-checkAchievements", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    this.handlers.set("SwitchTxTab-dApps-dapps", () => {
      const { setVisible } = useTutorialStore.getState();
      // break in tutorial
      setVisible(false);
    });

    // leaderboard step
    this.handlers.set("TxUpgradePurchased-3-dapps", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });
    this.handlers.set("SwitchPage-Leaderboard-leaderboard", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // L2Upgrade step
    this.handlers.set("L2Purchased-leaderboard", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // prover step
    this.handlers.set("SequenceDone-L2Upgrade", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // dataAvailability step
    this.handlers.set("ProveDone-prover", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // l2Store step
    this.handlers.set("DaDone-dataAvailability", () => {
      const { advanceStep } = useTutorialStore.getState();
      advanceStep();
    });

    // l2StoreTab step
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

    // this is the first achievement event
    if (eventName === "MineDone") {
      if (data.block?.blockId === 2) {
        eventName = eventName + "-" + data.block?.blockId;
      }
    }

    // Leaderboard event
    if (eventName === "TxUpgradePurchased") {
      if (data.txId === 3 && data.chainId === 0 && data.isDapp) {
        eventName = eventName + "-" + data.txId;
      }
    }

    const handler = this.handlers.get(`${eventName}-${step}`);
    if (handler) {
      handler();
      return;
    }
  }
}
