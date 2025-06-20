import React from "react";
import { TouchableOpacity, Text } from "react-native";

type BasicButtonProps = {
  label: string;
  onPress?: () => void;
  style?: object;
  icon?: string;
  disabled?: boolean;
};

const BasicButton: React.FC<BasicButtonProps> = ({ label, onPress, style, icon, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        rounded-full items-center justify-around flex-row p-2
        border-4 border-[#101119] shadow-lg shadow-[#3093e1]
        ${disabled ? 'border-gray-400 shadow-gray-400' : 'border-[#101119] shadow-[#101119]'}
      `}
      style={{
        ...style,
      }}
    >
      <Text className={`
          font-Xerxes font-bold text-4xl
          ${disabled ? 'text-gray-400' : 'text-[#101119]'}
        `}
      >
        {label}
      </Text>
      {icon && (
        <Text className={`
            font-bold text-4xl
            ${disabled ? 'text-gray-400' : 'text-[#101119]'}
          `}
        >
        {icon}
      </Text>
      )}
    </TouchableOpacity>
  );
};

export default BasicButton;
