import React from "react";
import { TouchableOpacity, Text } from "react-native";

type BasicButtonProps = {
  label: string;
  onPress?: () => void;
  style?: object;
  icon?: string;
  disabled?: boolean;
};

const BasicButton: React.FC<BasicButtonProps> = ({ label, onPress, style, icon, disabled }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        rounded-full items-center justify-around flex-row p-2
        border-2 border-[#ffff80] shadow-lg shadow-[#ffff80]
        ${disabled ? 'border-gray-400 shadow-gray-400' : 'border-[#ffff80] shadow-[#ffff80]'}
      `}
      style={{
        ...style,
      }}
    >
      <Text className={`
          font-bold text-4xl
          ${disabled ? 'text-gray-400' : 'text-[#ffff80]'}
        `}
      >
        {label}
      </Text>
      {icon && (
        <Text className={`
            font-bold text-4xl
            ${disabled ? 'text-gray-400' : 'text-[#ffff80]'}
          `}
        >
        {icon}
      </Text>
      )}
    </TouchableOpacity>
  );
};

export default BasicButton;
