import React, { useEffect, useState } from "react";
import { Animated, useAnimatedValue, Text, View, Image, TouchableOpacity } from "react-native";

import { useSound } from "../../context/Sound";
import { BlockView } from "../../components/BlockView";
import { Miner } from "../../components/Miner";
import { useGameState } from "../../context/GameState";
import { useUpgrades } from "../../context/Upgrades";
import { createTx } from "../../utils/transactions";
import { playTxClicked } from "../../components/utils/sounds";
import transactions from "../../configs/transactions.json";

import * as transfer from "../../../assets/images/transaction/transfer.png";
import * as l2Blob from "../../../assets/images/transaction/l2Blob.png";
import * as inscription from "../../../assets/images/transaction/inscription/0.jpeg";
import * as dapp from "../../../assets/images/transaction/dapp.png";
import * as l2Batch from "../../../assets/images/transaction/l2Batch.png";
import * as lock from "../../../assets/images/lock.png";

export type L1PhaseProps = {
  _id: number;
};

export const L1Phase: React.FC<L1PhaseProps> = (props) => {
  const { gameState, unlockL2, addTxToBlock, updateBalance } = useGameState();
  const { l1TransactionTypes, l1TxFeeUpgrade } = useUpgrades();
  const { isSoundOn } = useSound();
  // TODO: Style overflow with shadow of pastBlocks
  // TODO: Disable mempool if block is full
  const [last10TransactionsTimes, setLast10TransactionsTimes] = useState<Array<number>>([]);
  const [tps, setTps] = useState<number>(0);

  const addTransactionToBlock = (txType: any, feeLevel: number = 0) => {
    if (
      gameState.chains[0].currentBlock.transactions.length >=
      gameState.chains[0].currentBlock.maxSize
    )
      return;

    const txFee = txType.value[feeLevel];
    const txIcon = txIcons[txType.id];
    const tx = createTx(txType, txFee, txIcon);
    const playPitch = (tx.fee / 8) + 1;
    playTxClicked(isSoundOn, playPitch);
    addTxToBlock(tx);

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
  };

  // Recalculate TPS every second
  useEffect(() => {
    const interval = setInterval(() => {
       // Remove txs older than 5 seconds
      const newTimes = last10TransactionsTimes.filter(time => Date.now() - time < 5000);
      setLast10TransactionsTimes(newTimes);
      const timeDiff = newTimes[newTimes.length - 1] - newTimes[0];
      const newTps = (newTimes.length - 1) / (timeDiff / 1000);

      if (isNaN(newTps)) setTps(0);
      else setTps(newTps);
    }, 1000);
    return () => clearInterval(interval);
  }, [last10TransactionsTimes]);

  const [txTypes, setTxTypes] = useState(transactions.L1);
  const txIcons = [
    transfer,
    l2Blob,
    inscription,
    dapp,
    l2Batch,
  ];

  const tryBuyTx = (txTypeId: number) => {
    if (l1TransactionTypes[txTypeId].feeLevel !== 0) return;
    const txType = transactions.L1[txTypeId];
    
    if (gameState.balance < txType.feeCosts[0]) return;
    l1TxFeeUpgrade(txTypeId);

    const newBalance = gameState.balance - txType.feeCosts[0];
    updateBalance(newBalance);

    if (txType.name === "L2") {
      unlockL2();
    }
  };

  const sequenceAnim = useAnimatedValue(0);
  const [sequencedDone, setSequencedDone] = useState(0);
  useEffect(() => {
    if (!l1TransactionTypes[0] ||
        l1TransactionTypes[0].feeLevel === 0 ||
        l1TransactionTypes[0].speedLevel === 0)
      return;
    Animated.timing(sequenceAnim, {
      toValue: 100,
      duration: 1000 / l1TransactionTypes[0].speedLevel,
      useNativeDriver: false,
    }).start(() => {
      sequenceAnim.setValue(0);
      // TODO: Seperate callback for this to avoid slowing down the animation
      addTransactionToBlock(txTypes[0], l1TransactionTypes[0]?.feeLevel - 1);
      setSequencedDone(sequencedDone + 1);
    });
  }, [sequenceAnim, sequencedDone]);

  return (
    <View className="flex-1 relative flex flex-col items-center mt-10">
      <Text className="text-xl font-bold text-[#f9f9f9]
                       absolute top-[-0.5rem] right-[1rem]"
      >
        {tps.toFixed(2)} TPS
      </Text>

      {gameState.chains[0].pastBlocks && gameState.chains[0].pastBlocks.length > 0 && (
        <View className="flex flex-row w-full px-2 flex-row-reverse mt-6">
          {gameState.chains[0].pastBlocks.map((block, index) => (
            <View className="flex flex-row items-center" key={index}>
              <View className="h-[8rem] w-[8rem]">
                <BlockView {...props} block={block} showOverlay={true} />
              </View>
              {index !== 0 && (
                <View className="flex flex-col items-center">
                  <View className="w-2 h-[4px] mx-[2px] bg-[#f9f9f980] rounded-lg" />
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <Text className="text-4xl font-bold text-[#f9f9f9] mt-[1rem]">
        Block #{gameState.chains[0].currentBlock.id}
      </Text>

      <View className="flex flex-row justify-center w-full h-[26rem]">
        <BlockView {...props} block={gameState.chains[0].currentBlock} />
        {gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize && (
          <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
            <Miner />
          </View>
        )}
      </View>

      <View className="flex flex-row justify-center w-full gap-2 mt-[1rem]">
        {txTypes.map((txType, index) => (
          <View
            className="flex flex-col items-center justify-center relative"
            key={index}
          >
            <TouchableOpacity
              style={{
                backgroundColor: txType.color,
                borderColor: txType.color,
              }}
              className="flex flex-col items-center justify-center w-[4.5rem] aspect-square rounded-lg border-2 overflow-hidden relative"
              onPress={() => {
                if (txType.value[l1TransactionTypes[txType.id].feeLevel - 1] === 0) return;
                if (l1TransactionTypes[txType.id].feeLevel === 0) tryBuyTx(txType.id);
                else addTransactionToBlock(txType, l1TransactionTypes[txType.id].feeLevel - 1);
              }}
            >
              <Image
                source={txIcons[txType.id]}
                className="w-[3.8rem] h-[3.8rem]"
              />
              {l1TransactionTypes[txType.id]?.feeLevel !== 0 && l1TransactionTypes[txType.id]?.speedLevel !== 0 && (
                <Animated.View
                  className="absolute h-full bg-[#f9f9f980] left-0 rounded-sm"
                  style={{
                    width: sequenceAnim
                  }}
                />
              )}
            </TouchableOpacity>
            {l1TransactionTypes[txType.id]?.feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lock as any}
                  className="h-[3rem] aspect-square rounded-lg mb-4"
                />
              </View>
            )}
            {(txType.value[l1TransactionTypes[txType.id]?.feeLevel - 1] !== 0 || l1TransactionTypes[txType.id]?.feeLevel === 0) && (
            <Text
              className="text-[#60f760a0] text-center font-bold text-[1rem]
                         bg-[#292929d0] rounded-lg px-2 py-1 border-2
                         absolute bottom-[-1rem]
                         "
              style={{
                color: l1TransactionTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                borderColor: txType.color
              }}
            >
              {l1TransactionTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
              ₿
              {l1TransactionTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1TransactionTypes[txType.id]?.feeLevel - 1]}
            </Text>
            )}
          </View>
        ))}
      </View>
   </View>
  );
}

export default L1Phase;
