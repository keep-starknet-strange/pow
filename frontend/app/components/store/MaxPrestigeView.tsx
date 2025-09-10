import React from "react";
import { View, Text, StyleSheet } from "react-native";
import prestigeConfig from "../../configs/prestige.json";

export type MaxPrestigeViewProps = {
  prestigeLevel: number;
  marginHorizontal?: number;
};

export const MaxPrestigeView: React.FC<MaxPrestigeViewProps> = (props) => {
  const maxPrestige = prestigeConfig.length - 1;
  const currentPrestigeConfig = prestigeConfig.find(
    (p) => p.id === props.prestigeLevel,
  );
  const prestigeColor = currentPrestigeConfig?.color || "#FF0000";

  return (
    <View
      style={[
        styles.container,
        { marginHorizontal: props.marginHorizontal || 0 },
      ]}
    >
      <View style={[styles.badge, { borderColor: prestigeColor }]}>
        <Text style={[styles.title, { color: prestigeColor }]}>
          MAX PRESTIGE ACHIEVED!
        </Text>
        <Text style={styles.level}>
          Level {props.prestigeLevel}/{maxPrestige}
        </Text>
        <Text style={styles.description}>
          You've reached the pinnacle of power!
        </Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            Current Multiplier: {currentPrestigeConfig?.scaler}x
          </Text>
          <Text style={styles.statText}>All fees permanently boosted!</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  badge: {
    backgroundColor: "#101119",
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Xerxes",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 1,
  },
  level: {
    fontSize: 16,
    fontFamily: "Pixels",
    color: "#FF0000",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: "Pixels",
    color: "#fff7ff",
    textAlign: "center",
    marginBottom: 16,
  },
  statsContainer: {
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontFamily: "Pixels",
    color: "#fff7ff",
  },
});
