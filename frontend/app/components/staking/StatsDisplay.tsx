import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Window } from "../tutorial/Window";

interface StatsDisplayProps {
  label: string;
  value: string;
}

const StatsDisplayComponent: React.FC<StatsDisplayProps> = ({ label, value }) => {
  return (
    <View style={styles.container}>
      <Window style={styles.window}>
        <Text style={styles.text} numberOfLines={1}>
          {label} {value}
        </Text>
      </Window>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  window: {
    width: "100%",
  },
  text: {
    fontFamily: "Pixels",
    fontSize: 20, // slightly smaller
    lineHeight: 46,
    textAlign: "center",
    color: "#fff7ff",
  },
});

export const StatsDisplay = memo(StatsDisplayComponent);
