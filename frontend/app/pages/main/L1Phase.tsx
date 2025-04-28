import React, { useEffect, useState } from "react";
import { Animated, useAnimatedValue, Text, View, Image, TouchableOpacity } from "react-native";

import { BlockView } from "../../components/BlockView";
import { Miner } from "../../components/Miner";
import { TxButton } from "../../components/buttons/TxButton";
import { DappsButton } from "../../components/buttons/DappsButton";
import { useGameState } from "../../context/GameState";
import { useUpgrades } from "../../context/Upgrades";
import transactions from "../../configs/transactions.json";
import upgradesJson from "../../configs/upgrades.json";
import prestigeJson from "../../configs/prestige.json";
import dapps from "../../configs/dapps.json";
import { Mutex } from 'async-mutex';
import lockImg from "../../../assets/images/lock.png";

export type L1PhaseProps = {
  _id: number;
};

export const L1Phase: React.FC<L1PhaseProps> = (props) => {
  const { gameState, addTxToBlock, addL2TxToBlock, upgradableGameState } = useGameState();
  const { l1TransactionTypes, l1TxFeeUpgrade, l1DappTypes, upgrades } = useUpgrades();

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

  const [mevBoost, setMevBoost] = useState(1);
  useEffect(() => {
    // TODO: Hardcoded for now
    if (!upgrades || !upgrades[0] || !upgrades[0][3]) {
      setMevBoost(1);
      return;
    }
    if (upgrades[0][3].level === 0) {
      setMevBoost(1);
      return;
    }
    const newMevBoost = upgradesJson.L1[3].value[upgrades[0][3]?.level - 1];
    setMevBoost(newMevBoost);
  }, [upgrades]);

  const [l1TransactionsBase, setL1TransactionsBase] = useState(transactions.L1.slice(0, 3));

  const [dappsOpen, setDappsOpen] = useState(false);
  return (
    <View className="flex-1 relative flex flex-col items-center mt-10">
      {gameState.chains[0].pastBlocks && gameState.chains[0].pastBlocks.length > 0 && (
        <View className="flex flex-row w-full px-2 flex-row-reverse mt-6">
          {gameState.chains[0].pastBlocks.map((block, index) => (
            <View className="flex flex-row items-center" key={index}>
              <View className="h-[8rem] w-[8rem]">
                <BlockView {...props} block={block} showOverlay={true} completed={true} />
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

      <View
        className={`flex flex-row justify-center w-full ${l1TransactionTypes[transactions.L1[3].id]?.feeLevel === 0
          ? "h-[26rem]"
          : "h-[20rem]"
          }`}
      >
        <BlockView {...props} block={gameState.chains[0].currentBlock} completed={false} />
        {gameState.chains[0].currentBlock.transactions.length >= gameState.chains[0].currentBlock.maxSize && (
          <View className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-[10]">
            <Miner />
          </View>
        )}
      </View>

      <View className="flex flex-row w-full mt-[1rem] items-center justify-center gap-3">
        <View className="flex flex-col">
          <View className="flex flex-row justify-center gap-3">
            {l1TransactionsBase.map((txType, index) => (
              <View
                className="flex flex-col items-center justify-center relative"
                key={index}
                style={{
                  display: dappsOpen ? "none" : "flex"
                }}
              >
                <TxButton chain={"L1"} txType={txType} addTransaction={addTransaction} />
                {l1TransactionTypes[txType.id]?.feeLevel === 0 && (
                  <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                    pointer-events-none
                    top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                    <Image
                      source={lockImg}
                      className="h-[3rem] aspect-square rounded-lg mb-3"
                    />
                  </View>
                )}
                {(txType.value[l1TransactionTypes[txType.id]?.feeLevel - 1] !== 0 || l1TransactionTypes[txType.id]?.feeLevel === 0) && (
                <Text
                  className="text-[#60f760a0] text-center font-bold text-[1rem]
                             bg-[#292929f0] rounded-lg px-2 py-1 border-2
                             absolute bottom-[-1.4rem] w-[4rem]
                             "
                  style={{
                    color: l1TransactionTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                    borderColor: txType.color
                  }}
                >
                  {l1TransactionTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
                  ₿
                  {(l1TransactionTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1TransactionTypes[txType.id]?.feeLevel - 1] * mevBoost * prestigeJson[upgradableGameState.prestige].scaler).toFixed(0)}
                </Text>
                )}
              </View>
            ))}
            {l1TransactionTypes[transactions.L1[3].id]?.feeLevel === 0 && (
            <View className="flex flex-col items-center justify-center relative">
              <DappsButton chain={"L1"} txType={transactions.L1[3]} toggleOpen={() => setDappsOpen(!dappsOpen)} isOpen={dappsOpen} />
              {l1TransactionTypes[transactions.L1[3].id]?.feeLevel === 0 && (
                <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                  pointer-events-none
                  top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                  <Image
                    source={lockImg}
                    className="h-[3rem] aspect-square rounded-lg mb-3"
                  />
                </View>
              )}
              {(transactions.L1[3].value[l1TransactionTypes[transactions.L1[3].id]?.feeLevel - 1] !== 0 || l1TransactionTypes[transactions.L1[3].id]?.feeLevel === 0) && (
              <Text
                className="text-[#60f760a0] text-center font-bold text-[1rem]
                           bg-[#292929f0] rounded-lg px-2 py-1 border-2
                           absolute bottom-[-1.4rem] w-[4rem]
                           "
                style={{
                  color: l1TransactionTypes[transactions.L1[3].id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                  borderColor: transactions.L1[3].color
                }}
              >
                {l1TransactionTypes[transactions.L1[3].id]?.feeLevel === 0 ? "" : "+"}
                ₿
                {l1TransactionTypes[transactions.L1[3].id]?.feeLevel === 0 ? transactions.L1[3].feeCosts[0] : transactions.L1[3].value[l1TransactionTypes[transactions.L1[3].id]?.feeLevel - 1] * mevBoost * prestigeJson[upgradableGameState.prestige].scaler}
              </Text>
              )}
            </View>
            )}
            {l1TransactionTypes[transactions.L1[3].id]?.feeLevel === 0 ? (
            transactions.L1.slice(4).map((txType, index) => (
              <View
                className="flex flex-col items-center justify-center relative"
                key={index}
              >
                <TxButton chain={"L1"} txType={txType} addTransaction={addTransaction} />
                {l1TransactionTypes[txType.id]?.feeLevel === 0 && (
                  <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                    pointer-events-none
                    top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                    <Image
                      source={lockImg}
                      className="h-[3rem] aspect-square rounded-lg mb-3"
                    />
                  </View>
                )}
                {(txType.value[l1TransactionTypes[txType.id]?.feeLevel - 1] !== 0 || l1TransactionTypes[txType.id]?.feeLevel === 0) && (
                <Text
                  className="text-[#60f760a0] text-center font-bold text-[1rem]
                             bg-[#292929f0] rounded-lg px-2 py-1 border-2
                             absolute bottom-[-1.4rem] w-[4rem]
                             "
                  style={{
                    color: l1TransactionTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                    borderColor: txType.color
                  }}
                >
                  {l1TransactionTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
                  ₿
                  {l1TransactionTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1TransactionTypes[txType.id]?.feeLevel - 1] * mevBoost * prestigeJson[upgradableGameState.prestige].scaler}
                </Text>
                )}
              </View>
            ))
            ) : (
            dapps.L1.slice(0, 1).map((txType, index) => (
              <View
                className="flex flex-col items-center justify-center relative"
                key={index}
              >
                <TxButton chain={"L1"} txType={txType} addTransaction={addTransaction} isDapp={true} />
                {l1DappTypes[txType.id]?.feeLevel === 0 && (
                  <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                    pointer-events-none
                    top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                    <Image
                      source={lockImg}
                      className="h-[3rem] aspect-square rounded-lg mb-3"
                    />
                  </View>
                )}
                {(txType.value[l1DappTypes[txType.id]?.feeLevel - 1] !== 0 || l1DappTypes[txType.id]?.feeLevel === 0) && (
                <Text
                  className="text-[#60f760a0] text-center font-bold text-[1rem]
                             bg-[#292929f0] rounded-lg px-2 py-1 border-2
                             absolute bottom-[-1.4rem] w-[4rem]
                             "
                  style={{
                    color: l1DappTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                    borderColor: txType.color
                  }}
                >
                  {l1DappTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
                  ₿
                  {l1DappTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1DappTypes[txType.id]?.feeLevel - 1] * mevBoost * prestigeJson[upgradableGameState.prestige].scaler}
                </Text>
                )}
              </View>
            ))
            )}
          </View>
          {l1TransactionTypes[transactions.L1[3].id]?.feeLevel > 0 && (
            <View className="flex flex-row gap-3 mt-[1.8rem]">
              {dapps.L1.slice(1).map((txType, index) => (
                <View
                  className="flex flex-col items-center justify-center relative"
                  key={index}
                >
                  <TxButton chain={"L1"} txType={txType} addTransaction={addTransaction} isDapp={true} />
                  {l1DappTypes[txType.id]?.feeLevel === 0 && (
                    <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                      pointer-events-none
                      top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                      <Image
                        source={lockImg}
                        className="h-[3rem] aspect-square rounded-lg mb-3"
                      />
                    </View>
                  )}
                  {(txType.value[l1DappTypes[txType.id]?.feeLevel - 1] !== 0 || l1DappTypes[txType.id]?.feeLevel === 0) && (
                  <Text
                    className="text-[#60f760a0] text-center font-bold text-[1rem]
                               bg-[#292929f0] rounded-lg px-2 py-1 border-2
                               absolute bottom-[-1.4rem] w-[4rem]
                               "
                    style={{
                      color: l1DappTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                      borderColor: txType.color
                    }}
                  >
                    {l1DappTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
                    ₿
                    {l1DappTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1DappTypes[txType.id]?.feeLevel - 1] * mevBoost * prestigeJson[upgradableGameState.prestige].scaler}
                  </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
        {transactions.L1.slice(4).map((txType, index) => (
          <View
            className="flex flex-col relative my-auto aspect-square"
            key={index}
            style={{
              // Dont show if dapps not unlocked
              display: l1TransactionTypes[transactions.L1[3].id]?.feeLevel === 0 ? "none" : "flex"
            }}
          >
            <TxButton chain={"L1"} txType={txType} addTransaction={addTransaction} size={0.2} />
            {l1TransactionTypes[txType.id]?.feeLevel === 0 && (
              <View className="absolute w-full h-full bg-[#292929d0] rounded-lg border-2 border-[#f9f9f920]
                pointer-events-none
                top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
                <Image
                  source={lockImg}
                  className="h-[3rem] aspect-square rounded-lg mb-3"
                />
              </View>
            )}
            {(txType.value[l1TransactionTypes[txType.id]?.feeLevel - 1] !== 0 || l1TransactionTypes[txType.id]?.feeLevel === 0) && (
            <Text
              className="text-[#60f760a0] text-center font-bold text-[1rem]
                         bg-[#292929f0] rounded-lg px-2 py-1 border-2
                         absolute bottom-[-1.4rem] left-[50%] translate-x-[-50%]
                         w-[4rem]
                         "
              style={{
                color: l1TransactionTypes[txType.id]?.feeLevel !== 0 ? "#60f760a0" : "#f76060a0",
                borderColor: txType.color
              }}
            >
              {l1TransactionTypes[txType.id]?.feeLevel === 0 ? "" : "+"}
              ₿
              {l1TransactionTypes[txType.id]?.feeLevel === 0 ? txType.feeCosts[0] : txType.value[l1TransactionTypes[txType.id]?.feeLevel - 1] * mevBoost * prestigeJson[upgradableGameState.prestige].scaler}
            </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default L1Phase;
