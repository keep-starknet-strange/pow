import React from "react";
import { View } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { ChainView } from "../../components/ChainView";
import { WorkingBlockView } from "../../components/WorkingBlockView";
import { DaView } from "../../components/DaView";
import { ProverView } from "../../components/ProverView";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import { DappsUnlock } from "../../components/store/DappsUnlock";

export const L2Phase: React.FC = () => {
  const { dappsUnlocked } = useTransactions();

  return (
    <View className=" relative flex flex-col items-center bg-[#f7f7f710] pb-[4rem]">
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
