import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";
export const newEmptyTransaction = () => {
  return {
    type: "",
    fee: 0,
    style: { backgroundColor: "#f7f7f7" },
  };
};

export const daTxTypeId = 101;
export const proofTxTypeId = 102;

export const getChainIcons = (chain: number) => {
  const layerIcons: any = {
    0: {
      Transfer: transferIcon,
      Segwit: segwitIcon,
      Blobs: blobIcon,
      Runes: runesIcon,
      Dapp: dappIcon,
      L2: l2BatchIcon,
      PowSwap: powSwapIcon,
      ClosedOcean: closedOceanIcon,
      Pave: paveIcon,
      Libra: libraIcon,
      "Crypto Dragons": cryptoDragonsIcon,
    },
    1: {
      Transfer: transferIcon,
      Bridge: transferIcon,
      Oracles: oracleIcon,
      Attestations: attestationIcon,
      Dapp: dappIcon,
      AppChain: dojoIcon,
      AVNU: avnuIcon,
      "art/peace": artPeaceIcon,
      Vesu: vesuIcon,
      Eternum: eternumIcon,
    },
  };
  return layerIcons[chain];
};

export const getTxIcon = (
  chainId: number,
  txTypeId: number,
  isDapp?: boolean,
) => {
  switch (chainId) {
    case 0:
      switch (txTypeId) {
        case 0:
          return "tx.icon.tx";
        case 1:
          return "tx.icon.tx";
        case 2:
          return "tx.icon.blob";
        case 3:
          return "tx.icon.nft";
        case 4:
          return "tx.icon.runes";
        default:
          return "unknown";
      }
    case 1:
      switch (txTypeId) {
        case 0:
          return "tx.icon.bridge";
        case 1:
          return "tx.icon.tx";
        case 2:
          return "tx.icon.nft";
        case 3:
          return "tx.icon.isa";
        case 4:
          return "tx.icon.dao";
        default:
          return "unknown";
      }
    default:
      return "unknown";
  }
};

export const getTxStyle = (
  chainId: number,
  txTypeId: number,
  isDapp?: boolean,
) => {
  // TODO: Hardcoded for now, need to be dynamic
  if (txTypeId === 101) {
    return {
      backgroundColor: "#f7f7f7f0",
    };
  } else if (txTypeId === 102) {
    return {
      backgroundColor: "#f7f7f7f0",
    };
  }
  if (isDapp) {
    const dappMeta =
      chainId === 0
        ? dappsJson.L1.transactions[txTypeId]
        : dappsJson.L2.transactions[txTypeId];
    return {
      backgroundColor: dappMeta.color || "#f7f7f7",
    };
  }
  const txMeta =
    chainId === 0
      ? transactionsJson.L1[txTypeId]
      : transactionsJson.L2[txTypeId];
  return {
    backgroundColor: txMeta.color || "#f7f7f7",
  };
};

// Above as import
export const createTx = (
  chain: number,
  txTypeId: number,
  txFee: number,
  txIcon?: string,
) => {
  const txMeta =
    chain === 1 ? transactionsJson.L1[txTypeId] : transactionsJson.L2[txTypeId];
  const image = txIcon || getTxIcon(chain, txTypeId);
  return {
    type: txMeta.name,
    fee: txFee,
    style: { backgroundColor: txMeta.color },
    image: image,
  };
};
