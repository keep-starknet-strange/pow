import React from "react";
import { TouchableOpacity, Text } from "react-native";

type BasicButtonProps = {
  label: string;
  onPress?: () => void;
  style?: object;
  icon?: string;
};

const BasicButton: React.FC<BasicButtonProps> = ({ label, onPress, style, icon }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-full items-center justify-around flex-row p-2
                 border-2 border-[#ffff80] shadow-lg shadow-[#ffff80]"
      style={{
        ...style,
      }}
    >
      <Text className="text-[#ffff80] font-bold text-2xl">{label}</Text>
      {icon && (
        <Text className="text-[#ffff80] font-bold text-4xl">{icon}</Text>
      )}
    </TouchableOpacity>
  );
};

export default BasicButton;
