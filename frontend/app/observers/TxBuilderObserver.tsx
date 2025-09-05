import { Observer, EventType } from "@/app/stores/useEventManager";
import transactionsJson from "../configs/transactions.json";
import { Call } from "starknet";
import { daTxTypeId, proofTxTypeId } from "../utils/transactions";
import { useOnchainActions } from "@/app/stores/useOnchainActions";

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
  private contractAddress: string;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  setContractAddress(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  async onNotify(eventType: EventType, data?: any): Promise<void> {
    const { addAction } = useOnchainActions.getState();
    if (!this.contractAddress) {
      return;
    }

    if (eventType === "TxAdded" && data?.tx) {
      if (data.tx.isDapp) {
        // Offset the txId by the number of tx types to get the correct txId for the dapp
        const txTypes =
          data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
        const txTypeCount = txTypes.length;
        addAction(
          createAddTransactionCall(
            this.contractAddress,
            data.chainId,
            txTypeCount + data.tx.typeId,
          ),
        );
      } else {
        addAction(
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
      case "MineDone":
        if (data.ignoreAction) return;
        addAction(createMineBlockCall(this.contractAddress, 0));
        break;
      case "SequenceClicked":
      case "SequenceDone":
        if (data.ignoreAction) return;
        addAction(createMineBlockCall(this.contractAddress, 1));
        break;
      case "DaClicked":
      case "DaDone":
        addAction(createStoreDaCall(this.contractAddress, 1));
        break;
      case "ProveClicked":
      case "ProveDone":
        addAction(createProveCall(this.contractAddress, 1));
        break;
      case "TxUpgradePurchased":
        if (data.type === "txFee") {
          addAction(
            createBuyTxFeeCall(this.contractAddress, data.chainId, data.txId),
          );
        } else if (data.type === "txSpeed") {
          addAction(
            createBuyTxSpeedCall(this.contractAddress, data.chainId, data.txId),
          );
        } else if (data.type === "dappFee") {
          // Offset the txId by the number of tx types to get the correct txId for the dapp
          const txTypes =
            data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
          const txTypeCount = txTypes.length;
          addAction(
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
          addAction(
            createBuyTxSpeedCall(
              this.contractAddress,
              data.chainId,
              txTypeCount + data.txId,
            ),
          );
        } else {
          if (__DEV__) console.error("Unknown tx upgrade type:", data.type);
        }
        break;
      case "UpgradePurchased":
        addAction(
          createBuyUpgradeCall(
            this.contractAddress,
            data.chainId,
            data.upgradeId,
          ),
        );
        break;
      case "AutomationPurchased":
        addAction(
          createBuyAutomationCall(
            this.contractAddress,
            data.chainId,
            data.automationId,
          ),
        );
        break;
      case "DappsPurchased":
        addAction(createBuyDappsCall(this.contractAddress, data.chainId));
        break;
      case "L2Purchased":
        addAction(createBuyNextChainCall(this.contractAddress));
        break;
      case "PrestigePurchased":
        // Handled via direct invoke to avoid multicall bundling
        break;
      default:
        break;
    }
  }
}
