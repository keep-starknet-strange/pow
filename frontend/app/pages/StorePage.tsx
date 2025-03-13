import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, Alert } from "react-native";

import { Upgrade } from "../types/Upgrade";

export type StorePageProps = {
  closeHeaderTab: () => void,
  upgrades: Upgrade[],
  setUpgrades: (upgrades: Upgrade[]) => void;
  balance: number
  setBalance: (balance: number) => void;
};

export const StorePage: React.FC<StorePageProps> = ({ closeHeaderTab, upgrades, setUpgrades, balance, setBalance }) => {
  const [showModal, setShowModal] = useState(false);

  const purchase = (item: Upgrade) => {
    if (balance < item.cost) {
      setShowModal(true);
      return;
    }


    setBalance(balance - item.cost);
    setUpgrades(
      upgrades.map((upgrade) =>
        upgrade.name === item.name ? { ...upgrade, purchased: true } : upgrade
      )
    );
  };

  return (
    <View className="flex-1">
     <Text className="text-xl text-white">Store Page</Text>
     <TouchableOpacity
       className=""
       onPress={closeHeaderTab}
     >
       <Text className="text-red-600 text-4xl">X</Text>
     </TouchableOpacity>

     <FlatList data={upgrades} renderItem={({ item }) => (
      <View className={`flex flex-row justify-between items-center my-2 p-3 rounded-xl h-[4.2rem] w-[95%] mx-auto ${
        item.purchased ? "bg-gray-300 opacity-50" : "bg-[#f7f7f7]"
      }`}
      >
        <View className="flex flex-col justify-between">
        <Text className="text-[#171717] text-xl">{item.name}</Text>
        <Text className="text-[#171717] text-md">{item.effect}</Text>
        </View>
        <TouchableOpacity onPress={() => purchase(item)} disabled={item.purchased} className={`p-2 rounded-lg justify-center items-center ${
          item.purchased ? "bg-gray-500" : "bg-[#d0d0d0]"
          }`}
        >
          <Text className="text-[#171717] text-md">₿{item.cost}</Text>
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
