import React from "react";
import { TouchableOpacity, Text } from "react-native";

type ToggleButtonProps = {
  label: string;
  isOn: boolean;
  onSymbol: string;
  offSymbol: string;
  onToggle: () => void;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({ label, isOn, onSymbol, offSymbol, onToggle }) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="bg-[#f0a030] p-4 rounded-xl border-2 border-[#ffffff80] flex flex-row justify-center items-center"
    >
      <Text className="text-4xl">{label} </Text>
      <Text className="text-2xl">{isOn ? onSymbol : offSymbol}</Text>
    </TouchableOpacity>
  );
};

export default ToggleButton;
