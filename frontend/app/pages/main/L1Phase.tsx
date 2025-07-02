import React from "react";
import { View, Dimensions } from "react-native";
import { useChains } from "../../context/Chains";
import { useTransactions } from "../../context/Transactions";
import { useGame } from "../../context/Game";
import { useImageProvider } from "../../context/ImageProvider";
import { CompletedBlockView } from "../../components/CompletedBlockView";
import { EmptyBlockView } from "../../components/EmptyBlockView";
import { WorkingBlockView } from "../../components/WorkingBlockView";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { DappsUnlock } from "../../components/store/DappsUnlock";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

export interface L1PhaseProps {
  setCurrentView: (view: string) => void;
}

export const L1Phase: React.FC<L1PhaseProps> = ({ setCurrentView }) => {
  const { chains, getLatestBlock } = useChains();
  const { dappsUnlocked } = useTransactions();
  const { getImage } = useImageProvider();
  const window = Dimensions.get("window");

  return (
    <View className="flex flex-col items-center h-full">
      <View className="w-full mt-[4rem] relative">
        {chains[0].blocks.length > 0 && (
          <View className="absolute top-[35px] left-[-334px]">
            <CompletedBlockView chainId={0} block={getLatestBlock(0)} />
          </View>
        )}
        <View className="absolute top-[35px] right-[-334px]">
          <EmptyBlockView />
        </View>
        <WorkingBlockView chainId={0} />
      </View>
      <View className="mt-[0.5rem] w-full">
        {!dappsUnlocked[0] && <DappsUnlock chainId={0} />}
      </View>
      <View className="absolute bottom-[22px] left-0 right-0 h-[200px]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
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
        <View className="absolute top-[4px] left-0 right-0">
          <TransactionButtonsView chainId={0} isDapps={dappsUnlocked[0]} />
        </View>
      </View>
    </View>
  );
};

export default L1Phase;
