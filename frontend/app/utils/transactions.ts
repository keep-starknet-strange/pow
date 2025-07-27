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

export const getTxIcon = (chainId: number, typeId: number, isDapp: boolean, getImage: (name: string) => any) => {
  return getImage(getTxIconName(chainId, typeId, isDapp));
};

export const getTxIconName = (chainId: number, typeId: number, isDapp?: boolean) => {
  switch (chainId) {
    case 0:
      switch (typeId) {
        case 0:
          return "block.icon.tx";
        case 1:
          return "block.icon.tx";
        case 2:
          return "block.icon.blob";
        case 3:
          return "block.icon.nft";
        case 4:
          return "block.icon.nft";
        default:
          return "unknown";
      }
    case 1:
      switch (typeId) {
        case 0:
          return "block.icon.tx";
        case 1:
          return "block.icon.tx";
        case 2:
          return "block.icon.blob";
        case 3:
          return "block.icon.nft";
        case 4:
          return "block.icon.nft";
        default:
          return "unknown";
      }
    default:
      return "unknown";
  }
}

export const getTxImg = (chainId: number, typeId: number, getImage: (name: string) => any) => {
  switch (chainId) {
    case 0:
      switch (typeId) {
        case 0:
          return getImage("block.bg.green");
        case 1:
          return getImage("block.bg.yellow");
        case 2:
          return getImage("block.bg.blue");
        case 3:
          return getImage("block.bg.pink");
        case 4:
          return getImage("block.bg.purple");
        default:
          return getImage("unknown");
      }
    case 1:
      switch (typeId) {
        case 0:
          return getImage("block.bg.blue");
        case 1:
          return getImage("block.bg.green");
        case 2:
          return getImage("block.bg.pink");
        case 3:
          return getImage("block.bg.purple");
        case 4:
          return getImage("block.bg.yellow");
        default:
          return getImage("unknown");
      }
    default:
      return getImage("unknown");
  }
};

export const getTxBg = (chainId: number, txId: number, isDapp: boolean, getImage: (name: string) => any) => {
  switch (chainId) {
    case 0:
      switch (txId) {
        case 0:
          return getImage("tx.button.bg.green");
        case 1:
          return getImage("tx.button.bg.yellow");
        case 2:
          return getImage("tx.button.bg.blue");
        case 3:
          return getImage("tx.button.bg.pink");
        case 4:
          return getImage("tx.button.bg.purple");
        default:
          return getImage("tx.button.bg.green");
      }
    case 1:
      switch (txId) {
        case 0:
          return getImage("tx.button.bg.purple");
        case 1:
          return getImage("tx.button.bg.green");
        case 2:
          return getImage("tx.button.bg.yellow");
        case 3:
          return getImage("tx.button.bg.blue");
        case 4:
          return getImage("tx.button.bg.pink");
        default:
          return getImage("tx.button.bg.green");
      }
    default:
      return getImage("tx.button.bg.green");
  }
};

// TODO: Change getImage dependency
export const getTxInner = (chainId: number, txId: number, isDapp: boolean, getImage: (name: string) => any) => {
  switch (chainId) {
    case 0:
      switch (txId) {
        case 0:
          return getImage("tx.button.inner.green");
        case 1:
          return getImage("tx.button.inner.yellow");
        case 2:
          return getImage("tx.button.inner.blue");
        case 3:
          return getImage("tx.button.inner.pink");
        case 4:
          return getImage("tx.button.inner.purple");
        default:
          return getImage("tx.button.inner.green");
      }
    case 1:
      switch (txId) {
        case 0:
          return getImage("tx.button.inner.purple");
        case 1:
          return getImage("tx.button.inner.green");
        case 2:
          return getImage("tx.button.inner.yellow");
        case 3:
          return getImage("tx.button.inner.blue");
        case 4:
          return getImage("tx.button.inner.pink");
        default:
          return getImage("tx.button.inner.green");
      }
    default:
      return getImage("tx.button.inner.green");
  }
};

export const getTxNameplate = (chainId: number, txId: number, isDapp: boolean, getImage: (name: string) => any) => {
  switch (chainId) {
    case 0:
      switch (txId) {
        case 0:
          return getImage("tx.nameplate.green");
        case 1:
          return getImage("tx.nameplate.yellow");
        case 2:
          return getImage("tx.nameplate.blue");
        case 3:
          return getImage("tx.nameplate.pink");
        case 4:
          return getImage("tx.nameplate.purple");
        default:
          return getImage("tx.nameplate.green");
      }
    case 1:
      switch (txId) {
        case 0:
          return getImage("tx.nameplate.purple");
        case 1:
          return getImage("tx.nameplate.green");
        case 2:
          return getImage("tx.nameplate.yellow");
        case 3:
          return getImage("tx.nameplate.blue");
        case 4:
          return getImage("tx.nameplate.pink");
        default:
          return getImage("tx.nameplate.green");
      }
    default:
      return getImage("tx.nameplate.green");
  }
};
