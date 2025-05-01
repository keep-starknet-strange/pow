import React from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";
import coinImg from "../../../assets/images/bitcoin.png";

export type UnlockViewProps = {
  icon: ImageSourcePropType;
  name: string;
  description: string;
  cost: number;
  onPress: () => void;
  style?: object;
  owned?: boolean;
};

export const UnlockView: React.FC<UnlockViewProps> = (props) => {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      className="bg-[#606060d0] rounded-xl border-2 border-[#272727a0]
                 flex flex-row items-center justify-between p-1 mx-10"
      style={props.style}
    >
      <Image source={props.icon} className="w-[3rem] h-[3rem]" />
      <View className="flex flex-col items-start justify-center flex-1 pl-2">
        <Text className="text-xl font-bold text-[#f7f7f7a0]">
          Unlock {props.name}
        </Text>
        <Text className="text-sm text-center text-[#f7f7f7a0]">
          {props.description}
        </Text>
      </View>
      {props.owned ? (
        <View className="flex flex-row items-center justify-center pr-1">
          <Text className="text-lg font-bold pl-1 text-[#60f770c0]">
            Owned
          </Text>
        </View>
      ) : (
        <View className="flex flex-row items-center justify-center pr-1">
          <Image source={coinImg} className="w-[2rem] h-[2rem]" />
          <Text className="text-lg font-bold pl-1">
            ₿{props.cost}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
