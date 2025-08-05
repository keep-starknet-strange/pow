import React from "react";
import { View, ViewStyle } from "react-native";

interface WindowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Window: React.FC<WindowProps> = ({ children, style }) => {
  return (
    <View
      style={style}
      className="relative bg-[#101119] border-2 border-[#fff7ff] rounded-lg"
    >
      <View className="p-6 z-10">{children}</View>
    </View>
  );
};
