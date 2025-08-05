import React from "react";
import { Modal, View, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { Window } from "./Window";
import { ConfirmationButton } from "./buttons/ConfirmationButton";

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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          className="mx-8 max-w-sm"
          entering={FadeInDown.duration(300)}
          exiting={FadeOutDown.duration(300)}
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
              <View className="flex-row gap-4 mb-2">
                <ConfirmationButton
                  label={cancelLabel}
                  onPress={onCancel}
                  variant="cancel"
                  style={{ width: 100 }}
                />
                <ConfirmationButton
                  label={confirmLabel}
                  onPress={onConfirm}
                  variant={dangerous ? "danger" : "confirm"}
                  style={{ width: 100 }}
                />
              </View>
            </View>
          </Window>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
