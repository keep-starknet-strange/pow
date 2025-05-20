import { useState, useEffect } from "react";
import { ImageBackground, View, Text, ScrollView } from "react-native";

import { useTransactions } from "../context/Transactions";
import { useGame } from "../context/Game";
import { TransactionUpgradeView } from "../components/store/TransactionUpgradeView";
import { UpgradeView } from "../components/store/UpgradeView";
import { AutomationView } from "../components/store/AutomationView";
import { DappsUnlock } from "../components/store/DappsUnlock";
import { L2Unlock } from "../components/store/L2Unlock";
import { StakingUnlock } from "../components/store/StakingUnlock";
import { PrestigeUnlock } from "../components/store/PrestigeUnlock";
import { AlertModal } from "../components/AlertModal";

import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";
import upgradesJson from "../configs/upgrades.json";
import automationJson from "../configs/automations.json";

import background from '../../assets/background.png';

export const StorePage: React.FC = () => {
  const { dappsUnlocked } = useTransactions();
  const { l2 } = useGame();

  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const storeTypes = [
    "L1",
    "L2",
  ];
  const [chainId, setChainId] = useState(0);
  const [storeType, setStoreType] = useState(storeTypes[l2 ? 1 : 0]);
  const [storeTransactions, setStoreTransactions] = useState(transactionsJson.L1);
  const [storeDapps, setStoreDapps] = useState(dappsJson.L1.transactions);
  const [storeUpgrades, setStoreUpgrades] = useState(upgradesJson.L1);
  const [storeAutomation, setStoreAutomation] = useState(automationJson.L1);
  useEffect(() => {
    if (storeType === "L1") {
      setChainId(0);
      setStoreTransactions(transactionsJson.L1);
      setStoreDapps(dappsJson.L1.transactions);
      setStoreUpgrades(upgradesJson.L1);
      setStoreAutomation(automationJson.L1);
    } else {
      setChainId(1);
      setStoreTransactions(transactionsJson.L2);
      setStoreDapps(dappsJson.L2.transactions);
      setStoreUpgrades(upgradesJson.L2);
      setStoreAutomation(automationJson.L2);
    }
  }, [storeType]);

  return (
    <ImageBackground
      className="flex-1"
      source={background}
      resizeMode="cover"
    >
     <View className="flex flex-row justify-end items-center p-2">
       <Text className="text-[#e7e7e7] text-4xl font-bold mr-2">🛒Shop</Text>
       {l2 && storeTypes.map((type) => (
         <Text
           key={type}
           className={`text-[#e7e7e7] text-2xl font-bold mx-2 ${storeType === type ? "underline" : ""}`}
           onPress={() => {
             setStoreType(type);
           }}
         >
           {type}
         </Text>
       ))}
     </View>
     <ScrollView className="flex-1">
       <View className="flex flex-row justify-between items-center p-2">
         <Text className="text-[#e7e7e7] text-2xl font-bold">Transactions</Text>
       </View>
       <View className="flex flex-col gap-[1.6rem] px-[0.5rem]">
         {storeTransactions.map((item, index) => (
           <TransactionUpgradeView key={index} chainId={chainId} txData={item} isDapp={false} />
         ))}
       </View>
       {dappsUnlocked[chainId] ? (
         <View>
           <View className="flex flex-row justify-between items-center p-2 mt-[1rem]">
             <Text className="text-[#e7e7e7] text-2xl font-bold">Dapps</Text>
           </View>
           <View className="flex flex-col gap-[1.6rem] px-[0.5rem]">
             {storeDapps.map((item, index) => (
               <TransactionUpgradeView key={index} chainId={chainId} txData={item} isDapp={true} />
             ))}
           </View>
         </View>
       ) : (
         <DappsUnlock chainId={chainId} />
       )}
       <View className="flex flex-row justify-between items-center p-2 mt-[1rem]">
         <Text className="text-[#e7e7e7] text-2xl font-bold">Upgrades</Text>
        </View>
        <View className="flex flex-col gap-[1.2rem] px-[0.5rem]">
          {storeUpgrades.map((item, index) => (
            <UpgradeView key={index} chainId={chainId} upgrade={item} />
          ))}
        </View>
        <View className="flex flex-row justify-between items-center p-2 mt-[1rem]">
          <Text className="text-[#e7e7e7] text-2xl font-bold">Automations</Text>
        </View>
        <View className="flex flex-col gap-[1.2rem] px-[0.5rem]">
          {storeAutomation.map((item, index) => (
            <AutomationView key={index} chainId={chainId} automation={item} />
          ))}
        </View>
        <View className="flex flex-row justify-between items-center p-2 mt-[1rem]">
          <Text className="text-[#e7e7e7] text-2xl font-bold">Scaling</Text>
        </View>
        {storeType === "L1" ? (
          <View className="flex flex-col gap-[1.2rem] mt-[0.5rem]">
            <StakingUnlock />
            <L2Unlock alwaysShow={true} />
          </View>
        ) : (
          <View className="flex flex-col gap-[1.2rem] mt-[0.5rem]">
            <PrestigeUnlock />
          </View>
        )}
       <View className="h-32" />
     </ScrollView>

    <AlertModal
      visible={insufficientFunds}
      title="Insufficient Funds"
      onClose={() => setInsufficientFunds(false)}
    />
   </ImageBackground>
  );
}

export default StorePage;
