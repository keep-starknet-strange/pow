import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal } from "react-native";

import { useGameState } from "../context/GameState";
import { useUpgrades } from "../context/Upgrades";

import upgradesJson from "../configs/upgrades.json";

export type StorePageProps = {
  closeHeaderTab: () => void,
};

export const StorePage: React.FC<StorePageProps> = ({ closeHeaderTab }) => {
  const [showModal, setShowModal] = useState(false);

  const { gameState, updateBalance } = useGameState();
  const { upgrades, addUpgrade, isUpgradeActive } = useUpgrades();

  const purchase = (upgradeId: number) => {
    if (gameState.balance < upgradesJson[upgradeId].cost) {
      setShowModal(true);
      return;
    }
 
    const newBalance = gameState.balance - upgradesJson[upgradeId].cost;
    updateBalance(newBalance);
    
    addUpgrade(upgradesJson[upgradeId]);
  };

  return (
    <View className="flex-1">
     <TouchableOpacity
       className="w-full flex items-end p-4"
       onPress={closeHeaderTab}
     >
       <Text className="text-red-600 text-4xl">X</Text>
     </TouchableOpacity>

     <FlatList data={upgradesJson} renderItem={({ item }) => (
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

      <Modal visible={showModal} transparent animationType="slide">
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
