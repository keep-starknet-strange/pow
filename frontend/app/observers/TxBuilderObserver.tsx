import { Observer, EventType } from "../context/EventManager";
import { Call } from "starknet";
import { Block } from "../types/Chains";
import transactionsJson from "../configs/transactions.json";
import { POW_CONTRACT_ADDRESS } from "../context/StarknetConnector";
import { daTxTypeId, proofTxTypeId } from "../utils/transactions";

export const createAddTransactionCall = (chainId: number, txTypeId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "add_transaction",
    calldata: [chainId, txTypeId],
  };
}

export const createMineBlockCall = (chainId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "mine_block",
    calldata: [chainId],
  };
}

export const createStoreDaCall = (chainId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "store_da",
    calldata: [chainId],
  };
}

export const createProveCall = (chainId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "prove",
    calldata: [chainId],
  };
}

export const createBuyTxFeeCall = (chainId: number, txTypeId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "buy_tx_fee",
    calldata: [chainId, txTypeId],
  };
}

export const createBuyTxSpeedCall = (chainId: number, txTypeId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "buy_tx_speed",
    calldata: [chainId, txTypeId],
  };
}

export const createBuyUpgradeCall = (chainId: number, upgradeId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "buy_upgrade",
    calldata: [chainId, upgradeId],
  };
}

export const createBuyAutomationCall = (chainId: number, automationId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "buy_automation",
    calldata: [chainId, automationId],
  };
}

export const createBuyDappsCall = (chainId: number): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "buy_dapps",
    calldata: [chainId],
  };
}

export const createBuyNextChainCall = (): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "buy_next_chain",
    calldata: [],
  };
}

export const createBuyPrestigeCall = (): Call => {
  return {
    contractAddress: POW_CONTRACT_ADDRESS,
    entrypoint: "buy_prestige",
    calldata: [],
  };
}

export class TxBuilderObserver implements Observer {
  private addToMultiCall: (call: Call) => Promise<void>;
  private getWorkingBlock: (chainId: number) => Block | null;

  constructor(addToMultiCall: (call: Call) => Promise<void>, getWorkingBlock: (chainId: number) => Block | null) {
    this.addToMultiCall = addToMultiCall;
    this.getWorkingBlock = getWorkingBlock;
  }

  onNotify(eventType: EventType, data?: any): void {
    switch (eventType) {
      case 'TxAdded':
        // TODO: Temporary work around
        if (data.tx.typeId === proofTxTypeId || data.tx.typeId === daTxTypeId) {
          // Don't add the tx to the multi call if it's a proof or DA tx
          return;
        }
        if (data.tx.isDapp) {
          // Offset the txId by the number of tx types to get the correct txId for the dapp
          const txTypes = data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
          const txTypeCount = txTypes.length;
          this.addToMultiCall(createAddTransactionCall(data.chainId, txTypeCount + data.tx.typeId));
        } else {
          this.addToMultiCall(createAddTransactionCall(data.chainId, data.tx.typeId));
        }
        break;
      case 'MineClicked':
        if (this.getWorkingBlock(0)?.blockId === 0) return;
        this.addToMultiCall(createMineBlockCall(0));
        break;
      case 'SequenceClicked':
        if (this.getWorkingBlock(1)?.blockId === 0) return;
        this.addToMultiCall(createMineBlockCall(1));
        break;
      case 'DaClicked':
        this.addToMultiCall(createStoreDaCall(1));
        break;
      case 'ProveClicked':
        this.addToMultiCall(createProveCall(1));
        break;
      case 'TxUpgradePurchased':
        if (data.type === 'txFee') {
          this.addToMultiCall(createBuyTxFeeCall(data.chainId, data.txId));
        } else if (data.type === 'txSpeed') {
          this.addToMultiCall(createBuyTxSpeedCall(data.chainId, data.txId));
        } else if (data.type === 'dappFee') {
          // Offset the txId by the number of tx types to get the correct txId for the dapp
          const txTypes = data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
          const txTypeCount = txTypes.length;
          this.addToMultiCall(createBuyTxFeeCall(data.chainId, txTypeCount + data.txId));
        } else if (data.type === 'dappSpeed') {
          const txTypes = data.chainId === 0 ? transactionsJson.L1 : transactionsJson.L2;
          const txTypeCount = txTypes.length;
          this.addToMultiCall(createBuyTxSpeedCall(data.chainId, txTypeCount + data.txId));
        } else {
          console.error('Unknown tx upgrade type:', data.type);
        }
        break;
      case 'UpgradePurchased':
        this.addToMultiCall(createBuyUpgradeCall(data.chainId, data.upgradeId));
        break;
      case 'AutomationPurchased':
        this.addToMultiCall(createBuyAutomationCall(data.chainId, data.automationId));
        break;
      case 'DappsPurchased':
        this.addToMultiCall(createBuyDappsCall(data.chainId));
        break;
      case 'L2Purchased':
        this.addToMultiCall(createBuyNextChainCall());
        break;
      case 'PrestigePurchased':
        this.addToMultiCall(createBuyPrestigeCall());
        break;
      default:
        break;
    }
  }
}
