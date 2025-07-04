import React from "react";
import { TouchableOpacity, Text } from "react-native";

type ToggleButtonProps = {
  label: string;
  isOn: boolean;
  onSymbol: string;
  offSymbol: string;
  onToggle: () => void;
  style?: object;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({
  style,
  label,
  isOn,
  onSymbol,
  offSymbol,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="rounded-full items-center justify-around flex-row p-2
                 border-4 border-[#101119] shadow-lg shadow-[#101119]"
      style={{
        ...style,
      }}
    >
      <Text className="text-[#101119] font-bold text-2xl font-Xerxes">
        {label}
      </Text>
      <Text className="font-bold text-4xl">{isOn ? onSymbol : offSymbol}</Text>
    </TouchableOpacity>
  );
};

export default ToggleButton;
