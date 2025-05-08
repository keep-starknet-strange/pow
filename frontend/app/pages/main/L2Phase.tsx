import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { ChainView } from "../../components/ChainView";
import { WorkingBlockView } from "../../components/WorkingBlockView";
import { DaView } from "../../components/DaView";
import { ProverView } from "../../components/ProverView";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { DappsUnlock } from "../../components/store/DappsUnlock";

export interface L2PhaseProps {
  setCurrentView: (view: string) => void;
}

export const L2Phase: React.FC<L2PhaseProps> = ({ setCurrentView }) => {
  const { dappsUnlocked } = useTransactions();

  return (
    <View className="relative flex flex-col items-center pb-[20rem]">
      <View
        className="w-full pb-[1.2rem] rounded-t-lg"
        style={{
          marginTop: 16
        }}
      >
        <TouchableOpacity
          className="flex flex-col items-center justify-center"
          onPress={() => {
+           setCurrentView("L1");
          }}
        >
          <View className="w-3 h-3 ml-1 rotate-45 border-[#f7f760c0] border-l-2 border-t-2" />
          <Text className="text-xs text-[#f7f760c0] text-center font-bold">
            Manage L1
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex flex-row justify-center w-full gap-2">
        <DaView />
        <ProverView />
      </View>
      <View className="px-2 mt-[0.5rem] w-full">
        <ChainView chainId={1} />
      </View>
      <View className="px-2 mt-[0.5rem] w-full">
        <WorkingBlockView chainId={1} />
      </View>
      <View className="mt-[0.5rem] w-full">
        <TransactionButtonsView chainId={1} isDapps={false} />
      </View>
      <View className="mt-[1.2rem] w-full">
        {dappsUnlocked[1] ? (
          <TransactionButtonsView chainId={1} isDapps={true} />
        ) : (
          <DappsUnlock chainId={1} />
        )}
      </View>
    </View>
  );
}

export default L2Phase;
