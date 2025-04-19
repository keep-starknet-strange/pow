import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, Animated, useAnimatedValue } from "react-native";
import { useGameState } from "../../context/GameState";
import { useUpgrades } from "../../context/Upgrades";
import { useSound } from "../../context/Sound";
import { getTxIcon, createTx, getRandomInscriptionImage, getRandomNFTImage } from "../../utils/transactions";
import { playTxClicked } from "../../components/utils/sounds";
import transactions from "../../configs/transactions.json";
import questionMarkIcon from "../../../assets/images/questionMark.png";

export type TxButtonProps = {
  chain: string;
  txType: any; // TODO: Define a proper type for txType
  addTransaction: (chainId: number, tx: any) => void;
};

export const TxButton: React.FC<TxButtonProps> = (props) => {
  const { gameState, updateBalance, unlockL2 } = useGameState();
  const { l1TransactionTypes, l2TransactionTypes, l1TxFeeUpgrade, l2TxFeeUpgrade } = useUpgrades();
  const { isSoundOn } = useSound();

  const [chainId, setChainId] = useState(0);
  const [txTypes, setTxTypes] = useState(l1TransactionTypes);
  useEffect(() => {
    if (props.chain === "L1") {
      setTxTypes(l1TransactionTypes);
    } else {
      setTxTypes(l2TransactionTypes);
    }
  }, [props.chain, l1TransactionTypes, l2TransactionTypes]);
  const [icon, setIcon] = useState<any>(questionMarkIcon);
  useEffect(() => {
    setChainId(props.chain === "L1" ? 0 : 1);
    props.chain === "L1" ? setTxTypes(l1TransactionTypes) : setTxTypes(l2TransactionTypes);
  }, [props.chain]);
  useEffect(() => {
    if (props.txType.name === "Inscription") {
      setIcon(getRandomInscriptionImage());
    } else if (props.txType.name === "NFTs") {
      setIcon(getRandomNFTImage());
    } else {
      setIcon(getTxIcon(chainId + 1, props.txType.id));
    }
  }, [props.txType, chainId]);

  const addTransactionToBlock = (chainId: number, txType: any, feeLevel: number = 0) => {
    if (
      gameState.chains[chainId].currentBlock.transactions.length >=
      gameState.chains[chainId].currentBlock.maxSize
    )
      return;

    const txFee = txType.value[feeLevel];
    const tx = createTx(chainId + 1, txType.id, txFee, icon);
    const playPitch = (tx.fee / 8) + 1;
    playTxClicked(isSoundOn, playPitch);
    props.addTransaction(chainId, tx);
    if (txType.name === "Inscription") {
      setIcon(getRandomInscriptionImage());
    } else if (txType.name === "NFTs") {
      setIcon(getRandomNFTImage());
    }

    /*
    TODO
    const newTimes = [...last10TransactionsTimes, Date.now()];
    while (newTimes.length > 10) {
      newTimes.shift();
    }
    setLast10TransactionsTimes(newTimes);

    const timeDiff = newTimes[newTimes.length - 1] - newTimes[0];
    const newTps = (newTimes.length - 1) / (timeDiff / 1000);
    if (isNaN(newTps)) {
      setTps(0);
    } else {
      setTps(newTps);
    }
    */
  };

  const tryBuyTx = (txTypeId: number) => {
    if (txTypes[txTypeId].feeLevel !== 0) return;
    const txType = chainId === 0 ? transactions.L1[txTypeId] : transactions.L2[txTypeId];
    
    if (gameState.balance < txType.feeCosts[0]) return;
    if (chainId === 0) {
      l1TxFeeUpgrade(txTypeId);
    } else {
      l2TxFeeUpgrade(txTypeId);
    }

    const newBalance = gameState.balance - txType.feeCosts[0];
    updateBalance(newBalance);

    if (txType.name === "L2") {
      unlockL2();
    }
  };

  const sequenceAnim = useAnimatedValue(0);
  const [sequencedDone, setSequencedDone] = useState(0);
  useEffect(() => {
    if (!txTypes[props.txType.id] ||
        txTypes[props.txType.id].feeLevel === 0 ||
        txTypes[props.txType.id].speedLevel === 0)
      return;
    Animated.timing(sequenceAnim, {
      toValue: 100,
      duration: 1000 / txTypes[props.txType.id].speedLevel,
      useNativeDriver: false,
    }).start(() => {
      sequenceAnim.setValue(0);
      // TODO: Seperate callback for this to avoid slowing down the animation
      const txType = chainId === 0 ? transactions.L1[props.txType.id] : transactions.L2[props.txType.id];
      addTransactionToBlock(chainId, txType, txTypes[props.txType.id]?.feeLevel - 1);
      setSequencedDone(sequencedDone + 1);
    });
  }, [sequenceAnim, sequencedDone, txTypes, props.txType, chainId]);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: props.txType.color,
        borderColor: props.txType.color,
      }}
      className="flex flex-col items-center justify-center w-[4.5rem] aspect-square rounded-lg border-2 overflow-hidden relative"
      onPress={() => {
        if (props.txType.value[txTypes[props.txType.id].feeLevel - 1] === 0) return;
        if (txTypes[props.txType.id].feeLevel === 0) tryBuyTx(props.txType.id);
        else addTransactionToBlock(chainId, props.txType, txTypes[props.txType.id].feeLevel - 1);
      }}
    >
      <Image
        source={icon}
        className="w-[3.8rem] h-[3.8rem]"
      />
      {txTypes[props.txType.id]?.feeLevel !== 0 && txTypes[props.txType.id]?.speedLevel !== 0 && (
        <Animated.View
          className="absolute h-full bg-[#f9f9f980] left-0 rounded-sm"
          style={{
            width: sequenceAnim
          }}
        />
      )}
    </TouchableOpacity>
  );
}
