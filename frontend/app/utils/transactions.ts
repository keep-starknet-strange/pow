import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";
import upgradesJson from "../configs/upgrades.json";
import automationsJson from "../configs/automations.json";
export const newEmptyTransaction = () => {
  return {
    type: "",
    fee: 0,
    style: { backgroundColor: "#f7f7f7" },
  };
};

export const daTxTypeId = 101;
export const proofTxTypeId = 102;

export const getBlockTxIcon = (
  chainId: number,
  typeId: number,
  isDapp: boolean,
  getImage: (name: string) => any,
) => {
  return getImage(getBlockTxIconName(chainId, typeId, isDapp));
};

export const getBlockTxIconName = (
  chainId: number,
  typeId: number,
  isDapp?: boolean,
) => {
  const txData = isDapp
    ? chainId === 0
      ? dappsJson.L1.transactions[typeId]
      : dappsJson.L2.transactions[typeId]
    : chainId === 0
      ? transactionsJson.L1[typeId]
      : transactionsJson.L2[typeId];
  if (!txData) return "block.icon.tx";
  return `block.icon.${txData.slug}`;
};

export const getTxIcon = (
  chainId: number,
  typeId: number,
  isDapp: boolean,
  getImage: (name: string) => any,
) => {
  return getImage(getTxIconName(chainId, typeId, isDapp));
};

export const getTxIconName = (
  chainId: number,
  typeId: number,
  isDapp: boolean,
) => {
  const txData = isDapp
    ? chainId === 0
      ? dappsJson.L1.transactions[typeId]
      : dappsJson.L2.transactions[typeId]
    : chainId === 0
      ? transactionsJson.L1[typeId]
      : transactionsJson.L2[typeId];
  if (!txData) return "tx.icon.tx";
  return `tx.icon.${txData.slug}`;
};

export const getTxImg = (
  chainId: number,
  typeId: number,
  isDapp: boolean,
  getImage: (name: string) => any,
) => {
  const txData = isDapp
    ? chainId === 0
      ? dappsJson.L1.transactions[typeId]
      : dappsJson.L2.transactions[typeId]
    : chainId === 0
      ? transactionsJson.L1[typeId]
      : transactionsJson.L2[typeId];
  if (!txData) return getImage("block.bg.green");
  return getImage(`block.bg.${txData.color}`);
};

export const getTxBg = (
  chainId: number,
  txId: number,
  isDapp: boolean,
  getImage: (name: string) => any,
) => {
  const txData = isDapp
    ? chainId === 0
      ? dappsJson.L1.transactions[txId]
      : dappsJson.L2.transactions[txId]
    : chainId === 0
      ? transactionsJson.L1[txId]
      : transactionsJson.L2[txId];
  if (!txData) return getImage("tx.button.bg.green");
  return getImage(`tx.button.bg.${txData.color}`);
};

export const getTxInner = (
  chainId: number,
  txId: number,
  isDapp: boolean,
  getImage: (name: string) => any,
) => {
  const txData = isDapp
    ? chainId === 0
      ? dappsJson.L1.transactions[txId]
      : dappsJson.L2.transactions[txId]
    : chainId === 0
      ? transactionsJson.L1[txId]
      : transactionsJson.L2[txId];
  if (!txData) return getImage("tx.button.inner.green");
  return getImage(`tx.button.inner.${txData.color}`);
};

export const getTxNameplate = (
  chainId: number,
  txId: number,
  isDapp: boolean,
  getImage: (name: string) => any,
) => {
  const txData = isDapp
    ? chainId === 0
      ? dappsJson.L1.transactions[txId]
      : dappsJson.L2.transactions[txId]
    : chainId === 0
      ? transactionsJson.L1[txId]
      : transactionsJson.L2[txId];
  if (!txData) return getImage("tx.nameplate.green");
  return getImage(`tx.nameplate.${txData.color}`);
};

export const getShopIconBackground = (
  chainId: number,
  txId: number,
  isDapp: boolean,
) => {
  const txData = isDapp
    ? chainId === 0
      ? dappsJson.L1.transactions[txId]
      : dappsJson.L2.transactions[txId]
    : chainId === 0
      ? transactionsJson.L1[txId]
      : transactionsJson.L2[txId];
  if (!txData) return `shop.icon.bg.green`;
  return `shop.icon.bg.${txData.color}`;
};

export const getTxColor = (
  chainId: number,
  txId: number,
  isDapp: boolean,
): string => {
  const txData = isDapp
    ? chainId === 0
      ? dappsJson.L1.transactions[txId]
      : dappsJson.L2.transactions[txId]
    : chainId === 0
      ? transactionsJson.L1[txId]
      : transactionsJson.L2[txId];
  return txData?.color || "green";
};

export const getUpgradeShopIconBackground = (
  chainId: number,
  upgradeId: number,
): string => {
  const upgradeData =
    chainId === 0 ? upgradesJson.L1[upgradeId] : upgradesJson.L2[upgradeId];
  if (!upgradeData) return `shop.icon.bg.green`;
  return `shop.icon.bg.${upgradeData.color}`;
};

export const getAutomationShopIconBackground = (
  chainId: number,
  automationId: number,
): string => {
  const automationData =
    chainId === 0
      ? automationsJson.L1[automationId]
      : automationsJson.L2[automationId];
  if (!automationData) return `shop.icon.bg.green`;
  return `shop.icon.bg.${automationData.color}`;
};
