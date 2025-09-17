import React from "react";
import { Modal, View, Text, ActivityIndicator, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  text?: string | null;
};

export const LoadingModal: React.FC<Props> = ({ visible, text }) => {
  if (!visible) return null;
  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{text || "Loading…"}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "#101119",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    maxWidth: 280,
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Xerxes",
  },
});
