import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";

import { useGameState } from "../context/GameState";
import { useUpgrades } from "../context/Upgrades";
import { getChainIcons } from "../utils/transactions";
import { getUpgradeIcons, getAutomationIcons } from "../utils/upgrades";

import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";
import upgradesJson from "../configs/upgrades.json";
import automationJson from "../configs/automation.json";

export const StorePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const { gameState, updateBalance } = useGameState();
  const { upgrades, addUpgrade, automation, upgradeAutomation,
          l1TxSpeedUpgrade, l1TxFeeUpgrade, l2TxSpeedUpgrade, l2TxFeeUpgrade, l1TransactionTypes, l2TransactionTypes,
          l1DappTypes, l2DappTypes, l1DappFeeUpgrade, l2DappFeeUpgrade, l1DappSpeedUpgrade, l2DappSpeedUpgrade
          } = useUpgrades();

  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [prestigeCosts, setPrestigeCosts] = useState([1000, 2000, 3000]);

  const storeTypes = [
    "L1",
    "L2",
  ];
  const [chainId, setChainId] = useState(0);
  const [storeType, setStoreType] = useState(storeTypes[0]);
  const [storeTransactions, setStoreTransactions] = useState(transactionsJson.L1.slice(0, 3));
  const [activeChainIcons, setActiveChainIcons] = useState(getChainIcons(1));
  const [storeDapps, setStoreDapps] = useState(dappsJson.L1);
  const [storeUpgrades, setStoreUpgrades] = useState(upgradesJson.L1);
  const [activeUpgradeIcons, setActiveUpgradeIcons] = useState(getUpgradeIcons(1));
  const [storeAutomation, setStoreAutomation] = useState(automationJson.L1);
  const [activeAutomationIcons, setActiveAutomationIcons] = useState(getAutomationIcons(1));
  useEffect(() => {
    if (storeType === "L1") {
      setChainId(0);
      setStoreTransactions(transactionsJson.L1.slice(0, 3));
      setStoreDapps(dappsJson.L1);
      setActiveChainIcons(getChainIcons(1));
      setStoreUpgrades(upgradesJson.L1);
      setActiveUpgradeIcons(getUpgradeIcons(1));
      setStoreAutomation(automationJson.L1);
      setActiveAutomationIcons(getAutomationIcons(1));
    } else {
      setChainId(1);
      setStoreTransactions(transactionsJson.L2.slice(0, 3).concat(transactionsJson.L2.slice(4)));
      setStoreDapps(dappsJson.L2);
      setActiveChainIcons(getChainIcons(2));
      setStoreUpgrades(upgradesJson.L2);
      setActiveUpgradeIcons(getUpgradeIcons(2));
      setStoreAutomation(automationJson.L2);
      setActiveAutomationIcons(getAutomationIcons(2));
    }
  }, [storeType]);

  return (
    <View className="flex-1">
     <View className="flex flex-row justify-end items-center p-2">
       <Text className="text-[#e7e7e7] text-4xl font-bold mr-4">🛒Shop</Text>
       <View className="flex flex-row justify-center items-center gap-2">
         {storeTypes.map((type, index) => (
           <TouchableOpacity
             key={index}
             className={`p-2 rounded-lg ${storeType === type ? "bg-[#e7e7e770]" : ""}`}
             onPress={() => {
               setStoreType(type);
             }}
           >
             <Text className="text-[#e7e7e7] text-lg font-bold">{type}</Text>
           </TouchableOpacity>
         ))}
       </View>
     </View>
     <ScrollView className="flex-1">
       <View className="flex flex-row justify-between items-center p-2">
         <Text className="text-[#e7e7e7] text-2xl font-bold">Transaction Types</Text>
       </View>
       <View className="flex flex-col mb-4">
         {storeTransactions.map((item, index) => (
           <View className="flex flex-row w-full px-4 py-3 items-center" key={index}>
             <View className="flex flex-col justify-center items-center p-1
                              rounded-full border-2 border-[#e7e7e740] relative"
                   style={{
                     backgroundColor: item.color
                   }}
             >
               <Image source={activeChainIcons[item.name] as any} className="w-[3.6rem] h-[3.6rem] rounded-full" />
             </View>
             <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
               <Text className="text-[#e7e7e7] text-xl font-bold">{item.name}</Text>
               <Text className="text-[#e7e7e7] text-md">{item.description}</Text>
             </View>
             <TouchableOpacity
               className="flex justify-center items-center bg-[#e7e7e730] rounded-lg p-2 relative
                          border-2 border-[#e7e7e740] mr-1
               "
               onPress={() => {
                 if (storeType === "L2") {
                   if (l2TransactionTypes[item.id].feeLevel === item.feeCosts.length) return;
                   const cost = item.feeCosts[l2TransactionTypes[item.id].feeLevel];
                   if (gameState.balance < cost) return;
                   l2TxFeeUpgrade(item.id);
                   const newBalance = gameState.balance - cost;
                   updateBalance(newBalance);
                 } else {
                   if (l1TransactionTypes[item.id].feeLevel === item.feeCosts.length) return;
                   const cost = item.feeCosts[l1TransactionTypes[item.id].feeLevel];
                   if (gameState.balance < cost) return;
                   l1TxFeeUpgrade(item.id);
                   const newBalance = gameState.balance - cost;
                   updateBalance(newBalance);
                 }
               }}
             >
               <Image source={require("../../assets/images/money.png")} className="w-[3rem] h-[3rem]" />
               {storeType === "L1" ? (
               <Text
                 className="absolute bottom-[-1rem] w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold"
                 style={{
                   backgroundColor: item.color.substring(0, 7) + "d0",
                 }}
               >
                 {l1TransactionTypes[item.id].feeLevel}/{item.feeCosts.length}
              </Text>
              ) : (
               <Text
                 className="absolute bottom-[-1rem] w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold"
                 style={{
                   backgroundColor: item.color.substring(0, 7) + "d0",
                 }}
               >
                 {l2TransactionTypes[item.id].feeLevel}/{item.feeCosts.length}
              </Text>
              )}
              {storeType === "L1" ? (
              <Text
                className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                           border-2 border-[#e7e7e740] rounded-xl
                           text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                {l1TransactionTypes[item.id].feeLevel === item.feeCosts.length ? "Max" : `₿${item.feeCosts[l1TransactionTypes[item.id].feeLevel]}`}
              </Text>
              ) : (
              <Text
                className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                           border-2 border-[#e7e7e740] rounded-xl
                           text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                {l2TransactionTypes[item.id].feeLevel === item.feeCosts.length ? "Max" : `₿${item.feeCosts[l2TransactionTypes[item.id].feeLevel]}`}
              </Text>
              )}
             </TouchableOpacity>
             <TouchableOpacity
               className="flex justify-center items-center bg-[#e7e7e730] rounded-lg p-2 relative
                          border-2 border-[#e7e7e740]
               "
               onPress={() => {
                 if (storeType === "L2") {
                   if (l2TransactionTypes[item.id].speedLevel === item.speedCosts.length) return;
                   const cost = item.speedCosts[l2TransactionTypes[item.id].speedLevel];
                   if (gameState.balance < cost) return;
                   l2TxSpeedUpgrade(item.id);
                   const newBalance = gameState.balance - cost;
                   updateBalance(newBalance);
                 } else {
                   if (l1TransactionTypes[item.id].speedLevel === item.speedCosts.length) return;
                   const cost = item.speedCosts[l1TransactionTypes[item.id].speedLevel];
                   if (gameState.balance < cost) return;
                   l1TxSpeedUpgrade(item.id);
                   const newBalance = gameState.balance - cost;
                   updateBalance(newBalance);
                 }
               }}
             >
               <Image source={require("../../assets/images/overclock.png")} className="w-[3rem] h-[3rem]" />
               {storeType === "L1" ? (
               <Text
                 className="absolute bottom-[-1rem]  w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold"
                 style={{
                   backgroundColor: item.color.substring(0, 7) + "d0",
                 }}
               >
                 {l1TransactionTypes[item.id].speedLevel}/{item.speedCosts.length}
              </Text>
              ) : (
               <Text
                 className="absolute bottom-[-1rem]  w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold"
                 style={{
                   backgroundColor: item.color.substring(0, 7) + "d0",
                 }}
               >
                 {l2TransactionTypes[item.id].speedLevel}/{item.speedCosts.length}
              </Text>
              )}
              {storeType === "L1" ? (
              <Text
                className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                           border-2 border-[#e7e7e740] rounded-xl
                           text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                {l1TransactionTypes[item.id].speedLevel === item.speedCosts.length ? "Max" : `₿${item.speedCosts[l1TransactionTypes[item.id].speedLevel]}`}
              </Text>
              ) : (
              <Text
                className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                           border-2 border-[#e7e7e740] rounded-xl
                           text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                {l2TransactionTypes[item.id].speedLevel === item.speedCosts.length ? "Max" : `₿${item.speedCosts[l2TransactionTypes[item.id].speedLevel]}`}
              </Text>
              )}
             </TouchableOpacity>
           </View>
         ))}
       </View>
       <View className="flex flex-row justify-between items-center p-2">
         <Text className="text-[#e7e7e7] text-2xl font-bold">Dapps</Text>
       </View>
       <View className="flex flex-col mb-4">
         {storeDapps.map((item, index) => (
           <View className="flex flex-row w-full px-4 py-3 items-center" key={index}>
             <View className="flex flex-col justify-center items-center p-1
                              rounded-full border-2 border-[#e7e7e740] relative"
                   style={{
                     backgroundColor: item.color
                   }}
             >
               <Image source={activeChainIcons[item.name] as any} className="w-[3.6rem] h-[3.6rem] rounded-full" />
             </View>
             <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
               <Text className="text-[#e7e7e7] text-xl font-bold">{item.name}</Text>
               <Text className="text-[#e7e7e7] text-md">{item.description}</Text>
             </View>
             <TouchableOpacity
               className="flex justify-center items-center bg-[#e7e7e730] rounded-lg p-2 relative
                          border-2 border-[#e7e7e740] mr-1
               "
               onPress={() => {
                 if (storeType === "L2") {
                   if (l2DappTypes[item.id].feeLevel === item.feeCosts.length) return;
                   const cost = item.feeCosts[l2DappTypes[item.id].feeLevel];
                   if (gameState.balance < cost) return;
                   l2DappFeeUpgrade(item.id);
                   const newBalance = gameState.balance - cost;
                   updateBalance(newBalance);
                 } else {
                   if (l1DappTypes[item.id].feeLevel === item.feeCosts.length) return;
                   const cost = item.feeCosts[l1DappTypes[item.id].feeLevel];
                   if (gameState.balance < cost) return;
                   l1DappFeeUpgrade(item.id);
                   const newBalance = gameState.balance - cost;
                   updateBalance(newBalance);
                 }
               }}
             >
               <Image source={require("../../assets/images/money.png")} className="w-[3rem] h-[3rem]" />
               {storeType === "L1" ? (
               <Text
                 className="absolute bottom-[-1rem] w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold"
                 style={{
                   backgroundColor: item.color.substring(0, 7) + "d0",
                 }}
               >
                 {l1DappTypes[item.id].feeLevel}/{item.feeCosts.length}
              </Text>
              ) : (
               <Text
                 className="absolute bottom-[-1rem] w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold"
                 style={{
                   backgroundColor: item.color.substring(0, 7) + "d0",
                 }}
               >
                 {l2DappTypes[item.id].feeLevel}/{item.feeCosts.length}
              </Text>
              )}
              {storeType === "L1" ? (
              <Text
                className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                           border-2 border-[#e7e7e740] rounded-xl
                           text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                {l1DappTypes[item.id].feeLevel === item.feeCosts.length ? "Max" : `₿${item.feeCosts[l1DappTypes[item.id].feeLevel]}`}
              </Text>
              ) : (
              <Text
                className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                           border-2 border-[#e7e7e740] rounded-xl
                           text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                {l2DappTypes[item.id].feeLevel === item.feeCosts.length ? "Max" : `₿${item.feeCosts[l2DappTypes[item.id].feeLevel]}`}
              </Text>
              )}
             </TouchableOpacity>
             <TouchableOpacity
               className="flex justify-center items-center bg-[#e7e7e730] rounded-lg p-2 relative
                          border-2 border-[#e7e7e740]
               "
               onPress={() => {
                 if (storeType === "L2") {
                   if (l2DappTypes[item.id].speedLevel === item.speedCosts.length) return;
                   const cost = item.speedCosts[l2DappTypes[item.id].speedLevel];
                   if (gameState.balance < cost) return;
                   l2DappSpeedUpgrade(item.id);
                   const newBalance = gameState.balance - cost;
                   updateBalance(newBalance);
                 } else {
                   if (l1DappTypes[item.id].speedLevel === item.speedCosts.length) return;
                   const cost = item.speedCosts[l1DappTypes[item.id].speedLevel];
                   if (gameState.balance < cost) return;
                   l1DappSpeedUpgrade(item.id);
                   const newBalance = gameState.balance - cost;
                   updateBalance(newBalance);
                 }
               }}
             >
               <Image source={require("../../assets/images/overclock.png")} className="w-[3rem] h-[3rem]" />
               {storeType === "L1" ? (
               <Text
                 className="absolute bottom-[-1rem]  w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold"
                 style={{
                   backgroundColor: item.color.substring(0, 7) + "d0",
                 }}
               >
                 {l1DappTypes[item.id].speedLevel}/{item.speedCosts.length}
              </Text>
              ) : (
               <Text
                 className="absolute bottom-[-1rem]  w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold"
                 style={{
                   backgroundColor: item.color.substring(0, 7) + "d0",
                 }}
               >
                 {l2DappTypes[item.id].speedLevel}/{item.speedCosts.length}
              </Text>
              )}
              {storeType === "L1" ? (
              <Text
                className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                           border-2 border-[#e7e7e740] rounded-xl
                           text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                {l1DappTypes[item.id].speedLevel === item.speedCosts.length ? "Max" : `₿${item.speedCosts[l1DappTypes[item.id].speedLevel]}`}
              </Text>
              ) : (
              <Text
                className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                           border-2 border-[#e7e7e740] rounded-xl
                           text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                {l2DappTypes[item.id].speedLevel === item.speedCosts.length ? "Max" : `₿${item.speedCosts[l2DappTypes[item.id].speedLevel]}`}
              </Text>
              )}
             </TouchableOpacity>
           </View>
         ))}
       </View>
       <View className="flex flex-row justify-between items-center p-2">
         <Text className="text-[#e7e7e7] text-2xl font-bold">Upgrades</Text>
       </View>
       <View className="flex flex-col mb-4">
         {storeUpgrades.map((item, index) => (
           <View className="flex flex-row w-full px-4 py-3 items-center" key={index}>
             <View className="flex flex-col justify-center items-center p-1
                              rounded-full border-2 border-[#e7e7e740] relative"
                   style={{
                     backgroundColor: item.color
                   }}
             >
               <Image source={activeUpgradeIcons[item.name] as any} className="w-[3.6rem] h-[3.6rem] rounded-full" />
               <Text
                 className="absolute bottom-[-0.5rem] w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold bg-[#e7e760c0]"
                  style={{
                    backgroundColor: item.color.substring(0, 7) + "d0",
                  }}
                >
                  {upgrades[chainId][item.id] ? upgrades[chainId][item.id].level : 0}/{item.costs.length}
                </Text>
             </View>
             <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
               <Text className="text-[#e7e7e7] text-xl font-bold">{item.name}</Text>
               <Text className="text-[#e7e7e7] text-md">{item.description}</Text>
             </View>
             <TouchableOpacity
               className="flex justify-center items-center bg-[#e7e7e730] rounded-lg p-2 relative
                          border-2 border-[#e7e7e740]
               "
               onPress={() => {
                 // TODO: Check if max?
                 addUpgrade(chainId, item.id);
               }}
             >
               <Image source={require("../../assets/images/money.png")} className="w-[3rem] h-[3rem]" />
               <Text
                 className="absolute top-[-0.5rem] w-full text-center px-1 w-[4rem]
                            border-2 border-[#e7e7e740] rounded-xl
                            text-[#171717] text-sm font-bold bg-[#e7e760c0]"
              >
                { upgrades[chainId][item.id].level === item.costs.length ? "Max" :
                  `₿${item.costs[upgrades[chainId][item.id] ? upgrades[chainId][item.id].level : 0]}`
                }
              </Text>
             </TouchableOpacity>
           </View>
         ))}
       </View>
       <View className="flex flex-row justify-between items-center p-2">
         <Text className="text-[#e7e7e7] text-2xl font-bold">Automation</Text>
       </View>
       <View className="flex flex-col mb-4">
         {storeAutomation.map((item, index) => (
           <View className="flex flex-row w-full px-4 py-3 items-center" key={index}>
             <View className="flex flex-col justify-center items-center p-1
                              rounded-full border-2 border-[#e7e7e740] relative"
                   style={{
                     backgroundColor: item.color
                   }}
             >
               <Image source={activeAutomationIcons[item.name] as any} className="w-[5.4rem] h-[5.4rem] rounded-full" />
             </View>
             <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
               <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
                 <Text className="text-[#e7e7e7] text-xl font-bold">{item.name}</Text>
                 <Text className="text-[#e7e7e7] text-md">{item.description}</Text>
               </View>
               <View className="flex flex-row justify-start items-start ml-2 gap-1 flex-1">
                 {item.levels.map((level, index) => (
                   <TouchableOpacity
                     key={index}
                     className="flex justify-center items-center rounded-lg p-2 relative"
                     style={{
                       backgroundColor:
                         automation[chainId][item.id].level <= index ?
                           "#e7e7e730" :
                           level.color,
                     }}
                     onPress={() => {
                       upgradeAutomation(chainId, item.id);
                     }}
                   >
                     <Image source={activeAutomationIcons[item.name][level.name] as any} className="w-[2rem] h-[2rem]" />
                     <Text
                       className="absolute top-[-0.5rem] w-full text-center px-1 w-[4.2rem]
                                  border-2 border-[#e7e7e740] rounded-xl
                                  text-[#171717] text-sm font-bold bg-[#e7e760c0]"
                      >
                        {`₿${level.cost}`}
                      </Text>
                      <Text
                        className="absolute bottom-[-1rem] text-center text-nowrap w-[20rem]
                                   text-[#f7f7f7] text-xs"
                      >
                        {level.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
           </View>
         ))}
        </View>
        <View className="w-full h-[2px] bg-[#e7e7e740] my-2" />
        {storeType === "L1" ? (
          <View className="flex flex-row justify-between items-center p-2 mx-2
                           bg-[#e760e740] rounded-lg border-2 border-[#e7e7e740] relative"
          >
            <Image source={require("../../assets/images/transaction/l2Batch.png")} className="w-[3.6rem] h-[3.6rem] rounded-full" />
            <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
              <Text className="text-[#e7e7e7] text-xl font-bold">Layer 2 Scaling</Text>
              <Text className="text-[#e7e7e7] text-md">Scale your blockchain with Layer 2 Starknet.</Text>
            </View>
            {l1TransactionTypes[transactionsJson.L1[4].id].feeLevel === 0 ? (
            <TouchableOpacity
              className="flex flex-1 justify-center items-center bg-[#e7e760e0] rounded-lg p-2 relative
                         border-2 border-[#e7e7e740] mr-1
              "
              onPress={() => {
                const item = transactionsJson.L1[4];
                if (l1TransactionTypes[item.id].feeLevel === item.feeCosts.length) return;
                const cost = item.feeCosts[l1TransactionTypes[item.id].feeLevel];
                if (gameState.balance < cost) return;
                l1TxFeeUpgrade(item.id);
                const newBalance = gameState.balance - cost;
                updateBalance(newBalance);
              }}
            >
              <Text
                className="text-[#171717] text-md font-bold"
              >
                Unlock - ₿{transactionsJson.L1[4].feeCosts[l1TransactionTypes[transactionsJson.L1[4].id].feeLevel]}
              </Text>
            </TouchableOpacity>
            ) : (
              <View
                className="flex flex-1 justify-center items-center bg-[#e7e760e0] rounded-lg p-2 relative
                           border-2 border-[#e7e7e740] mr-1"
                style={{
                  backgroundColor: transactionsJson.L1[4].color.substring(0, 7) + "d0",
                }}
              >
                <Text
                  className="text-[#171717] text-md font-bold"
                >
                  Unlocked!
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
          {prestigeLevel < prestigeCosts.length && (
            <View className="flex flex-row justify-between items-center p-2 mx-2
                             bg-[#e760e740] rounded-lg border-2 border-[#e7e7e740] relative"
            >
              <Image source={require("../../assets/images/transaction/nfts/7.png")} className="w-[3.6rem] h-[3.6rem] rounded-full" />
              <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
                <Text className="text-[#e7e7e7] text-xl font-bold">Prestige!</Text>
                <Text className="text-[#e7e7e7] text-md">Complete the game and reset with Prestige upgrades!</Text>
              </View>
              <TouchableOpacity
                className="flex flex justify-center items-center bg-[#e7e760e0] rounded-lg p-2 relative
                           border-2 border-[#e7e7e740] mr-1
                "
                onPress={() => {
                  if (gameState.balance < prestigeCosts[prestigeLevel]) {
                    setShowModal(true);
                    return;
                  }
                  const newBalance = gameState.balance - prestigeCosts[prestigeLevel];
                  updateBalance(newBalance);
                  setPrestigeLevel(prestigeLevel + 1);
                }}
              >
                <Text
                  className="text-[#171717] text-md font-bold"
                >
                  Unlock - ₿{prestigeCosts[prestigeLevel]}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          </>
        )}
        <View className="h-32" />
     </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-lg font-bold text-black">Insufficient Funds</Text>
            <TouchableOpacity className="mt-2 bg-red-500 p-2 rounded-lg" onPress={() => setShowModal(false)}>
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

   </View>
  );
}

export default StorePage;
