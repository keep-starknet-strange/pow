import React, { useEffect, useState } from "react";
import { Text, View, Image, TouchableOpacity, Animated, useAnimatedValue } from "react-native";

import { useSound } from "../../context/Sound";
import { BlockView } from "../../components/BlockView";
import { Miner } from "../../components/Miner";
import { L2Confirm } from "../../components/L2Confirm";
import { ProverConfirm } from "../../components/ProverConfirm";
import { DAConfirm } from "../../components/DAConfirm";
import { useGameState } from "../../context/GameState";
import { createTx } from "../../utils/transactions";
import { playTxClicked } from "../../components/utils/sounds";
import transactions from "../../configs/transactions.json";
import { useUpgrades } from "../../context/Upgrades";

import * as transfer from "../../../assets/images/transaction/transfer.png";
import * as l2Blob from "../../../assets/images/transaction/l2Blob.png";
import * as inscription from "../../../assets/images/transaction/inscription/0.jpeg";
import * as dapp from "../../../assets/images/transaction/dapp.png";
import * as l2Batch from "../../../assets/images/transaction/l2Batch.png";
import * as duck from "../../../assets/images/transaction/duck.png";
import * as dojo from "../../../assets/images/transaction/dojo.png";
import * as lock from "../../../assets/images/lock.png";

export type L2PhaseProps = {
  _id: string;
};

export const L2Phase: React.FC<L2PhaseProps> = (props) => {
  const { gameState, updateBalance, addTxToBlock, addL2TxToBlock } = useGameState();
  const { l1TransactionTypes, l1TxFeeUpgrade, l2TransactionTypes, l2TxFeeUpgrade } = useUpgrades();
  const { isSoundOn } = useSound();
  // TODO: Style overflow with shadow of pastBlocks
  // TODO: Disable mempool if block is full
  const [last10TransactionsTimes, setLast10TransactionsTimes] = useState<Array<number>>([]);
  const [tps, setTps] = useState<number>(0);

  const addTransactionToBlock = (txType: any, feelLevel: number = 0) => {
    if (
      gameState.chains[0].currentBlock.transactions.length >=
      gameState.chains[0].currentBlock.maxSize
    )
      return;

    const txFee = txType.value[feelLevel];
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

  const [txTypes, setTxTypes] = useState(transactions.L1);
  const txIcons = [
    transfer,
    l2Blob,
    inscription,
    dapp,
    l2Batch,
  ];

  const [l2TxTypes, setL2TxTypes] = useState(transactions.L2);
  const txL2Icons = [
    transfer,
    transfer,
    duck,
    dapp,
    dojo,
  ];

  const addL2TransactionToBlock = (txType: any, feelLevel: number = 0) => {
    if (
      gameState.chains[1].currentBlock.transactions.length >=
      gameState.chains[1].currentBlock.maxSize
    )
      return;

    const txFee = txType.value[feelLevel];
    const txIcon = txL2Icons[txType.id];
    const tx = createTx(txType, txFee, txIcon);
    const playPitch = (tx.fee / 8) + 1;
    playTxClicked(isSoundOn, playPitch);
    addL2TxToBlock(tx);

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
  }

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

  const tryBuyTx = (txTypeId: number) => {
    if (l1TransactionTypes[txTypeId].feeLevel !== 0) return;
    const txType = transactions.L1[txTypeId];
    
    if (gameState.balance < txType.feeCosts[0]) return;
    l1TxFeeUpgrade(txTypeId);

    const newBalance = gameState.balance - txType.feeCosts[0];
    updateBalance(newBalance);
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

  const sequenceAnim2 = useAnimatedValue(0);
  const [sequencedDone2, setSequencedDone2] = useState(0);
  useEffect(() => {
    if (!l2TransactionTypes[0] ||
        l2TransactionTypes[0].feeLevel === 0 ||
        l2TransactionTypes[0].speedLevel === 0)
      return;
    Animated.timing(sequenceAnim2, {
      toValue: 100,
      duration: 1000 / l2TransactionTypes[0].speedLevel,
      useNativeDriver: false,
    }).start(() => {
      sequenceAnim2.setValue(0);
      addL2TransactionToBlock(l2TxTypes[0], l2TransactionTypes[0]?.feeLevel - 1);
      setSequencedDone2(sequencedDone2 + 1);
    });
  }, [sequenceAnim2, sequencedDone2]);

  const tryBuyTxL2 = (txTypeId: number) => {
    if (l2TransactionTypes[txTypeId].feeLevel !== 0) return;
    const txType = transactions.L2[txTypeId];

    if (gameState.balance < txType.feeCosts[0]) return;
    l2TxFeeUpgrade(txTypeId);

    const newBalance = gameState.balance - txType.feeCosts[0];
    updateBalance(newBalance);
  }

  return (
    <View className="flex-1 relative flex flex-col items-center mt-10">
      <Text className="text-xl font-bold text-[#f9f9f9]
                       absolute top-[-0.5rem] right-[1rem]"
      >
        {tps.toFixed(2)} TPS
      </Text>

      <View className="flex flex-row px-2 mt-6 w-full justify-end">
        {gameState.chains[0].pastBlocks && gameState.chains[0].pastBlocks.length > 0 && (
          <View className="flex flex-row w-full flex-row-reverse">
            {gameState.chains[0].pastBlocks.map((block, index) => (
              <View className="flex flex-row items-center" key={index}>
                <View className="h-[8rem] w-[8rem]">
                  <BlockView {...props} block={block} showOverlay={true} />
                </View>
                <View className="flex flex-col items-center">
                  <View className="w-2 h-[4px] mx-[2px] bg-[#f9f9f980] rounded-lg" />
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-[8rem]">
          <BlockView {...props} block={gameState.chains[0].currentBlock} showOverlay={true} />
          {gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize && (
            <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
              <Miner />
            </View>
          )}
        </View>
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
                else addTransactionToBlock(txType);
              }}
            >
              <Image
                source={txIcons[txType.id]}
                className="w-[3.8rem] h-[3.8rem]"
              />
              {l1TransactionTypes[txType.id].feeLevel !== 0 && l1TransactionTypes[txType.id].speedLevel !== 0 && (
                <Animated.View
                  className="absolute h-full bg-[#f9f9f980] left-0 rounded-sm"
                  style={{
                    width: sequenceAnim
                  }}
                />
              )}
            </TouchableOpacity>
            {l1TransactionTypes[txType.id].feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lock as any}
                  className="h-[3rem] aspect-square rounded-lg mb-4"
                />
              </View>
            )}
            {(txType.value[l1TransactionTypes[txType.id].feeLevel - 1] !== 0 || l1TransactionTypes[txType.id].feeLevel === 0) && (
            <Text
              className="text-[#60f760a0] text-center font-bold text-[1rem]
                         bg-[#292929d0] rounded-lg px-2 py-1 border-2
                         absolute bottom-[-1rem]
                         "
              style={{
                color: l1TransactionTypes[txType.id].feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                borderColor: txType.color
              }}
            >
              {l1TransactionTypes[txType.id].feeLevel === 0 ? "" : "+"}
              ₿
              {l1TransactionTypes[txType.id].feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1TransactionTypes[txType.id].feeLevel - 1]}
            </Text>
            )}
          </View>
        ))}
      </View>

      {gameState.l2 && (
        <View className="flex flex-row justify-center w-full gap-2 mt-[2rem]">
          <View className="w-[30%] h-[12rem] bg-[#6060f7a0] rounded-lg border-2 border-[#6060f7c0] flex items-center justify-end relative">
            {gameState.l2.da.blocks.map((block, index) => (
              <View className="flex flex-row w-full h-[5%]
                               bg-[#6060f7c0] rounded-sm border-2 border-[#6060f7c0]
              " key={index}>
              </View>
            ))}
            <Text className="text-[#f9f9f9] text-[1.3rem] font-bold w-full text-center
                             absolute top-0 left-0">L2 DA</Text>
            <Text className="absolute bottom-0 right-0 flex flex-row items-center justify-center p-2 aspect-square
                             bg-[#606060b0] rounded-sm border-t-2 border-l-2 border-[#6060f7a0]">
              💰₿{gameState.l2.da.blockFees.toFixed(0) || 0}
            </Text>
            {gameState.l2.da.blocks.length >= gameState.l2.da.maxSize && (
              <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
                <DAConfirm />
              </View>
            )}
          </View>
          <View className="w-[60%] h-[12rem] bg-[#f760f7a0] rounded-lg border-2 border-[#f760f7c0] flex relative">
            {gameState.l2.prover.blocks.map((block, index) => (
              <View className="flex flex-row w-[2rem] aspect-square
                               bg-[#606060b0] rounded-sm border-2 border-[#f760f7a0]
              " key={index}>
                <Text className="text-[#f9f9f9] text-[1.3rem] font-bold w-full text-center
                             absolute top-0 left-0">#{block}</Text>
              </View>
            ))}
            <Text className="text-[#f9f9f9] text-[1.3rem] font-bold w-full text-center
                             absolute top-0 left-0">L2 Prover</Text>
            <Text className="absolute bottom-0 right-0 flex flex-row items-center justify-center p-2 aspect-square
                             bg-[#606060b0] rounded-sm border-t-2 border-l-2 border-[#f760f7a0]">
              💰₿{gameState.l2.prover.blockFees.toFixed(0) || 0}
            </Text>
            {gameState.l2.prover.blocks.length >= gameState.l2.prover.maxSize && (
              <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
                <ProverConfirm />
              </View>
            )}
          </View>
        </View>
      )}

      {gameState.chains.length > 1 && (
      <>
      <View className="flex flex-row px-2 mt-[1rem] w-full justify-end">
        {gameState.chains[1].pastBlocks && gameState.chains[1].pastBlocks.length > 0 && (
          <View className="flex flex-row w-full flex-row-reverse">
            {gameState.chains[1].pastBlocks.map((block, index) => (
              <View className="flex flex-row items-center" key={index}>
                <View className="h-[8rem] w-[8rem]">
                  <BlockView {...props} block={block} showOverlay={true} />
                </View>
                <View className="flex flex-col items-center">
                  <View className="w-2 h-[4px] mx-[2px] bg-[#f9f9f980] rounded-lg" />
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-[8rem]">
          <BlockView {...props} block={gameState.chains[1].currentBlock} showOverlay={true} />
          {gameState.chains[1].currentBlock.transactions.length >= gameState.chains[1].currentBlock.maxSize && (
            <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
              <L2Confirm />
            </View>
          )}
        </View>
      </View>

      <View className="flex flex-row justify-center w-full gap-2 mt-[1rem]">
        {l2TxTypes.map((txType, index) => (
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
                if (txType.value[l2TransactionTypes[txType.id].feeLevel - 1] === 0) return;
                if (l2TransactionTypes[txType.id].feeLevel === 0) tryBuyTxL2(txType.id);
                else addL2TransactionToBlock(txType);
              }}
            >
              <Image
                source={txL2Icons[txType.id]}
                className="w-[3.8rem] h-[3.8rem]"
              />
              {l2TransactionTypes[txType.id].feeLevel !== 0 && l2TransactionTypes[txType.id].speedLevel !== 0 && (
                <Animated.View
                  className="absolute h-full bg-[#f9f9f980] left-0 rounded-sm"
                  style={{
                    width: sequenceAnim2
                  }}
                />
              )}
            </TouchableOpacity>
            {l2TransactionTypes[txType.id].feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lock as any}
                  className="h-[3rem] aspect-square rounded-lg mb-4"
                />
              </View>
            )}
            <Text
              className="text-[#60f760a0] text-center font-bold text-[1rem]
                         bg-[#292929d0] rounded-lg px-2 py-1 border-2
                         absolute bottom-[-1rem]
                         "
              style={{
                color: l2TransactionTypes[txType.id].feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                borderColor: txType.color
              }}
            >
              {l2TransactionTypes[txType.id].feeLevel === 0 ? "" : "+"}
              ₿
              {l2TransactionTypes[txType.id].feeLevel === 0 ? txType.feeCosts[0] : txType.value[l2TransactionTypes[txType.id].feeLevel - 1]}
            </Text>
          </View>
        ))}
      </View>
      </>
      )}
   </View>
  );
}

export default L2Phase;
