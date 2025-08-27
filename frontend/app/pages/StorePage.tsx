import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import type {
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";

import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useL2Store } from "@/app/stores/useL2Store";
import { useEventManager } from "@/app/stores/useEventManager";
import { TutorialRefView } from "@/app/components/tutorial/TutorialRefView";
import {
  TargetId,
  useIsTutorialTargetActive,
} from "@/app/stores/useTutorialStore";
import { useUpgrades } from "../stores/useUpgradesStore";
import { useImages } from "../hooks/useImages";
import { StoreListItem } from "../components/store/StoreListItem";

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

const GradientBaseStyle = {
  position: "absolute" as const,
  bottom: 0,
  left: 0,
  right: 0,
  height: 200,
  marginLeft: 8,
  marginRight: 8,
  pointerEvents: "none" as const,
};

const Separator = memo(({ leadingItem }: { leadingItem?: any }) => {
  if (leadingItem?.type === "dapps-header") return null;
  return <View className="h-[3px] bg-[#1b1c26] my-[16px] mx-[2%]" />;
});

const ListFooter = memo(() => <View className="h-[40px]" />);

export const StorePage: React.FC = () => {
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
  const [listViewportHeight, setListViewportHeight] = useState(0);
  const [showBottomFade, setShowBottomFade] = useState(true);
  const SCROLL_BOTTOM_THRESHOLD = 16;
  const prevFadeRef = useRef(showBottomFade);
  const setFadeIfChanged = useCallback((next: boolean) => {
    if (prevFadeRef.current !== next) {
      prevFadeRef.current = next;
      setShowBottomFade(next);
    }
  }, []);
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

  const subTabs = useMemo(
    () => ["Transactions", "Upgrades", "Automation"] as const,
    [],
  );
  type SubTab = (typeof subTabs)[number];
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(subTabs[0]);

  const isChainUpgradeTabActive = useIsTutorialTargetActive(
    "chainUpgradeTab" as TargetId,
  );
  const isChainAutomationTabActive = useIsTutorialTargetActive(
    "chainAutomationTab" as TargetId,
  );
  const stepTabOverrides = useMemo(
    () =>
      ({
        Transactions: false,
        Upgrades: isChainUpgradeTabActive,
        Automation: isChainAutomationTabActive,
      }) as const,
    [isChainUpgradeTabActive, isChainAutomationTabActive],
  );

  const isTabActive = useCallback(
    (tab: SubTab) => Boolean(stepTabOverrides[tab]) || activeSubTab === tab,
    [activeSubTab, stepTabOverrides],
  );

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
          }
        });
      }
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
      });

      // Add unlock components
      if (storeType !== "L1") {
        data.push({
          type: "prestige-unlock",
          id: "prestige-unlock",
        });
      }
    }

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
    ({ item }: { item: any }) => (
      <StoreListItem item={item} width={width} getImage={getImage} />
    ),
    [width, getImage],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const isAtBottom =
        contentOffset.y + layoutMeasurement.height >=
        contentSize.height - SCROLL_BOTTOM_THRESHOLD;
      setFadeIfChanged(
        !isAtBottom && contentSize.height > layoutMeasurement.height,
      );
    },
    [setFadeIfChanged],
  );

  const handleListLayout = useCallback((e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    setListViewportHeight(height);
  }, []);

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
        {subTabs.map((tab) => {
          const active = isTabActive(tab);
          const tabWidth = (width - 2 * subTabs.length - 6) / subTabs.length;
          return (
            <Pressable
              className="relative flex justify-center z-[10]"
              style={{
                width: tabWidth,
                height: active ? 32 : 24,
              }}
              key={tab}
              onPress={() => {
                setActiveSubTab(tab);
                notify("SwitchStore", { name: tab });
              }}
            >
              {tab === "Upgrades" && (
                <TutorialRefView targetId="chainUpgradeTab" enabled={true} />
              )}
              {tab === "Automation" && (
                <TutorialRefView targetId="chainAutomationTab" enabled={true} />
              )}
              <Canvas style={{ flex: 1 }} className="w-full h-full">
                <Image
                  image={getImage(active ? "shop.tab.active" : "shop.tab")}
                  fit="fill"
                  x={0}
                  y={0}
                  width={(width - 2 * subTabs.length - 6) / subTabs.length}
                  height={active ? 32 : 24}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                />
              </Canvas>
              <Text
                className={`font-Pixels text-xl text-center w-full absolute ${
                  active ? "text-[#fff7ff]" : "text-[#717171]"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1,height: 522, marginTop: 2 }} onLayout={handleListLayout}>
        <FlatList
          data={storeData}
          className="flex-1 relative py-[10px]"
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderStoreItem}
          ItemSeparatorComponent={Separator}
          ListFooterComponent={ListFooter}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={15}
          removeClippedSubviews={false}
          getItemLayout={undefined}
          onScroll={handleScroll}
          scrollEventThrottle={32}
          onContentSizeChange={(_, h) => {
            if (listViewportHeight > 0) {
              setFadeIfChanged(
                h > listViewportHeight + SCROLL_BOTTOM_THRESHOLD,
              );
            }
          }}
        />
        <LinearGradient
          style={{ ...GradientBaseStyle, opacity: showBottomFade ? 1 : 0 }}
          colors={["transparent", "#000000c0", "#000000c0"]}
          locations={[0, 0.995, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
    </View>
  );
};

export default StorePage;
