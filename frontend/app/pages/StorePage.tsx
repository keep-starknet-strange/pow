import { useState, useEffect } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTransactions } from "../context/Transactions";
import { useUpgrades } from "../context/Upgrades";
import { useGame } from "../context/Game";
import { useImages } from "../hooks/useImages";
import { TransactionUpgradeView } from "../components/store/TransactionUpgradeView";
import { UpgradeView } from "../components/store/UpgradeView";
import { AutomationView } from "../components/store/AutomationView";
import { DappsUnlock } from "../components/store/DappsUnlock";
import { L2Unlock } from "../components/store/L2Unlock";
import { PrestigeUnlock } from "../components/store/PrestigeUnlock";
import { L1L2Switch } from "../components/L1L2Switch";

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
  const { dappsUnlocked, canUnlockDapps, canUnlockDapp, canUnlockTx } =
    useTransactions();
  const { canUnlockUpgrade } = useUpgrades();
  const { l2 } = useGame();
  const { getImage } = useImages();
  const { width, height } = Dimensions.get("window");

  const [chainId, setChainId] = useState(0);
  const [storeType, setStoreType] = useState<"L1" | "L2">(l2 ? "L2" : "L1");
  const [l2HasInitialized, setL2HasInitialized] = useState(l2 ? true : false);
  useEffect(() => {
    if (l2 && !l2HasInitialized) {
      setStoreType("L2");
      setL2HasInitialized(true);
    }
  }, [l2]);
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
    <View className="flex-1 relative bg-[#101119]">
      <View className="absolute w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("background.shop")}
            fit="fill"
            x={0}
            y={-51}
            width={width}
            height={640}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      </View>
      {l2 && (
        <L1L2Switch
          currentView={storeType}
          setCurrentView={(view: "L1" | "L2") => setStoreType(view)}
        />
      )}
      {l2 ? (
        <View className="w-full relative">
          <Canvas style={{ width: 290, height: 24, marginLeft: 4 }}>
            <Image
              image={getImage("shop.name.plaque")}
              fit="fill"
              x={0}
              y={0}
              width={290}
              height={24}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
          <Animated.Text
            className="text-[#fff7ff] text-xl absolute left-[12px] font-Pixels"
            entering={FadeInLeft}
          >
            SHOP
          </Animated.Text>
        </View>
      ) : (
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
          <Animated.Text
            className="text-[#fff7ff] text-xl absolute right-2 font-Pixels"
            entering={FadeInLeft}
          >
            SHOP
          </Animated.Text>
        </View>
      )}
      <View
        className="flex flex-row items-end h-[32px] gap-[2px]"
        style={{ paddingHorizontal: 4, marginTop: 4 }}
      >
        {subTabs.map((tab) => (
          <View
            className="relative flex justify-center z-[10]"
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
              className={`font-Pixels text-xl text-center w-full absolute ${
                activeSubTab === tab ? "text-[#fff7ff]" : "text-[#717171]"
              }`}
              onPress={() => setActiveSubTab(tab)}
            >
              {tab}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ height: 522, marginTop: 2 }}>
        <ScrollView
          className="flex-1 relative py-[10px]"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {activeSubTab === "Transactions" && (
            <View className="flex flex-col px-[16px]">
              {storeTransactions.map(
                (item, index) =>
                  canUnlockTx(chainId, index) && (
                    <View key={index}>
                      <TransactionUpgradeView
                        chainId={chainId}
                        txData={item}
                        isDapp={false}
                      />
                      <View className="h-[3px] w-full bg-[#1b1c26] my-[16px]" />
                    </View>
                  ),
              )}
            </View>
          )}
          {activeSubTab === "Transactions" && dappsUnlocked[chainId] && (
            <View className="flex flex-col px-[16px]">
              <View className="w-full relative pb-[16px]">
                <Canvas style={{ width: width - 32, height: 24 }}>
                  <Image
                    image={getImage("shop.title")}
                    fit="fill"
                    x={0}
                    y={0}
                    width={width - 32}
                    height={24}
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.Nearest,
                    }}
                  />
                </Canvas>
                <Animated.Text
                  className="text-[#fff7ff] text-xl absolute right-2 font-Pixels"
                  entering={FadeInLeft}
                >
                  DAPPS
                </Animated.Text>
              </View>
              {storeDapps.map(
                (item, index) =>
                  canUnlockDapp(chainId, index) && (
                    <View key={index}>
                      <TransactionUpgradeView
                        chainId={chainId}
                        txData={item}
                        isDapp={true}
                      />
                      <View className="h-[3px] w-full bg-[#1b1c26] my-[16px]" />
                    </View>
                  ),
              )}
            </View>
          )}
          {activeSubTab === "Upgrades" && (
            <View className="flex flex-col px-[16px]">
              {storeUpgrades.map(
                (item, index) =>
                  canUnlockUpgrade(chainId, index) && (
                    <View key={index}>
                      <UpgradeView chainId={chainId} upgrade={item} />
                      <View className="h-[3px] w-full bg-[#1b1c26] my-[16px]" />
                    </View>
                  ),
              )}
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
          {activeSubTab === "Transactions" && <DappsUnlock chainId={chainId} />}
          {storeType === "L1" && activeSubTab === "Automation" && (
            <View className="flex flex-col px-[16px]">
              <View className="h-[3px] w-full bg-[#1b1c26] my-[16px]" />
              <L2Unlock />
            </View>
          )}
          {storeType === "L2" && activeSubTab === "Automation" && (
            <View className="flex flex-col px-[16px]">
              <View className="h-[3px] w-full bg-[#1b1c26] my-[16px]" />
              <PrestigeUnlock />
            </View>
          )}
          <View className="h-[40px]" />
        </ScrollView>
        <LinearGradient
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            marginLeft: 8,
            marginRight: 8,
            pointerEvents: "none",
          }}
          colors={["transparent", "#000000c0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
    </View>
  );
};

export default StorePage;
