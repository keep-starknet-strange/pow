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
import { useTutorialLayout } from "@/app/hooks/useTutorialLayout";
import { TargetId } from "@/app/stores/useTutorialStore";
import TransactionTabs from "./TransactionTabs";

export const L1Phase: React.FC = () => {
  const { dappsUnlocked } = useTransactionsStore();
  const { ref, onLayout } = useTutorialLayout(
    "dappsTab" as TargetId,
    dappsUnlocked[0] || false,
  );
  const { getImage } = useImages();
  const window = Dimensions.get("window");
  const txTabs = ["Transactions", "dApps"];
  const [activeTab, setActiveTab] = React.useState<string>(
    txTabs[dappsUnlocked[0] ? 1 : 0],
  );
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
        <TransactionTabs
          tabs={txTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          show={!!dappsUnlocked[0]}
          topPosition={4}
          dappsRef={ref}
          dappsOnLayout={onLayout}
        />
      </Animated.View>
    </View>
  );
};

export default L1Phase;
