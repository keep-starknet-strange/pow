import React, { memo } from "react";
import { View, Text, Dimensions } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "@/app/hooks/useImages";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { shortMoneyString } from "../../utils/helpers";

// TODO: Reduce to chainId, txId, isDapp
export interface TxButtonPlaqueProps {
  feeLevel: number;
  feeCost: number;
  fee: number;
  chainId: number;
  txId: number;
  isDapp?: boolean;
}

export const TxButtonPlaque = memo((props: TxButtonPlaqueProps) => {
  const { width } = Dimensions.get("window");
  const { feeLevel, feeCost, fee } = props;
  const { getImage } = useImages();
  const { canUnlockTx } = useTransactionsStore();

  return (
    <View className="relative">
      <View
        className="h-[20px]"
        style={{
          width: width * 0.18,
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage(
              feeLevel === -1 ? "tx.plaque.minus" : "tx.plaque.plus",
            )}
            fit="fill"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={0}
            width={width * 0.18}
            height={20}
          />
        </Canvas>
      </View>
      {canUnlockTx(props.chainId, props.txId, props.isDapp) && (
        <View className="absolute bottom-[0px] left-0 w-full h-[20px] justify-end flex flex-row">
          <Text className="text-[14px] text-[#fff8ff] font-Pixels text-right mt-[1px]">
            {shortMoneyString(feeLevel === -1 ? feeCost : fee)}
          </Text>
          <Canvas style={{ width: 16, height: 16 }} className="mr-1">
            <Image
              image={getImage("shop.btc")}
              fit="contain"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              x={0}
              y={1}
              width={13}
              height={13}
            />
          </Canvas>
        </View>
      )}
    </View>
  );
});
