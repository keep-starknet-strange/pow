import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AmountFieldProps {
  amount: string;
  unit?: string;
}

export const AmountField: React.FC<AmountFieldProps> = React.memo(
  ({ amount, unit = "STRK" }) => {
    return (
      <View style={styles.row}>
        <Text style={[styles.box, styles.value]} numberOfLines={1} adjustsFontSizeToFit>
          {amount}
        </Text>
        <Text style={[styles.box, styles.unit]} numberOfLines={1} adjustsFontSizeToFit>
          {unit}
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flex: 1,
    columnGap: 8,
  },
  box: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#717171",
    fontFamily: "Pixels",
    fontSize: 18,
    color: "#fff7ff",
  },
  value: {
    flex: 1,
    textAlign: "right",
  },
  unit: {},
});


