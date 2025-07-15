import React from "react";
import { Dimensions, View, TouchableOpacity, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTransactions } from "../../context/Transactions";
import { useImages } from "../../hooks/useImages";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { DaView } from "../../components/DaView";
import { ProverView } from "../../components/ProverView";
import { DappsUnlock } from "../../components/store/DappsUnlock";
import { PrestigeUnlock } from "../../components/store/PrestigeUnlock";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import BlockchainView from "@/app/components/BlockchainView";

export interface L2PhaseProps {
}

export const L2Phase: React.FC<L2PhaseProps> = () => {
  const { dappsUnlocked } = useTransactions();
  const { getImage } = useImages();
  const window = Dimensions.get("window");
  const txTabs = [
    "Transactions",
    "dApps",
  ];
  const [activeTab, setActiveTab] = React.useState(txTabs[dappsUnlocked[1] ? 1 : 0]);
  React.useEffect(() => {
    if (dappsUnlocked[1]) {
      setActiveTab("dApps");
    } else {
      setActiveTab("Transactions");
    }
  }, [dappsUnlocked]);

  return (
    <View
      style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}
    >
      <BlockchainView chainId={1} style={{ flex: 1 }} />
      <DappsUnlock chainId={1} />
      <PrestigeUnlock />
      <Animated.View
        style={{
          width: "100%",
          height: 260,
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
            y={100 + (dappsUnlocked[1] ? 0 : 20)}
            width={window.width}
            height={160}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <Canvas
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            image={getImage("tx.bg.l2")}
            fit="fill"
            x={0}
            y={dappsUnlocked[1] ? 0 : 20}
            width={window.width}
            height={102}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
        <View
          className="absolute px-[4px] py-[3px] w-full h-[100px] flex flex-row items-center justify-between"
          style={{
            marginTop: dappsUnlocked[1] ? 0 : 20,
          }}
        >
          <ProverView />
          <DaView />
        </View>
        <Canvas
          style={{ position: "absolute", width: "100%", height: "100%" }}
        >
          <Image
            image={getImage("tx.border")}
            fit="fill"
            x={3}
            y={130}
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
            top: 142,
            left: 9,
          }}
        >
          <TransactionButtonsView chainId={1} isDapps={ activeTab === "dApps"} />
        </View>
        {dappsUnlocked[1] && (
          <View
            className="absolute top-[104px] left-0 px-[4px] h-[28px] flex flex-row items-end justify-between gap-[4px]"
          >
            {txTabs.map((tab) => (
              <TouchableOpacity
                style={{
                  width: window.width / 2 - 6,
                  height: tab === activeTab ? 28 : 24,
                }}
                key={tab}
                onPress={() => setActiveTab(tab)}
              >
                <Canvas
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image
                    image={getImage(tab === activeTab ? "tx.tab.active" : "tx.tab.inactive")}
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
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default L2Phase;
