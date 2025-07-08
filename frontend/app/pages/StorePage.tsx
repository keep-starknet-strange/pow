import { useState, useEffect } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";

import { useTransactions } from "../context/Transactions";
import { useGame } from "../context/Game";
import { useImages } from "../hooks/useImages";
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

import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export const StorePage: React.FC = () => {
  const { dappsUnlocked } = useTransactions();
  const { l2 } = useGame();
  const { getImage } = useImages();
  const { width, height } = Dimensions.get("window");

  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const storeTypes = ["L1", "L2"];
  const [chainId, setChainId] = useState(0);
  const [storeType, setStoreType] = useState(storeTypes[l2 ? 1 : 0]);
  const [storeTransactions, setStoreTransactions] = useState(
    transactionsJson.L1,
  );
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

  const subTabs = ["Transactions", "Upgrades", "Automation"];
  const [activeSubTab, setActiveSubTab] = useState(subTabs[0]);

  return (
    <View className="flex-1 relative">
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("background.shop")}
            fit="fill"
            x={0}
            y={-62}
            width={width}
            height={height}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      <View className="w-full relative">
        <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
          <Image
            image={getImage("shop.title")}
            fit="fill"
            x={0}
            y={0}
            width={width - 8}
            height={24}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <Text className="text-[#fff7ff] text-xl font-bold absolute right-2 font-Pixels">
          SHOP
        </Text>
      </View>
      <View
        className="flex flex-row items-end h-[32px] gap-[2px]"
        style={{ paddingHorizontal: 4, marginTop: 4 }}
      >
        {subTabs.map((tab) => (
          <View
            className="relative flex justify-center"
            style={{
              width: (width - 2 * subTabs.length - 6) / subTabs.length,
              height: activeSubTab === tab ? 32 : 24,
            }}
            key={tab}
          >
            <Canvas style={{ flex: 1 }} className="w-full h-full">
              <Image
                image={getImage(
                  activeSubTab === tab ? "shop.tab.active" : "shop.tab",
                )}
                fit="fill"
                x={0}
                y={0}
                width={(width - 2 * subTabs.length - 6) / subTabs.length}
                height={activeSubTab === tab ? 32 : 24}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Canvas>
            <Text
              className={`font-Pixels text-xl font-bold text-center w-full absolute ${
                activeSubTab === tab ? "text-[#fff7ff]" : "text-[#717171]"
              }`}
              onPress={() => setActiveSubTab(tab)}
            >
              {tab}
            </Text>
          </View>
        ))}
      </View>
      <ScrollView className="flex-1 py-[10px]">
        {activeSubTab === "Transactions" && (
          <View className="flex flex-col px-[16px]">
            {storeTransactions.map((item, index) => (
              <View key={index}>
                <TransactionUpgradeView
                  chainId={chainId}
                  txData={item}
                  isDapp={false}
                />
                {index < storeTransactions.length - 1 && (
                  <View className="h-[3px] w-full bg-[#1b1c26] my-[16px]" />
                )}
              </View>
            ))}
          </View>
        )}
        {activeSubTab === "Upgrades" && (
          <View className="flex flex-col px-[16px]">
            {storeUpgrades.map((item, index) => (
              <View key={index}>
                <UpgradeView chainId={chainId} upgrade={item} />
                {index < storeUpgrades.length - 1 && (
                  <View className="h-[3px] w-full bg-[#1b1c26] my-[16px]" />
                )}
              </View>
            ))}
          </View>
        )}
        {activeSubTab === "Automation" && (
          <View className="flex flex-col px-[16px]">
            {storeAutomation.map((item, index) => (
              <View key={index}>
                <AutomationView chainId={chainId} automation={item} />
                {index < storeAutomation.length - 1 && (
                  <View className="h-[3px] w-full bg-[#1b1c26] my-[16px]" />
                )}
              </View>
            ))}
          </View>
        )}
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
        <View className="h-[40px]" />
      </ScrollView>
    </View>
  );
};

/*
 * TODO
        {dappsUnlocked[chainId] ? (
          <View>
            <View className="flex flex-row justify-between items-center p-2 mt-[1rem]">
              <Text className="text-[#e7e7e7] text-2xl font-bold">Dapps</Text>
            </View>
            <View className="flex flex-col gap-[1.6rem] px-[0.5rem]">
              {storeDapps.map((item, index) => (
                <TransactionUpgradeView
                  key={index}
                  chainId={chainId}
                  txData={item}
                  isDapp={true}
                />
              ))}
            </View>
          </View>
        ) : (
          <DappsUnlock chainId={chainId} />
        )}
        <View className="flex flex-row justify-between items-center p-2 mt-[1rem]">
          <Text className="text-[#e7e7e7] text-2xl font-bold">Scaling</Text>
        </View>
        <View className="h-32" />
      </ScrollView>

      <AlertModal
        visible={insufficientFunds}
        title="Insufficient Funds"
        onClose={() => setInsufficientFunds(false)}
      />
    </View>
  );
};
*/

export default StorePage;
