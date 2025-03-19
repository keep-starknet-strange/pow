import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, Alert } from "react-native";

import { Upgrades } from "../types/Upgrade";
import { useEventManager } from "../context/EventManager";

export type StorePageProps = {
  closeHeaderTab: () => void,
  upgrades: Upgrades,
  setUpgrades: (upgrades: Upgrades) => void;
  balance: number
  setBalance: (balance: number) => void;
};

export const StorePage: React.FC<StorePageProps> = ({ closeHeaderTab, upgrades, setUpgrades, balance, setBalance }) => {
  const { notify } = useEventManager();
  const [showModal, setShowModal] = useState(false);
  const upgradeNames = Object.keys(upgrades);

  const purchase = (upgradeName: string) => {
    if (balance < upgrades[upgradeName].cost) {
      setShowModal(true);
      return;
    }
 
    const newBalance = balance - upgrades[upgradeName].cost;
    setBalance(newBalance);
    notify("BalanceUpdated", { balance: newBalance });

    setUpgrades({
      ...upgrades,
        [upgradeName]: { ...upgrades[upgradeName], purchased: true },
    })
  };

  return (
    <View className="flex-1">
     <TouchableOpacity
       className="w-full flex items-end p-4"
       onPress={closeHeaderTab}
     >
       <Text className="text-red-600 text-4xl">X</Text>
     </TouchableOpacity>

     <FlatList data={upgradeNames} renderItem={({ item }) => (
      <View className={`flex flex-row justify-between items-center my-2 p-3 rounded-xl h-[4.2rem] w-[95%] mx-auto ${
        upgrades[item].purchased ? "bg-gray-300 opacity-50" : "bg-[#f7f7f7]"
      }`}
      >
        <View className="flex flex-col justify-between">
        <Text className="text-[#171717] text-xl">{item}</Text>
        <Text className="text-[#171717] text-md">{upgrades[item].effect}</Text>
        </View>
        <TouchableOpacity onPress={() => purchase(item)} disabled={upgrades[item].purchased} className={`p-2 rounded-lg justify-center items-center ${
          upgrades[item].purchased ? "bg-gray-500" : "bg-[#d0d0d0]"
          }`}
        >
          <Text className="text-[#171717] text-md">₿{upgrades[item].cost}</Text>
        </TouchableOpacity>
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
