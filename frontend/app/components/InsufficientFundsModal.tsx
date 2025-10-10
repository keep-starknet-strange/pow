import React, { memo } from "react";
import { View, Image, StyleSheet } from "react-native";
import { StatusModal } from "./StatusModal";
import {
  getNounsHead,
  getNounsAccessories,
  getNounsBody,
  getNounsGlasses,
} from "../configs/nouns";

type Props = {
  visible: boolean;
  onBack: () => void;
};

// Fixed noun composition:
// Head: Bank (heads.ts -> head-bank.webp is img007 => index 6 zero-based)
// Accessory: tie-red (accessories.ts -> accessory-tie-red.webp is img104 => index 103 zero-based)
// Body: grayscale-1 or grayscale-9 (bodies.ts -> body-grayscale-1 is img11 => index 10; body-grayscale-9 is img14 => index 13)
// Glasses: Square-black (glasses.ts -> glasses-square-black.webp is img04 => index 3 zero-based)

const BANK_HEAD_INDEX = 6;
const TIE_RED_INDEX = 103;
const BODY_GRAYSCALE_1_INDEX = 10;
const BODY_GRAYSCALE_9_INDEX = 13;
const GLASSES_SQUARE_BLACK_INDEX = 3;

const BankAvatar = memo(({ useAltBody = false }: { useAltBody?: boolean }) => {
  const bodyIdx = useAltBody ? BODY_GRAYSCALE_9_INDEX : BODY_GRAYSCALE_1_INDEX;
  return (
    <View style={styles.avatarWrap}>
      <Image
        source={getNounsBody(bodyIdx)}
        style={styles.avatarLayer}
        resizeMode="contain"
      />
      <Image
        source={getNounsHead(BANK_HEAD_INDEX)}
        style={styles.avatarLayer}
        resizeMode="contain"
      />
      <Image
        source={getNounsGlasses(GLASSES_SQUARE_BLACK_INDEX)}
        style={styles.avatarLayer}
        resizeMode="contain"
      />
      <Image
        source={getNounsAccessories(TIE_RED_INDEX)}
        style={styles.avatarLayer}
        resizeMode="contain"
      />
    </View>
  );
});

export const InsufficientFundsModal: React.FC<Props> = ({
  visible,
  onBack,
}) => {
  return (
    <StatusModal
      visible={visible}
      title="Capital Controls"
      message={
        "Capital controls in effect: the bank is out of funds for now—check back later to claim your rewards. Rewards will resume when the pool is replenished."
      }
      renderAvatar={<BankAvatar />}
      isLoading={false}
      primaryLabel="Back"
      closeButtonVisible={false}
      onPrimaryPress={onBack}
    />
  );
};

const styles = StyleSheet.create({
  avatarWrap: {
    width: 96,
    height: 96,
    position: "relative",
    marginBottom: 4,
  },
  avatarLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
});
