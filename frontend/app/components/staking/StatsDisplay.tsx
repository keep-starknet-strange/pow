import React from "react";
import { View, Text } from "react-native";

interface StatsDisplayProps {
  label: string;
  value: string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = React.memo(
  ({ label, value }) => {
    return (
      <View className="flex-1">
        <Text
          className="font-Pixels px-2 py-6 text-3xl text-center text-[#fff7ff] rounded border"
          style={{ borderColor: "#717171" }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label} {value}
        </Text>
      </View>
    );
  },
);
