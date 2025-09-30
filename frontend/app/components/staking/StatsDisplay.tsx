import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatsDisplayProps {
  label: string;
  value: string;
}

const StatsDisplayComponent: React.FC<StatsDisplayProps> = ({ label, value }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
        {label} {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontFamily: "Pixels",
    paddingHorizontal: 8, // px-2
    paddingVertical: 24, // py-6
    fontSize: 30, // text-3xl
    textAlign: "center",
    color: "#fff7ff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#717171",
  },
});

export const StatsDisplay = memo(StatsDisplayComponent);
