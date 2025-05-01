import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { useGame } from "../../context/Game";
import { ChainView } from "../../components/ChainView";
import { WorkingBlockView } from "../../components/WorkingBlockView";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { DappsUnlock } from "../../components/store/DappsUnlock";
import { L2Unlock } from "../../components/store/L2Unlock";

export const L1Phase: React.FC = () => {
  const { dappsUnlocked } = useTransactions();
  const { l2 } = useGame();
  return (
    <View className="flex-1 relative flex flex-col items-center mt-10">
      <View className="px-2 mt-[1.5rem] w-full">
        <ChainView chainId={0} />
      </View>
      <View className="px-2 mt-[0.5rem] w-full">
        <WorkingBlockView chainId={0} />
      </View>
      <View className="mt-[0.5rem] w-full">
        <TransactionButtonsView chainId={0} isDapps={false} />
      </View>
      <View className="mt-[1.2rem] w-full">
        {dappsUnlocked[0] ? (
          <TransactionButtonsView chainId={0} isDapps={true} />
        ) : (
          <DappsUnlock chainId={0} />
        )}
      </View>
      <View
        className="w-full pb-[1.2rem] rounded-t-lg"
        style={{
          backgroundColor: l2 ? "#f7f7f710" : "transparent",
          marginTop: l2 ? 16 : 0,
        }}
      >
        {l2 ? (
          <TouchableOpacity
            className="flex flex-col items-center justify-center"
            onPress={() => {
            }}
          >
            <Text className="text-xs text-[#f7f760c0] text-center font-bold">
              Manage L2
            </Text>
            <View className="w-3 h-3 ml-1 rotate-45 border-[#f7f760c0] border-r-2 border-b-2" />
          </TouchableOpacity>
        ) : (
          <L2Unlock miniView={true} />
        )}
      </View>
    </View>
  );
}

export default L1Phase;
