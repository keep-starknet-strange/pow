import React from "react";
import { Dimensions, View } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { useImageProvider } from "../../context/ImageProvider";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { Canvas, FilterMode, Image, MipmapMode } from "@shopify/react-native-skia";
import BlockchainView from "@/app/components/BlockchainView";

export interface L1PhaseProps {
  setCurrentView: (view: string) => void;
}

export const L1Phase: React.FC<L1PhaseProps> = ({ setCurrentView }) => {
  const { dappsUnlocked } = useTransactions();
  const { getImage } = useImageProvider();
  const window = Dimensions.get("window");

  return (
    <View
      style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}
    >
      <BlockchainView chainId={0} style={{ flex: 1 }} />
      {/* TODO dapps unlocked*/}
      {/*<View className="mt-[0.5rem] w-full">*/}
      {/*  {!dappsUnlocked[0] && <DappsUnlock chainId={0} />}*/}
      {/*</View>*/}
      <View
        style={{
          width: "100%",
          height: 120,
          zIndex: 20,
        }}
      >
        <Canvas
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            image={getImage("nav.bg")}
            fit="fill"
            x={0}
            y={0}
            width={window.width}
            height={200}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>

        <TransactionButtonsView chainId={0} isDapps={dappsUnlocked[0]} />
      </View>
    </View>
  );
};

export default L1Phase;
