import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

interface AmountFieldProps {
  amount: string;
}

const AmountFieldComponent: React.FC<AmountFieldProps> = ({ amount }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.field, styles.amount]} numberOfLines={1} adjustsFontSizeToFit>
        {amount}
      </Text>
      <Text style={styles.field} numberOfLines={1} adjustsFontSizeToFit>
        BTC
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    columnGap: 8, // space-x-2
  },
  field: {
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#717171",
    fontFamily: "Pixels",
    fontSize: 20, // text-xl
    color: "#fff7ff",
  },
  amount: {
    flex: 1,
    textAlign: "right",
  },
});

export const AmountField = memo(AmountFieldComponent);
