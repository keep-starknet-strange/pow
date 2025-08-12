import { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";

import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useL2Store } from "@/app/stores/useL2Store";
import { useEventManager } from "@/app/stores/useEventManager";
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "@/app/stores/useTutorialStore";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useImages } from "../hooks/useImages";
import { TransactionUpgradeView } from "../components/store/TransactionUpgradeView";
import { UpgradeView } from "../components/store/UpgradeView";
import { AutomationView } from "../components/store/AutomationView";
import { DappsUnlock } from "../components/store/DappsUnlock";
import { L2Unlock } from "../components/store/L2Unlock";
import { PrestigeUnlock } from "../components/store/PrestigeUnlock";
import { L1L2Switch } from "../components/L1L2Switch";
import { ShopTitle } from "../components/store/ShopTitle";
import { useCachedWindowDimensions } from "../hooks/useCachedDimensions";

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
  const { ref: upgradesTabRef, onLayout: upgradesTabOnLayout } =
    useTutorialLayout("chainUpgradeTab" as TargetId, true);
  const { ref: automationTabRef, onLayout: automationTabOnLayout } =
    useTutorialLayout("chainAutomationTab" as TargetId, true);
  const isFocused = useIsFocused();
  const {
    dappsUnlocked,
    canUnlockDapp,
    canUnlockTx,
    transactionFeeLevels,
    transactionSpeedLevels,
    dappFeeLevels,
    dappSpeedLevels,
  } = useTransactionsStore();
  const { canUnlockUpgrade, upgrades, automations } = useUpgrades();
  const isL2Unlocked = useL2Store((state) => state.isL2Unlocked);
  const { getImage } = useImages();
  const { notify } = useEventManager();
  const { width } = useCachedWindowDimensions();

  const [chainId, setChainId] = useState(0);
  const [storeType, setStoreType] = useState<"L1" | "L2">(
    isL2Unlocked ? "L2" : "L1",
  );

  const handleStoreViewChange = useCallback(
    (view: "L1" | "L2") => {
      setStoreType(view);
      notify("SwitchStore", { name: view });
    },
    [notify],
  );
  useEffect(() => {
    if (!isL2Unlocked) {
      setStoreType("L1");
    }
  }, [isL2Unlocked]);
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

  const storeData = useMemo(() => {
    const data: any[] = [];

    if (activeSubTab === "Transactions") {
      // Add transactions
      storeTransactions.forEach((item, index) => {
        if (canUnlockTx(chainId, index)) {
          data.push({
            type: "transaction",
            data: item,
            chainId,
            index,
            id: `tx-${chainId}-${index}`,
          });
          data.push({
            type: "separator",
            id: `tx-sep-${chainId}-${index}`,
          });
        }
      });

      // Add dApps section if unlocked
      if (dappsUnlocked[chainId]) {
        data.push({
          type: "dapps-header",
          id: "dapps-header",
        });

        storeDapps.forEach((item, index) => {
          if (canUnlockDapp(chainId, index)) {
            data.push({
              type: "dapp",
              data: item,
              chainId,
              index,
              id: `dapp-${chainId}-${index}`,
            });
            data.push({
              type: "separator",
              id: `dapp-sep-${chainId}-${index}`,
            });
          }
        });
      }

      // Add DappsUnlock component
      data.push({
        type: "dapps-unlock",
        chainId,
        id: "dapps-unlock",
      });
    }

    if (activeSubTab === "Upgrades") {
      storeUpgrades.forEach((item, index) => {
        if (canUnlockUpgrade(chainId, index)) {
          data.push({
            type: "upgrade",
            data: item,
            chainId,
            index,
            id: `upgrade-${chainId}-${index}`,
          });
          data.push({
            type: "separator",
            id: `upgrade-sep-${chainId}-${index}`,
          });
        }
      });
    }

    if (activeSubTab === "Automation") {
      storeAutomation.forEach((item, index) => {
        data.push({
          type: "automation",
          data: item,
          chainId,
          index,
          id: `automation-${chainId}-${index}`,
        });
        if (index < storeAutomation.length - 1) {
          data.push({
            type: "separator",
            id: `automation-sep-${chainId}-${index}`,
          });
        }
      });

      // Add unlock components
      if (storeType === "L1") {
        data.push({
          type: "separator",
          id: "l2-unlock-sep",
        });
        data.push({
          type: "l2-unlock",
          id: "l2-unlock",
        });
      } else {
        data.push({
          type: "separator",
          id: "prestige-unlock-sep",
        });
        data.push({
          type: "prestige-unlock",
          id: "prestige-unlock",
        });
      }
    }

    // Add bottom spacer
    data.push({
      type: "spacer",
      id: "bottom-spacer",
    });

    return data;
  }, [
    activeSubTab,
    storeTransactions,
    storeDapps,
    storeUpgrades,
    storeAutomation,
    chainId,
    storeType,
    canUnlockTx,
    canUnlockDapp,
    canUnlockUpgrade,
    dappsUnlocked,
    transactionFeeLevels,
    transactionSpeedLevels,
    dappFeeLevels,
    dappSpeedLevels,
    upgrades,
    automations,
  ]);

  const renderStoreItem = useCallback(
    ({ item }: { item: any }) => {
      switch (item.type) {
        case "transaction":
          return (
            <View className="px-[16px]">
              <TransactionUpgradeView
                chainId={item.chainId}
                txData={item.data}
                isDapp={false}
              />
            </View>
          );

        case "dapp":
          return (
            <View className="px-[16px]">
              <TransactionUpgradeView
                chainId={item.chainId}
                txData={item.data}
                isDapp={true}
              />
            </View>
          );

        case "upgrade":
          return (
            <View className="px-[16px]">
              <UpgradeView chainId={item.chainId} upgrade={item.data} />
            </View>
          );

        case "automation":
          return (
            <View className="px-[16px]">
              <AutomationView chainId={item.chainId} automation={item.data} />
            </View>
          );

        case "separator":
          return <View className="h-[3px] bg-[#1b1c26] my-[16px] mx-[2%]" />;

        case "dapps-header":
          return (
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
            </View>
          );

        case "dapps-unlock":
          return (
            <View className="px-[16px]">
              <DappsUnlock chainId={item.chainId} />
            </View>
          );

        case "l2-unlock":
          return (
            <View className="px-[16px]">
              <L2Unlock />
            </View>
          );

        case "prestige-unlock":
          return (
            <View className="px-[16px]">
              <PrestigeUnlock />
            </View>
          );

        case "spacer":
          return <View className="h-[40px]" />;

        default:
          return null;
      }
    },
    [chainId, width, getImage],
  );

  if (!isFocused) {
    return <View className="flex-1 bg-[#101119]"></View>; // Return empty view if not focused
  }

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
      {isL2Unlocked && (
        <L1L2Switch
          currentView={storeType}
          setCurrentView={handleStoreViewChange}
          isStore={true}
        />
      )}
      <ShopTitle position={isL2Unlocked ? "left" : "right"} />
      <View
        className="flex flex-row items-end h-[32px] gap-[2px]"
        style={{ paddingHorizontal: 4, marginTop: 4 }}
      >
        {subTabs.map((tab) => (
          <Pressable
            className="relative flex justify-center z-[10]"
            style={{
              width: (width - 2 * subTabs.length - 6) / subTabs.length,
              height: activeSubTab === tab ? 32 : 24,
            }}
            key={tab}
            onLayout={
              tab === "Upgrades"
                ? upgradesTabOnLayout
                : tab === "Automation"
                  ? automationTabOnLayout
                  : undefined
            }
            ref={
              tab === "Upgrades"
                ? upgradesTabRef
                : tab === "Automation"
                  ? automationTabRef
                  : undefined
            }
            onPress={() => {
              setActiveSubTab(tab);
              notify("SwitchStore", { name: tab });
            }}
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
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 522, marginTop: 2 }}>
        <FlatList
          data={storeData}
          className="flex-1 relative py-[10px]"
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderStoreItem}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={15}
          removeClippedSubviews={false}
          getItemLayout={undefined}
        />
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
