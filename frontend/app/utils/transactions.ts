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
      "L2": l2BatchIcon,
      "PowSwap": powSwapIcon,
      "ClosedOcean": closedOceanIcon,
      "Pave": paveIcon,
      "Libra": libraIcon,
      "CryptoDragons": cryptoDragonsIcon,
    },
    2: {
      "Transfer": transferIcon,
      "Bridge": transferIcon,
      "NFTs": getRandomNFTImage(),
      "Dapp": dappIcon,
      "AppChain": dojoIcon,
      "AVNU": avnuIcon,
      "art/peace": artPeaceIcon,
      "Vesu": vesuIcon,
      "Eternum": eternumIcon,
    },
  };
  return layerIcons[chain];
}

export const getTxIcon = (chain: number, txTypeId: number, isDapp?: boolean) => {
  if (isDapp) {
    const dappMeta = chain === 1 ? dappsJson.L1[txTypeId] : dappsJson.L2[txTypeId];
    const icons = getChainIcons(chain);
    return icons?.[dappMeta.name] || questionMarkImage;
  }
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
import powSwapIcon from "../../assets/images/dapps/powswap.png";
import closedOceanIcon from "../../assets/images/dapps/closedocean.png";
import paveIcon from "../../assets/images/dapps/pave.png";
import libraIcon from "../../assets/images/dapps/libra.png";
import cryptoDragonsIcon from "../../assets/images/dapps/cryptodragons.png";
import avnuIcon from "../../assets/images/dapps/avnu.png";
import artPeaceIcon from "../../assets/images/dapps/artpeace.jpeg";
import vesuIcon from "../../assets/images/dapps/vesu.jpeg";
import eternumIcon from "../../assets/images/dapps/eternum.jpeg";
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
