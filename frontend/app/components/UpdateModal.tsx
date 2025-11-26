import React, { memo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
  ScrollView,
  LayoutChangeEvent,
  TouchableOpacity,
} from "react-native";

type UpdateModalMode = "force-update" | "news";

interface UpdateModalProps {
  visible: boolean;
  mode: UpdateModalMode;
  title: string;
  message: string;
  optionalLink?: string;
  onDismiss?: () => void;
}

const APP_STORE_URL = Platform.select({
  ios: "https://apps.apple.com/app/id6749684084",
  android: "https://play.google.com/store/apps/details?id=com.starknet.pow",
  default: "https://pow-game.com",
});

export const UpdateModal: React.FC<UpdateModalProps> = memo(
  ({ visible, mode, title, message, optionalLink, onDismiss }) => {
    const [textHeight, setTextHeight] = useState(0);

    if (!visible) return null;

    const handlePrimaryAction = () => {
      if (mode === "force-update") {
        // Open app store
        Linking.openURL(APP_STORE_URL);
      } else {
        // Dismiss news
        onDismiss?.();
      }
    };

    const handleTextLayout = (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setTextHeight(height);
    };

    const primaryLabel = mode === "force-update" ? "Update Now" : "Got it";
    const canDismiss = mode === "news";

    // Determine if we need scrolling based on text height
    const needsScroll = textHeight > 250;
    const scrollHeight = Math.min(textHeight, 350);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={canDismiss ? onDismiss : undefined}
      >
        <View style={styles.overlay} collapsable={false}>
          <View style={styles.windowSize} collapsable={false}>
            <View style={styles.contentCenter}>
              <Text style={styles.titleText}>{title}</Text>

              {needsScroll ? (
                <ScrollView
                  style={[styles.scrollView, { height: scrollHeight }]}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={styles.messageText}>{message}</Text>
                  {optionalLink && mode === "news" && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(optionalLink)}
                      style={styles.linkContainer}
                    >
                      <Text style={styles.linkText}>Learn more</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              ) : (
                <>
                  <Text style={styles.messageText} onLayout={handleTextLayout}>
                    {message}
                  </Text>
                  {optionalLink && mode === "news" && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(optionalLink)}
                      style={styles.linkContainer}
                    >
                      <Text style={styles.linkText}>Learn more</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={styles.buttonRow}>
                <Pressable
                  onPress={handlePrimaryAction}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.btnText}>{primaryLabel}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  windowSize: {
    width: 300,
    backgroundColor: "#2a2a3e",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#4a4a6e",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contentCenter: {
    alignItems: "center",
  },
  scrollView: {
    width: "100%",
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  titleText: {
    fontFamily: "Teatime",
    fontSize: 28,
    color: "#f87171",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  messageText: {
    fontFamily: "Pixels",
    fontSize: 14,
    color: "#e7e7e7",
    textAlign: "center",
    marginVertical: 8,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: "#ffffff",
    fontFamily: "Pixels",
    fontSize: 14,
  },
  linkContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  linkText: {
    fontFamily: "Pixels",
    fontSize: 14,
    color: "#e7e7e7",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
