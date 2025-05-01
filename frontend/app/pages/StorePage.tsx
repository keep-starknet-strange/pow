import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";

import { useTransactions } from "../context/Transactions";
import { useGame } from "../context/Game";
import { TransactionUpgradeView } from "../components/store/TransactionUpgradeView";
import { UpgradeView } from "../components/store/UpgradeView";
import { AutomationView } from "../components/store/AutomationView";
import { DappsUnlock } from "../components/store/DappsUnlock";
import { L2Unlock } from "../components/store/L2Unlock";
import { StakingUnlock } from "../components/store/StakingUnlock";
import { AlertModal } from "../components/AlertModal";

import transactionsJson from "../configs/transactions.json";
import dappsJson from "../configs/dapps.json";
import upgradesJson from "../configs/upgrades.json";
import automationJson from "../configs/automations.json";

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
    <View className="flex-1">
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
          <>
            <UpgradeCard
              imageSrc={l2BatchImg}
              title="Layer 2 Scaling"
              description="Scale your blockchain with Layer 2 Starknet."
              unlocked={l1TransactionTypes[transactionsJson.L1[4].id].feeLevel > 0}
              cost={transactionsJson.L1[4].feeCosts[l1TransactionTypes[transactionsJson.L1[4].id].feeLevel]}
              disabled={gameState.balance < transactionsJson.L1[4].feeCosts[l1TransactionTypes[transactionsJson.L1[4].id].feeLevel]}
              onPress={() => {
                const item = transactionsJson.L1[4];
                if (l1TransactionTypes[item.id].feeLevel === item.feeCosts.length) return;
                const cost = item.feeCosts[l1TransactionTypes[item.id].feeLevel];
                if (gameState.balance < cost) return;
                l1TxFeeUpgrade(item.id);
                const newBalance = gameState.balance - cost;
                updateBalance(newBalance);

                unlockL2();
              }}
            />

            <UpgradeCard
              containerClass="mt-4"
              imageSrc={stakingImg}
              title="Staking"
              description="Lock coins to earn yield on Chain 2."
              unlocked={upgradableGameState.staking}
              cost={staking[0].costs[0]}
              disabled={gameState.balance < staking[0].costs[0]}
              unlockedBgColor="#9ef7a0d0"
              onPress={() => purchase(staking[0].costs[0],  () => addUpgrade(2, 0))}
            />
          </>
        ) : (
          <View className="flex flex-col gap-[1.2rem] mt-[0.5rem]">
          </View>
        )}
       <View className="h-32" />
     </ScrollView>

    <AlertModal
      visible={insufficientFunds}
      title="Insufficient Funds"
      onClose={() => setInsufficientFunds(false)}
    />
   </View>
  );
}

export default StorePage;
