import transactionsJson from "../configs/transactions.json";
import questionMarkImage from "../../assets/images/questionMark.png";
export const newEmptyTransaction = () => {
  return {
    type: "",
    fee: 0,
    style: { backgroundColor: "#f7f7f7" },
    image: questionMarkImage,
  };
}

import * as inscriptionImages from "../configs/inscriptions";
export const getRandomInscriptionImage = () => {
  const images = Object.values(inscriptionImages);
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

import * as nftImages from "../configs/nfts"; 
export const getRandomNFTImage = () => {
  const images = Object.values(nftImages);
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

export const getChainIcons = (chain: number) => {
  const layerIcons: any = {
    1: {
      "Transfer": transferIcon,
      "Blobs": blobIcon,
      "Inscription": getRandomInscriptionImage(),
      "Dapp": dappIcon,
      "L2": l2BatchIcon
    },
    2: {
      "Transfer": transferIcon,
      "Bridge": transferIcon,
      "NFTs": getRandomNFTImage(),
      "Dapp": dappIcon,
      "AppChain": dojoIcon
    },
  };
  return layerIcons[chain];
}

export const getTxIcon = (chain: number, txTypeId: number) => {
  const txMeta = chain === 1 ? transactionsJson.L1[txTypeId] : transactionsJson.L2[txTypeId];
  const icons = getChainIcons(chain);
  return icons?.[txMeta.name] || questionMarkImage;
}

// Above as import
import transferIcon from "../../assets/images/transaction/transfer.png";
import blobIcon from "../../assets/images/transaction/l2Blob.png";
import dappIcon from "../../assets/images/transaction/dapp.png";
import l2BatchIcon from "../../assets/images/transaction/l2Batch.png";
import dojoIcon from "../../assets/images/transaction/dojo.png";
export const createTx = (chain: number, txTypeId: number, txFee: number, txIcon?: string) => {
  const txMeta = chain === 1 ? transactionsJson.L1[txTypeId] : transactionsJson.L2[txTypeId];
  const image = txIcon || getTxIcon(chain, txTypeId);
  return {
    type: txMeta.name,
    fee: txFee,
    style: { backgroundColor: txMeta.color },
    image: image,
  };
}
