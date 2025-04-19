import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, Image } from "react-native";

import { useGameState } from "../context/GameState";
import { useUpgrades } from "../context/Upgrades";
import { getChainIcons } from "../utils/transactions";

import upgradesJson from "../configs/upgrades.json";
import transactionsJson from "../configs/transactions.json";

export const StorePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const { gameState, updateBalance } = useGameState();
  const { upgrades, addUpgrade, isUpgradeActive, l1TxSpeedUpgrade, l1TxFeeUpgrade, l2TxSpeedUpgrade, l2TxFeeUpgrade, l1TransactionTypes, l2TransactionTypes } = useUpgrades();

  const purchase = (upgradeId: number) => {
    if (gameState.balance < upgradesJson[upgradeId].cost) {
      setShowModal(true);
      return;
    }
 
    const newBalance = gameState.balance - upgradesJson[upgradeId].cost;
    updateBalance(newBalance);
    
    addUpgrade(upgradesJson[upgradeId]);
  };

  const storeTypes = [
    "L1",
    "L2",
  ];
  const [storeType, setStoreType] = useState(storeTypes[0]);
  const [storeTransactions, setStoreTransactions] = useState(transactionsJson.L1);
  const [activeIcons, setActiveIcons] = useState(getChainIcons(1));

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
               if (type === "L1") {
                 setStoreTransactions(transactionsJson.L1);
                 setActiveIcons(getChainIcons(1));
               } else {
                 setStoreTransactions(transactionsJson.L2);
                 setActiveIcons(getChainIcons(2));
               }
             }}
           >
             <Text className="text-[#e7e7e7] text-lg font-bold">{type}</Text>
           </TouchableOpacity>
         ))}
       </View>
     </View>
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
             <Image source={activeIcons[item.name] as any} className="w-[3.6rem] h-[3.6rem] rounded-full" />
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
     <FlatList className="mb-[8rem]" data={upgradesJson} renderItem={({ item }) => (
      <View
        className={`flex flex-row justify-between items-center my-2 p-3 rounded-xl h-[4.2rem] w-[95%] mx-auto`}
        style={{
          backgroundColor:
            item.maxLevel ?
            (upgrades[item.id] && (upgrades[item.id].level || 0) >= item.maxLevel) ?
            "#d0d0d0" : "#f5f5f5" :
            isUpgradeActive(item.id) ? "#d0d0d0" : "#f5f5f5",
          opacity:
            item.maxLevel ?
            (upgrades[item.id] && (upgrades[item.id].level || 0) >= item.maxLevel) ?
            0.5 : 1 :
            isUpgradeActive(item.id) ? 0.5 : 1,
        }}
      >
        <View className="flex flex-col justify-between">
          <Text className="text-[#171717] text-xl">{item.name}</Text>
          <Text className="text-[#171717] text-md">{item.effect}</Text>
        </View>
        <View className="flex flex-row items-center gap-2">
          {item.maxLevel && (
            <Text className="text-[#171717] text-lg ml-4 font-bold">Lvl {upgrades[item.id]?.level || 0} / {item.maxLevel}</Text>
          )}
          <TouchableOpacity
            onPress={() => purchase(item.id)}
            disabled={
              item.maxLevel ?
              (upgrades[item.id] && (upgrades[item.id].level || 0) >= item.maxLevel) :
              isUpgradeActive(item.id)
            }
            className={`p-2 rounded-lg justify-center items-center`}
            style={{
              backgroundColor:
                item.maxLevel ?
                (upgrades[item.id] && (upgrades[item.id].level || 0) >= item.maxLevel) ?
                "gray" : "#d0d0d0" :
                isUpgradeActive(item.id) ? "gray" : "#d0d0d0",
            }}
          >
            <Text className="text-[#171717] text-md">₿{item.cost}</Text>
          </TouchableOpacity>
        </View>
      </View>
     )} />

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
