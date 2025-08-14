import { Observer, EventType } from "@/app/stores/useEventManager";
import { Block } from "../types/Chains";
import transactionsJson from "../configs/transactions.json";
import { Call } from "starknet";
import { daTxTypeId, proofTxTypeId } from "../utils/transactions";

export const createAddTransactionCall = (
  contractAddress: string,
  chainId: number,
  txTypeId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "add_transaction",
    calldata: [chainId, txTypeId],
  };
};

export const createMineBlockCall = (
  contractAddress: string,
  chainId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "mine_block",
    calldata: [chainId],
  };
};

export const createStoreDaCall = (
  contractAddress: string,
  chainId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "store_da",
    calldata: [chainId],
  };
};

export const createProveCall = (
  contractAddress: string,
  chainId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "prove",
    calldata: [chainId],
  };
};

export const createBuyTxFeeCall = (
  contractAddress: string,
  chainId: number,
  txTypeId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "buy_tx_fee",
    calldata: [chainId, txTypeId],
  };
};

export const createBuyTxSpeedCall = (
  contractAddress: string,
  chainId: number,
  txTypeId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "buy_tx_speed",
    calldata: [chainId, txTypeId],
  };
};

export const createBuyUpgradeCall = (
  contractAddress: string,
  chainId: number,
  upgradeId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "buy_upgrade",
    calldata: [chainId, upgradeId],
  };
};

export const createBuyAutomationCall = (
  contractAddress: string,
  chainId: number,
  automationId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "buy_automation",
    calldata: [chainId, automationId],
  };
};

export const createBuyDappsCall = (
  contractAddress: string,
  chainId: number,
): Call => {
  return {
    contractAddress,
    entrypoint: "buy_dapps",
    calldata: [chainId],
  };
};

export const createBuyNextChainCall = (contractAddress: string): Call => {
  return {
    contractAddress,
    entrypoint: "buy_next_chain",
    calldata: [],
  };
};

export const createBuyPrestigeCall = (contractAddress: string): Call => {
  return {
    contractAddress,
    entrypoint: "buy_prestige",
    calldata: [],
  };
};

export class TxBuilderObserver implements Observer {
  private addAction: (call: Call) => void;
  private contractAddress: string;

  constructor(addAction: (call: Call) => void, contractAddress: string) {
    this.addAction = addAction;
    this.contractAddress = contractAddress;
  }

  setContractAddress(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  async onNotify(eventType: EventType, data?: any): Promise<void> {
    if (!this.contractAddress) {
      console.warn("TxBuilderObserver: No contract address set");
      return;
    }

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
          createAddTransactionCall(
            this.contractAddress,
            data.chainId,
            txTypeCount + data.tx.typeId,
          ),
        );
      } else {
        this.addAction(
          createAddTransactionCall(
            this.contractAddress,
            data.chainId,
            data.tx.typeId,
          ),
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
        this.addAction(createMineBlockCall(this.contractAddress, 0));
        break;
      case "SequenceClicked":
        if (data.ignoreAction) return;
        this.addAction(createMineBlockCall(this.contractAddress, 1));
        break;
      case "DaClicked":
        this.addAction(createStoreDaCall(this.contractAddress, 1));
        break;
      case "ProveClicked":
        this.addAction(createProveCall(this.contractAddress, 1));
        break;
      case "TxUpgradePurchased":
        if (data.type === "txFee") {
          this.addAction(
            createBuyTxFeeCall(this.contractAddress, data.chainId, data.txId),
          );
        } else if (data.type === "txSpeed") {
          this.addAction(
            createBuyTxSpeedCall(this.contractAddress, data.chainId, data.txId),
          );
        } else if (data.type === "dappFee") {
          // Offset the txId by the number of tx types to get the correct txId for the dapp
          const txTypes =
            data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
          const txTypeCount = txTypes.length;
          this.addAction(
            createBuyTxFeeCall(
              this.contractAddress,
              data.chainId,
              txTypeCount + data.txId,
            ),
          );
        } else if (data.type === "dappSpeed") {
          const txTypes =
            data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
          const txTypeCount = txTypes.length;
          this.addAction(
            createBuyTxSpeedCall(
              this.contractAddress,
              data.chainId,
              txTypeCount + data.txId,
            ),
          );
        } else {
          console.error("Unknown tx upgrade type:", data.type);
        }
        break;
      case "UpgradePurchased":
        this.addAction(
          createBuyUpgradeCall(
            this.contractAddress,
            data.chainId,
            data.upgradeId,
          ),
        );
        break;
      case "AutomationPurchased":
        this.addAction(
          createBuyAutomationCall(
            this.contractAddress,
            data.chainId,
            data.automationId,
          ),
        );
        break;
      case "DappsPurchased":
        this.addAction(createBuyDappsCall(this.contractAddress, data.chainId));
        break;
      case "L2Purchased":
        this.addAction(createBuyNextChainCall(this.contractAddress));
        break;
      case "PrestigePurchased":
        this.addAction(createBuyPrestigeCall(this.contractAddress));
        break;
      default:
        break;
    }
  }
}
