import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";
import questionMarkImage from "../../assets/images/questionMark.png";
export const newEmptyTransaction = () => {
  return {
    type: "",
    fee: 0,
    style: { backgroundColor: "#f7f7f7" },
    image: questionMarkImage,
  };
};

export const daTxTypeId = 101;
export const proofTxTypeId = 102;

import * as inscriptionImages from "../configs/inscriptions";
export const getRandomInscriptionImage = () => {
  const images = Object.values(inscriptionImages);
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

import * as nftImages from "../configs/nfts";
export const getRandomNFTImage = () => {
  const images = Object.values(nftImages);
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

export const getChainIcons = (chain: number) => {
  const layerIcons: any = {
    0: {
      Transfer: transferIcon,
      Segwit: segwitIcon,
      Blobs: blobIcon,
      Inscriptions: getRandomInscriptionImage(),
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
      NFTs: getRandomNFTImage(),
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
  // TODO: Hardcoded for now, need to be dynamic
  if (txTypeId === daTxTypeId) {
    return blobIcon;
  } else if (txTypeId === proofTxTypeId) {
    return l2BatchIcon;
  }
  if (isDapp) {
    const dappMeta =
      chainId === 0
        ? dappsJson.L1.transactions[txTypeId]
        : dappsJson.L2.transactions[txTypeId];
    const icons = getChainIcons(chainId);
    return icons?.[dappMeta.name] || questionMarkImage;
  }
  const txMeta =
    chainId === 0
      ? transactionsJson.L1[txTypeId]
      : transactionsJson.L2[txTypeId];
  const icons = getChainIcons(chainId);
  return icons?.[txMeta.name] || questionMarkImage;
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
import transferIcon from "../../assets/images/transaction/transfer.png";
import blobIcon from "../../assets/images/transaction/l2Blob.png";
import segwitIcon from "../../assets/images/transaction/segwit.png";
import runesIcon from "../../assets/images/transaction/runes.png";
import dappIcon from "../../assets/images/transaction/dapp.png";
import l2BatchIcon from "../../assets/images/transaction/l2Batch.png";
import dojoIcon from "../../assets/images/transaction/dojo.png";
import powSwapIcon from "../../assets/images/dapps/powswap.png";
import closedOceanIcon from "../../assets/images/dapps/closedocean.png";
import paveIcon from "../../assets/images/dapps/pave.png";
import libraIcon from "../../assets/images/dapps/libra.png";
import cryptoDragonsIcon from "../../assets/images/dapps/cryptodragons.png";
import avnuIcon from "../../assets/images/dapps/avnu.png";
import artPeaceIcon from "../../assets/images/dapps/artpeace.png";
import vesuIcon from "../../assets/images/dapps/vesu.png";
import eternumIcon from "../../assets/images/dapps/eternum.png";
import oracleIcon from "../../assets/images/transaction/oracle.png";
import attestationIcon from "../../assets/images/transaction/attestation.png";
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
