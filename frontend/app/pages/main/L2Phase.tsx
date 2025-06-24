import { View, Text, TouchableOpacity } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { useChains } from "../../context/Chains";
import { useImageProvider } from "../../context/ImageProvider";
import { WorkingBlockView } from "../../components/WorkingBlockView";
import { CompletedBlockView } from "../../components/CompletedBlockView";
import { EmptyBlockView } from "../../components/EmptyBlockView";
import { DaView } from "../../components/DaView";
import { ProverView } from "../../components/ProverView";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { DappsUnlock } from "../../components/store/DappsUnlock";
import { Canvas, Image, FilterMode, MipmapMode } from '@shopify/react-native-skia';

export interface L2PhaseProps {
  setCurrentView: (view: string) => void;
}

export const L2Phase: React.FC<L2PhaseProps> = ({ setCurrentView }) => {
  const { chains, getLatestBlock } = useChains();
  const { dappsUnlocked } = useTransactions();
  const { getImage } = useImageProvider();

  return (
    <View className="flex flex-col items-center h-full">
      <View className="w-full mt-[1rem] relative">
        {chains[1].blocks.length > 0 && (
          <View className="absolute top-[35px] left-[-334px]">
            <CompletedBlockView chainId={1} block={getLatestBlock(1)} />
          </View>
        )}
        <View className="absolute top-[35px] right-[-334px]">
          <EmptyBlockView />
        </View>
        <WorkingBlockView chainId={1} />
      </View>
      <View className="mt-[0.5rem] w-full">
        {!dappsUnlocked[1] && (
          <DappsUnlock chainId={1} />
        )}
        <View className="flex flex-row justify-between items-center px-4">
          <DaView />
          <ProverView />
        </View>
      </View>
      <View className="absolute bottom-[22px] left-0 right-0 h-[200px]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("nav.bg")}
            fit="fill"
            x={0}
            y={0}
            width={402}
            height={200}
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
          />
        </Canvas>
        <View className="absolute top-[4px] left-0 right-0">
          <TransactionButtonsView chainId={1} isDapps={dappsUnlocked[1]} />
        </View>
      </View>
    </View>
  );
}

export default L2Phase;
