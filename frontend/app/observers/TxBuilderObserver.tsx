import { Observer, EventType } from "@/app/stores/useEventManager";
import { Block } from "../types/Chains";
import transactionsJson from "../configs/transactions.json";
import { PowAction } from "../context/PowContractConnector";
import { daTxTypeId, proofTxTypeId } from "../utils/transactions";

export const createAddTransactionAction = (
  chainId: number,
  txTypeId: number,
): PowAction => {
  return {
    action: "add_transaction",
    args: [chainId, txTypeId],
  };
};

export const createMineBlockAction = (chainId: number): PowAction => {
  return {
    action: "mine_block",
    args: [chainId],
  };
};

export const createStoreDaAction = (chainId: number): PowAction => {
  return {
    action: "store_da",
    args: [chainId],
  };
};

export const createProveAction = (chainId: number): PowAction => {
  return {
    action: "prove",
    args: [chainId],
  };
};

export const createBuyTxFeeAction = (
  chainId: number,
  txTypeId: number,
): PowAction => {
  return {
    action: "buy_tx_fee",
    args: [chainId, txTypeId],
  };
};

export const createBuyTxSpeedAction = (
  chainId: number,
  txTypeId: number,
): PowAction => {
  return {
    action: "buy_tx_speed",
    args: [chainId, txTypeId],
  };
};

export const createBuyUpgradeAction = (
  chainId: number,
  upgradeId: number,
): PowAction => {
  return {
    action: "buy_upgrade",
    args: [chainId, upgradeId],
  };
};

export const createBuyAutomationAction = (
  chainId: number,
  automationId: number,
): PowAction => {
  return {
    action: "buy_automation",
    args: [chainId, automationId],
  };
};

export const createBuyDappsAction = (chainId: number): PowAction => {
  return {
    action: "buy_dapps",
    args: [chainId],
  };
};

export const createBuyNextChainAction = (): PowAction => {
  return {
    action: "buy_next_chain",
    args: [],
  };
};

export const createBuyPrestigeAction = (): PowAction => {
  return {
    action: "buy_prestige",
    args: [],
  };
};

export class TxBuilderObserver implements Observer {
  private addAction: (call: PowAction) => void;

  constructor(
    addAction: (call: PowAction) => void,
  ) {
    this.addAction = addAction;
  }

  async onNotify(eventType: EventType, data?: any): Promise<void> {
    if (eventType === "TxAdded" && data?.tx) {
      // TODO: Temporary work around
      if (data.tx.typeId === proofTxTypeId || data.tx.typeId === daTxTypeId) {
        // Don't add the tx to the multi call if it's a proof or DA tx
        return;
      }
      if (data.tx.isDapp) {
        // Offset the txId by the number of tx types to get the correct txId for the dapp
        const txTypes =
          data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
        const txTypeCount = txTypes.length;
        this.addAction(
          createAddTransactionAction(
            data.chainId,
            txTypeCount + data.tx.typeId,
          ),
        );
      } else {
        this.addAction(
          createAddTransactionAction(data.chainId, data.tx.typeId),
        );
      }
      return;
    }

    switch (eventType) {
      case "TxAdded":
        // Proccessed above in the if statement since this is a special case
        break;
      case "MineClicked":
        if (data.ignoreAction) return;
        this.addAction(createMineBlockAction(0));
        break;
      case "SequenceClicked":
        if (data.ignoreAction) return;
        this.addAction(createMineBlockAction(1));
        break;
      case "DaClicked":
        this.addAction(createStoreDaAction(1));
        break;
      case "ProveClicked":
        this.addAction(createProveAction(1));
        break;
      case "TxUpgradePurchased":
        if (data.type === "txFee") {
          this.addAction(createBuyTxFeeAction(data.chainId, data.txId));
        } else if (data.type === "txSpeed") {
          this.addAction(createBuyTxSpeedAction(data.chainId, data.txId));
        } else if (data.type === "dappFee") {
          // Offset the txId by the number of tx types to get the correct txId for the dapp
          const txTypes =
            data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
          const txTypeCount = txTypes.length;
          this.addAction(
            createBuyTxFeeAction(data.chainId, txTypeCount + data.txId),
          );
        } else if (data.type === "dappSpeed") {
          const txTypes =
            data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
          const txTypeCount = txTypes.length;
          this.addAction(
            createBuyTxSpeedAction(data.chainId, txTypeCount + data.txId),
          );
        } else {
          console.error("Unknown tx upgrade type:", data.type);
        }
        break;
      case "UpgradePurchased":
        this.addAction(createBuyUpgradeAction(data.chainId, data.upgradeId));
        break;
      case "AutomationPurchased":
        this.addAction(
          createBuyAutomationAction(data.chainId, data.automationId),
        );
        break;
      case "DappsPurchased":
        this.addAction(createBuyDappsAction(data.chainId));
        break;
      case "L2Purchased":
        this.addAction(createBuyNextChainAction());
        break;
      case "PrestigePurchased":
        this.addAction(createBuyPrestigeAction());
        break;
      default:
        break;
    }
  }
}
