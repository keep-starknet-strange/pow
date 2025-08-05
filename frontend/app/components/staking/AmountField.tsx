import React from "react";
import { View, Text } from "react-native";

interface AmountFieldProps {
  amount: string;
}

export const AmountField: React.FC<AmountFieldProps> = React.memo(
  ({ amount }) => {
    return (
      <View className="flex-row flex-1 space-x-2">
        <Text
          className="flex-1 px-3 py-2 rounded border font-Pixels text-xl text-right"
          style={{ borderColor: "#717171", color: "#fff7ff" }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {amount}
        </Text>
        <Text
          className="px-3 py-2 rounded border font-Pixels text-xl"
          style={{ borderColor: "#717171", color: "#fff7ff" }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          BTC
        </Text>
      </View>
    );
  },
);
