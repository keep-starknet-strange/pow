import React, { memo, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Window } from "./tutorial/Window";
import {
  getRandomNounsAttributes,
  getNounsBody,
  getNounsGlasses,
  getNounsHead,
  getNounsAccessories,
} from "../configs/nouns";
import { Ionicons } from "@expo/vector-icons";

type StatusModalProps = {
  visible: boolean;
  title: string;
  message: string;
  avatarSeed?: string;
  renderAvatar?: React.ReactNode;
  isLoading?: boolean;
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  closeButtonVisible: boolean;
  onRequestClose?: () => void;
};

const LoadingDots = memo(() => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  React.useEffect(() => {
    const animateDot = (sharedValue: any) => {
      sharedValue.value = withRepeat(
        withTiming(1, { duration: 600 }),
        -1,
        true,
      );
    };
    animateDot(dot1);
    setTimeout(() => animateDot(dot2), 200);
    setTimeout(() => animateDot(dot3), 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
  }));
  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
  }));
  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
  }));

  return (
    <View style={styles.loadingRow}>
      <Text style={styles.loadingText}>Loading</Text>
      <Animated.Text style={[styles.loadingText, dot1Style]}>.</Animated.Text>
      <Animated.Text style={[styles.loadingText, dot2Style]}>.</Animated.Text>
      <Animated.Text style={[styles.loadingText, dot3Style]}>.</Animated.Text>
    </View>
  );
});

const NounAvatar = memo(({ seed }: { seed?: string }) => {
  const [attrs] = useState(() => getRandomNounsAttributes(seed));
  return (
    <View style={styles.avatarWrap}>
      <Image
        source={getNounsBody(attrs.body)}
        style={styles.avatarLayer}
        resizeMode="contain"
      />
      <Image
        source={getNounsHead(attrs.head)}
        style={styles.avatarLayer}
        resizeMode="contain"
      />
      <Image
        source={getNounsGlasses(attrs.glasses)}
        style={styles.avatarLayer}
        resizeMode="contain"
      />
      <Image
        source={getNounsAccessories(attrs.accessories)}
        style={styles.avatarLayer}
        resizeMode="contain"
      />
    </View>
  );
});

export const StatusModal: React.FC<StatusModalProps> = memo(
  ({
    visible,
    title,
    message,
    avatarSeed,
    renderAvatar,
    isLoading,
    primaryLabel,
    onPrimaryPress,
    secondaryLabel,
    onSecondaryPress,
    closeButtonVisible,
    onRequestClose,
  }) => {
    if (!visible) return null;

    const showPrimary = Boolean(primaryLabel && onPrimaryPress);
    const showSecondary = Boolean(secondaryLabel && onSecondaryPress);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onRequestClose}
      >
        <Animated.View style={styles.overlay}>
          <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOutDown.duration(300)}
          >
            <Window style={styles.windowSize}>
              {closeButtonVisible && (
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={onRequestClose}
                >
                  <Ionicons name="close-sharp" size={20} color="white" />
                </TouchableOpacity>
              )}

              <View style={styles.contentCenter}>
                <Text style={styles.titleText}>{title}</Text>

                {renderAvatar !== undefined ? (
                  renderAvatar
                ) : avatarSeed !== undefined ? (
                  <NounAvatar seed={avatarSeed} />
                ) : null}

                <Text style={styles.messageText}>{message}</Text>

                {isLoading ? (
                  <LoadingDots />
                ) : (
                  <View style={styles.buttonRow}>
                    {showSecondary && (
                      <Pressable
                        onPress={onSecondaryPress}
                        style={styles.secondaryBtn}
                      >
                        <Text style={styles.btnText}>{secondaryLabel}</Text>
                      </Pressable>
                    )}
                    {showPrimary && (
                      <Pressable
                        onPress={onPrimaryPress}
                        style={styles.primaryBtn}
                      >
                        <Text style={styles.btnText}>{primaryLabel}</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            </Window>
          </Animated.View>
        </Animated.View>
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
    minWidth: 280,
    maxWidth: 320,
  },
  contentCenter: {
    alignItems: "center",
  },
  closeIcon: {
    position: "absolute",
    left: 0,
    top: 0,
    marginTop: 18,
    marginLeft: 16,
  },
  titleText: {
    fontFamily: "Teatime",
    fontSize: 28,
    color: "#f87171",
    marginVertical: 4,
    textAlign: "center",
  },
  messageText: {
    fontFamily: "Pixels",
    fontSize: 14,
    color: "#e7e7e7",
    textAlign: "center",
    marginVertical: 4,
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryBtn: {
    backgroundColor: "#52525b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  btnText: {
    color: "#ffffff",
    fontFamily: "Pixels",
    fontSize: 14,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    position: "relative",
    marginBottom: 4,
  },
  avatarLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: "Pixels",
    color: "#e7e7e7",
    marginRight: 4,
  },
});
