import React from "react";
import { Modal, View, Text, Pressable } from "react-native";

interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  buttonLabel?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  onClose,
  buttonLabel = "Close",
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white px-6 py-4 rounded-2xl w-64 items-center">
        <Text className="text-lg font-bold text-black">{title}</Text>
        {message && (
          <Text className="text-center text-[#333] mt-2">{message}</Text>
        )}
        <Pressable
          onPress={onClose}
          className="mt-4 bg-red-500 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);
