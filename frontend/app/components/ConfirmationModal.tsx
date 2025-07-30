import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Window } from "./tutorial/Window";
import BasicButton from "./buttons/Basic";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  dangerous?: boolean; // For destructive actions like reset
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  dangerous = false,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        className="flex-1 justify-center items-center bg-black/70"
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <Pressable className="absolute inset-0" onPress={onCancel} />

        <Animated.View
          className="mx-8 max-w-sm"
          entering={FadeIn.delay(100).duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <Window
            style={{
              minWidth: 280,
              maxWidth: 320,
            }}
          >
            <View className="items-center">
              {/* Title */}
              <Text className="font-Pixels text-2xl text-[#fff7ff] text-center mb-3">
                {title}
              </Text>

              {/* Warning Icon for dangerous actions */}
              {dangerous && <Text className="text-4xl mb-2">⚠️</Text>}

              {/* Message */}
              <Text className="font-Pixels text-lg text-[#fff7ff] text-center mb-6 leading-6">
                {message}
              </Text>

              {/* Buttons */}
              <View className="flex-row gap-4">
                <BasicButton
                  label={cancelLabel}
                  onPress={onCancel}
                  style={{ width: 100 }}
                />
                <BasicButton
                  label={confirmLabel}
                  onPress={onConfirm}
                  style={{
                    width: 100,
                    ...(dangerous && { backgroundColor: "#dc2626" }),
                  }}
                  textStyle={dangerous ? { color: "#fff" } : undefined}
                />
              </View>
            </View>
          </Window>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
