import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { useGame } from "../../context/Game";
import { UnlockView } from "./UnlockView";
import l2Icon from "../../../assets/images/transaction/l2Batch.png";
import { shortMoneyString } from "../../utils/helpers";

export type L2UnlockProps = {
  alwaysShow?: boolean;
  miniView?: boolean;
};

export const L2Unlock: React.FC<L2UnlockProps> = ({ alwaysShow, miniView }) => {
  const { transactionFees, dappFees } = useTransactions();
  const { l2, getL2Cost, initL2 } = useGame();
  const [showUnlock, setShowUnlock] = useState(false);
  useEffect(() => {
    if (l2) {
      setShowUnlock(false);
      return;
    }
    // Ensure all L1 transactions unlocked
    const txLevels = transactionFees[0];
    if (!txLevels) {
      setShowUnlock(false);
      return;
    }
    for (const level of Object.values(txLevels)) {
      if (level === -1) {
        setShowUnlock(false);
        return;
      }
    }

    // Ensure all L1 dapps unlocked
    const dappLevels = dappFees[0];
    if (!dappLevels) {
      setShowUnlock(false);
      return;
    }
    for (const level of Object.values(dappLevels)) {
      if (level === -1) {
        setShowUnlock(false);
        return;
      }
    }
    setShowUnlock(true);
  }, [l2, transactionFees, dappFees]);

  return (
    <View>
      {(alwaysShow || showUnlock) && (
        miniView ? (
          <View
            className="flex flex-col items-center justify-center w-full
                       transform translate-y-[-2rem]"
          >
            <TouchableOpacity
              className="flex flex-col items-center justify-center bg-[#60606080] rounded-lg px-8 pb-2
                         border-2 border-[#f7f760c0] border-t-2 border-l-2"
              onPress={() => {
                initL2();
              }}
            >
              <Text className="text-sm text-[#f7f760c0] text-center font-bold">
                Scale with L2
              </Text>
              <Text className="text-sm text-[#f7f760c0] text-center">
                {shortMoneyString(getL2Cost())}
              </Text>
              <View className="w-3 h-3 ml-1 rotate-45 border-[#f7f760c0] border-r-2 border-b-2" />
            </TouchableOpacity>
          </View>
        ) : (
          <UnlockView
            icon={l2Icon}
            name="L2"
            description="Scale your chain with Layer 2"
            cost={getL2Cost()}
            onPress={() => {
              initL2();
            }}
          />
        )
      )}
    </View>
  );
}

