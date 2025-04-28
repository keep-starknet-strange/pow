import React, { useEffect, useState } from "react";
import { Text, View, Image, TouchableOpacity, Animated, useAnimatedValue } from "react-native";
import { Mutex } from "async-mutex";

import { BlockView } from "../../components/BlockView";
import { Miner } from "../../components/Miner";
import { L2Confirm } from "../../components/L2Confirm";
import { ProverConfirm } from "../../components/ProverConfirm";
import { DAConfirm } from "../../components/DAConfirm";
import { TxButton } from "../../components/buttons/TxButton";
import { DappsButton } from "../../components/buttons/DappsButton";
import { useGameState } from "../../context/GameState";
import transactions from "../../configs/transactions.json";
import upgradesJson from "../../configs/upgrades.json";
import prestigeJson from "../../configs/prestige.json";
import dapps from "../../configs/dapps.json";
import { useUpgrades } from "../../context/Upgrades";
import { createTx, getTxIcon, getRandomNFTImage, getRandomInscriptionImage } from "../../utils/transactions";
import lockImg from "../../../assets/images/lock.png";


export type L2PhaseProps = {
  _id: string;
};

export const L2Phase: React.FC<L2PhaseProps> = (props) => {
  const { gameState, updateBalance, addTxToBlock, addL2TxToBlock, upgradableGameState } = useGameState();
  const { upgrades, l1TransactionTypes, l1TxFeeUpgrade, l2TransactionTypes, l2TxFeeUpgrade, l1DappTypes, l2DappTypes } = useUpgrades();
  const [mutex] = useState(new Mutex());
  const addTransaction = async (chainId: number, tx: any) => {
    const release = await mutex.acquire();
    try {
      if (chainId === 0) {
        addTxToBlock(tx);
      } else {
        addL2TxToBlock(tx);
      }
    } finally {
      release();
    }
  }

  const [l1MevBoost, setL1MevBoost] = useState(1);
  const [l2MevBoost, setL2MevBoost] = useState(1);
  useEffect(() => {
    // TODO: Hardcoded for now
    if (upgrades && upgrades[0] && upgrades[0][3] && upgrades[0][3].level !== 0) {
      const newL1MevBoost = upgradesJson.L1[3].value[upgrades[0][3].level - 1];
      setL1MevBoost(newL1MevBoost);
    } else {
      setL1MevBoost(1);
    }

    if (upgrades && upgrades[1] && upgrades[1][3] && upgrades[1][3].level !== 0) {
      const newL2MevBoost = upgradesJson.L2[3].value[upgrades[1][3]?.level - 1];
      setL2MevBoost(newL2MevBoost);
    } else {
      setL2MevBoost(1);
    }
  }, [upgrades]);

  const [l1TransactionsBase, setL1TransactionsBase] = useState(transactions.L1.slice(0, 3));
  const [l1DappsOpen, setL1DappsOpen] = useState(false);
  const [l2TransactionsBase, setL2TransactionsBase] = useState(transactions.L2.slice(0, 3));
  const [l2DappsOpen, setL2DappsOpen] = useState(false);

  return (
    <View className="flex-1 relative flex flex-col items-center mt-10">
      <View className="pb-[1.5rem]">
      <View className="flex flex-row px-2 mt-6 w-full justify-end">
        {gameState.chains[0].pastBlocks && gameState.chains[0].pastBlocks.length > 0 && (
          <View className="flex flex-row w-full flex-row-reverse">
            {gameState.chains[0].pastBlocks.map((block, index) => (
              <View className="flex flex-row items-center" key={index}>
                <View className="h-[8rem] w-[8rem]">
                  <BlockView {...props} block={block} showOverlay={true} completed={true} />
                </View>
                <View className="flex flex-col items-center">
                  <View className="w-2 h-[4px] mx-[2px] bg-[#f9f9f980] rounded-lg" />
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-[8rem]">
          <BlockView {...props} block={gameState.chains[0].currentBlock} showOverlay={true} completed={false} />
          {gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize && (
            <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
              <Miner />
            </View>
          )}
        </View>
      </View>

      <View className="flex flex-row justify-center w-full gap-1 mt-[1rem]">
        {l1TransactionsBase.map((txType, index) => (
          <View
            className="flex flex-col items-center justify-center relative"
            key={index}
          >
            <TxButton chain={"L1"} txType={txType} addTransaction={addTransaction} size={0.11} />
            {l1TransactionTypes[txType.id].feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lockImg}
                  className="h-[1.6rem] aspect-square rounded-lg mb-4"
                />
              </View>
            )}
            {(txType.value[l1TransactionTypes[txType.id].feeLevel - 1] !== 0 || l1TransactionTypes[txType.id].feeLevel === 0) && (
            <Text
              className="text-[#60f760a0] text-center font-bold text-[0.6rem]
                         bg-[#292929d0] rounded-lg px-2 py-1 border-2
                         absolute bottom-[-1rem] w-[3rem]
                         "
              style={{
                color: l1TransactionTypes[txType.id].feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                borderColor: txType.color
              }}
            >
              {l1TransactionTypes[txType.id].feeLevel === 0 ? "" : "+"}
              ₿
              {(l1TransactionTypes[txType.id].feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1TransactionTypes[txType.id].feeLevel - 1] * l1MevBoost * prestigeJson[upgradableGameState.prestige].scaler).toFixed(0)}
            </Text>
            )}
          </View>
        ))}
        {dapps.L1.map((txType, index) => (
          <View
            className="flex flex-col items-center justify-center relative"
            key={index}
          >
            <TxButton chain={"L1"} txType={txType} addTransaction={addTransaction} isDapp={true} size={0.11} />
            {l1DappTypes[txType.id]?.feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lockImg}
                  className="h-[1.6rem] aspect-square rounded-lg mb-4"
                />
              </View>
            )}
            {(txType.value[l1DappTypes[txType.id]?.feeLevel - 1] !== 0 || l1DappTypes[txType.id]?.feeLevel === 0) && (
            <Text
              className="text-[#60f760a0] text-center font-bold text-[0.6rem]
                         bg-[#292929d0] rounded-lg px-2 py-1 border-2
                         absolute bottom-[-1rem] w-[3rem]
                         overflow-hidden white-space-nowrap text-ellipsis
                         "
              style={{
                color: l1DappTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                borderColor: txType.color
              }}
            >
              {l1DappTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
              ₿
              {(l1DappTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1DappTypes[txType.id]?.feeLevel - 1] * l1MevBoost * prestigeJson[upgradableGameState.prestige].scaler).toFixed(0)}
            </Text>
            )}
          </View>
        ))}
      </View>
      </View>

      <View className="bg-[#49494930] flex-1 pt-[0.5rem]">
      {gameState.l2 && (
        <View className="flex flex-row justify-center w-full gap-2">
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
                  <BlockView {...props} block={block} showOverlay={true} completed={true} />
                </View>
                <View className="flex flex-col items-center">
                  <View className="w-2 h-[4px] mx-[2px] bg-[#f9f9f980] rounded-lg" />
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-[8rem]">
          <BlockView {...props} block={gameState.chains[1].currentBlock} showOverlay={true} completed={false} />
          {gameState.chains[1].currentBlock.transactions.length >= gameState.chains[1].currentBlock.maxSize && (
            <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
              <L2Confirm />
            </View>
          )}
        </View>
      </View>

      <View className="flex flex-row justify-center w-full gap-2 mt-[1rem]">
        {l2TransactionsBase.map((txType, index) => (
          <View
            className="flex flex-col items-center justify-center relative"
            key={index}
            style={{
              display: l2DappsOpen ? "none" : "flex"
            }}
          >
            <TxButton chain={"L2"} txType={txType} addTransaction={addTransaction} />
            {l2TransactionTypes[txType.id].feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lockImg}
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
              {l2TransactionTypes[txType.id].feeLevel === 0 ? txType.feeCosts[0] : txType.value[l2TransactionTypes[txType.id].feeLevel - 1] * l2MevBoost * prestigeJson[upgradableGameState.prestige].scaler}
            </Text>
          </View>
        ))}
        <View className="flex flex-col items-center justify-center relative">
          <DappsButton chain={"L2"} txType={transactions.L2[3]} toggleOpen={() => setL2DappsOpen(!l2DappsOpen)} isOpen={l1DappsOpen} />
          {l2TransactionTypes[transactions.L2[3].id]?.feeLevel === 0 && (
            <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
              pointer-events-none
              top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
              <Image
                source={lockImg}
                className="h-[3rem] aspect-square rounded-lg mb-4"
              />
            </View>
          )}
          {(transactions.L2[3].value[l2TransactionTypes[transactions.L2[3].id]?.feeLevel - 1] !== 0 || l2TransactionTypes[transactions.L2[3].id]?.feeLevel === 0) && (
          <Text
            className="text-[#60f760a0] text-center font-bold text-[1rem]
                       bg-[#292929d0] rounded-lg px-2 py-1 border-2
                       absolute bottom-[-1rem]
                       "
            style={{
              color: l2TransactionTypes[transactions.L2[3].id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
              borderColor: transactions.L2[3].color
            }}
          >
            {l2TransactionTypes[transactions.L2[3].id]?.feeLevel === 0 ? "" : "+"}
            ₿
            {l2TransactionTypes[transactions.L2[3].id]?.feeLevel === 0 ? transactions.L2[3].feeCosts[0] : transactions.L2[3].value[l2TransactionTypes[transactions.L2[3].id]?.feeLevel - 1] * l2MevBoost * prestigeJson[upgradableGameState.prestige].scaler}
          </Text>
          )}
        </View>
        {dapps.L2.map((txType, index) => (
          <View
            className="flex flex-col items-center justify-center relative"
            key={index}
            style={{
              display: l2DappsOpen ? "flex" : "none"
            }}
          >
            <TxButton chain={"L2"} txType={txType} addTransaction={addTransaction} isDapp={true} />
            {l2DappTypes[txType.id]?.feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lockImg}
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
                color: l2DappTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                borderColor: txType.color
              }}
            >
              {l2DappTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
              ₿
              {l2DappTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l2DappTypes[txType.id]?.feeLevel - 1] * l2MevBoost * prestigeJson[upgradableGameState.prestige].scaler}
            </Text>
          </View>
        ))}
        {transactions.L2.slice(4).map((txType, index) => (
          <View
            className="flex flex-col items-center justify-center relative"
            key={index}
            style={{
              display: l2DappsOpen ? "none" : "flex"
            }}
          >
            <TxButton chain={"L2"} txType={txType} addTransaction={addTransaction} />
            {l2TransactionTypes[txType.id]?.feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lockImg}
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
                color: l2TransactionTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                borderColor: txType.color
              }}
            >
              {l2TransactionTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
              ₿
              {l2TransactionTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l2TransactionTypes[txType.id]?.feeLevel - 1] * l2MevBoost * prestigeJson[upgradableGameState.prestige].scaler}
            </Text>
         </View>
        ))}
      </View>
      </>
      )}
      </View>
   </View>
  );
}

export default L2Phase;
