import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "@/app/hooks/useImages";
import { useCachedWindowDimensions } from "@/app/hooks/useCachedDimensions";
import { useTransactionsStore } from "@/app/stores/useTransactionsStore";
import { shortMoneyString, showThreeDigitsMax } from "../../utils/helpers";

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
  const { width } = useCachedWindowDimensions();
  const { feeLevel, feeCost, fee } = props;
  const txIsLocked = feeLevel === -1;
  const { getImage } = useImages();
  const { canUnlockTx } = useTransactionsStore();

  return (
    <View style={styles.container}>
      <View style={[styles.plaqueContainer, { width: width * 0.18 }]}>
        <Canvas style={styles.fillFlex}>
          <Image
            image={getImage("tx.plaque")}
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
        <View style={[styles.feeRowContainer, { width: width * 0.18 }]}>
          <Text style={styles.feeText}>
            {txIsLocked ? "-" : "+"}
            {shortMoneyString(
              txIsLocked ? feeCost : fee,
              false
            )}
          </Text>
          <Canvas style={styles.feeIconCanvas}>
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

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  plaqueContainer: {
    height: 20,
  },
  fillFlex: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  feeRowContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  feeText: {
    fontSize: 14,
    color: "#fff8ff",
    fontFamily: "Pixels",
    textAlign: "center",
  },
  feeIconCanvas: {
    width: 16,
    height: 16,
    marginRight: -2,
    marginBottom: 1,
  },
});
