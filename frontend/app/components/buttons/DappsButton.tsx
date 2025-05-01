import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, Dimensions, Animated, useAnimatedValue } from "react-native";
import { useEventManager } from "../../context/EventManager";
import { useSound } from "../../context/Sound";
import { useUpgrades } from "../../context/Upgrades";
import { getTxIcon, getRandomInscriptionImage, getRandomNFTImage } from "../../utils/transactions";
import transactions from "../../configs/transactions.json";
import questionMarkIcon from "../../../assets/images/questionMark.png";

const window = Dimensions.get("window");

export type DappsButtonProps = {
  chain: string;
  txType: any; // TODO: Define a proper type for txType
  toggleOpen: () => void;
  isOpen: boolean;
};

export const DappsButton: React.FC<DappsButtonProps> = (props) => {
  const { notify } = useEventManager();
  const { gameState, updateBalance, unlockL2 } = useGameState();
  const { l1TransactionTypes, l2TransactionTypes, l1TxFeeUpgrade, l2TxFeeUpgrade } = useUpgrades();

  const [chainId, setChainId] = useState(0);
  const [txTypes, setTxTypes] = useState(l1TransactionTypes);
  useEffect(() => {
    if (props.chain === "L1") {
      setTxTypes(l1TransactionTypes);
    } else {
      setTxTypes(l2TransactionTypes);
    }
  }, [props.chain, l1TransactionTypes, l2TransactionTypes]);
  const [icon, setIcon] = useState<any>(questionMarkIcon);
  useEffect(() => {
    setChainId(props.chain === "L1" ? 0 : 1);
    if (props.chain === "L1") {
      setTxTypes(l1TransactionTypes);
    } else {
      setTxTypes(l2TransactionTypes);
    }
  }, [props.chain]);
  useEffect(() => {
    setIcon(getTxIcon(chainId + 1, props.txType.id));
  }, [props.txType, chainId]);

  const tryBuyTx = (txTypeId: number) => {
    if (txTypes[txTypeId].feeLevel !== 0) return;
    const txType = chainId === 0 ? transactions.L1[txTypeId] : transactions.L2[txTypeId];
    
    if (gameState.balance < txType.feeCosts[0]) return;
    if (chainId === 0) {
      l1TxFeeUpgrade(txTypeId);
    } else {
      l2TxFeeUpgrade(txTypeId);
    }

    const newBalance = gameState.balance - txType.feeCosts[0];
    notify("TxUpgradePurchased");
    updateBalance(newBalance);

    if (txType.name === "L2") {
      unlockL2();
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: props.txType.color,
        borderColor: props.txType.color,
        width: window.width * 0.16,
        height: window.width * 0.16,
      }}
      className="flex flex-col items-center justify-center rounded-lg border-2 overflow-hidden relative"
      onPress={() => {
        if (txTypes[props.txType.id].feeLevel === 0) tryBuyTx(props.txType.id);
        else props.toggleOpen();
      }}
    >
      <Image
        source={icon}
        className="w-full h-full object-contain"
      />
      {props.isOpen && (
        <Text
          className="text-white text-center text-[2rem] font-bold
            absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
            "
        >
          X
        </Text>
      )}
    </TouchableOpacity>
  );
}
