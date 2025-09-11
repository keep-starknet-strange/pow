import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatsDisplayProps {
  label: string;
  value: string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = React.memo(
  ({ label, value }) => {
    return (
      <View style={styles.container}>
        <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
          {label} {value}
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontFamily: "Pixels",
    paddingHorizontal: 8,
    paddingVertical: 24,
    fontSize: 24,
    textAlign: "center",
    color: "#fff7ff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#717171",
  },
});


