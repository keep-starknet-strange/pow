import React, { useEffect } from "react";
import { Dimensions, View, Pressable, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { useImages } from "../../hooks/useImages";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { DappsUnlock } from "../../components/store/DappsUnlock";
import { L2Unlock } from "../../components/store/L2Unlock";
import {
  Canvas,
  FilterMode,
  Image,
  MipmapMode,
} from "@shopify/react-native-skia";
import BlockchainView from "@/app/components/BlockchainView";

export const L1Phase: React.FC = () => {
  const { dappsUnlocked } = useTransactionsStore();
  const { getImage } = useImages();
  const window = Dimensions.get("window");
  const txTabs = ["Transactions", "dApps"];
  const [activeTab, setActiveTab] = React.useState<string>(
    txTabs[dappsUnlocked[0] ? 1 : 0],
  );
  /*
  useEffect(() => {
    setActiveTab(dappsUnlocked[0] ? "dApps" : "Transactions");
  }, [dappsUnlocked]);
  */

  return (
    <View
      style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}
    >
      <BlockchainView chainId={0} style={{ flex: 1 }} />
      <DappsUnlock chainId={0} />
      <L2Unlock />
      <Animated.View
        style={{
          width: "100%",
          height: 160,
          zIndex: 20,
        }}
        entering={FadeInDown}
      >
        <Canvas
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            image={getImage("tx.bg")}
            fit="fill"
            x={0}
            y={dappsUnlocked[0] ? 0 : 20}
            width={window.width}
            height={160}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <Canvas style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Image
            image={getImage("tx.border")}
            fit="fill"
            x={3}
            y={30}
            width={window.width - 6}
            height={126}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <View
          style={{
            width: window.width - 18,
            height: 108,
            position: "absolute",
            top: 42,
            left: 9,
          }}
        >
          <TransactionButtonsView chainId={0} isDapps={activeTab === "dApps"} />
        </View>
        {dappsUnlocked[0] && (
          <View className="absolute top-[4px] left-0 px-[4px] h-[28px] flex flex-row items-end justify-between gap-[4px]">
            {txTabs.map((tab) => (
              <Pressable
                style={{
                  width: window.width / 2 - 6,
                  height: tab === activeTab ? 28 : 24,
                }}
                key={tab}
                onPress={() => setActiveTab(tab)}
              >
                <Canvas style={{ width: "100%", height: "100%" }}>
                  <Image
                    image={getImage(
                      tab === activeTab ? "tx.tab.active" : "tx.tab.inactive",
                    )}
                    fit="fill"
                    x={0}
                    y={0}
                    width={window.width / 2 - 6}
                    height={tab === activeTab ? 28 : 24}
                    sampling={{
                      filter: FilterMode.Nearest,
                      mipmap: MipmapMode.Nearest,
                    }}
                  />
                </Canvas>
                <Text
                  className="absolute top-[6px] left-0 right-0 text-[16px] font-Pixels text-center w-full"
                  style={{
                    color: tab === activeTab ? "#FFF7FF" : "#a9a9a9",
                  }}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default L1Phase;
