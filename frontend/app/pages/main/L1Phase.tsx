import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { useGame } from "../../context/Game";
import { ChainView } from "../../components/ChainView";
import { WorkingBlockView } from "../../components/WorkingBlockView";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { DappsUnlock } from "../../components/store/DappsUnlock";
import { L2Unlock } from "../../components/store/L2Unlock";
import { useTutorialLayout } from "../../hooks/useTutorialLayout";
import { TargetId } from "../../context/Tutorial";
import { Canvas, Image, useImage, FilterMode, MipmapMode } from '@shopify/react-native-skia';

export interface L1PhaseProps {
  setCurrentView: (view: string) => void;
}

export const L1Phase: React.FC<L1PhaseProps> = ({ setCurrentView }) => {
  const { dappsUnlocked } = useTransactions();
  const {ref, onLayout } = useTutorialLayout("manageL2" as TargetId, true);
  const { l2 } = useGame();

  const txButtonsBackground = useImage(require("../../../assets/navigation/background.png"));

  return (
    <View className="flex flex-col items-center h-full">
      <View className="w-full mt-[5rem]">
        <WorkingBlockView chainId={0} />
      </View>
      <View className="mt-[1.2rem] w-full">
        {dappsUnlocked[0] ? (
          <TransactionButtonsView chainId={0} isDapps={true} />
        ) : (
          <DappsUnlock chainId={0} />
        )}
      </View>
      <View className="absolute bottom-[22px] left-0 right-0 h-[200px]">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={txButtonsBackground}
            fit="fill"
            x={0}
            y={0}
            width={402}
            height={200}
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
          />
        </Canvas>
        <View className="absolute top-[4px] left-0 right-0">
          <TransactionButtonsView chainId={0} isDapps={false} />
        </View>
      </View>
    </View>
  );
}

export default L1Phase;
