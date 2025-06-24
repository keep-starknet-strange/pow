import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import coinImg from "../../../assets/images/bitcoin.png";
import { shortMoneyString } from "../../utils/helpers";

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
      className="mx-10 rounded-full items-center justify-around flex-row p-2
                 border-2 border-[#101119] shadow-lg shadow-[#101119] bg-[#10111908]"
      style={props.style}
    >
      <Image source={props.icon} className="w-[3rem] h-[3rem]" />
      <View className="flex flex-col items-start justify-center flex-1 pl-2">
        <Text className="text-xl font-bold text-[#101119]">
          Unlock {props.name}
        </Text>
        <Text className="text-sm text-center text-[#101119]">
          {props.description}
        </Text>
      </View>
      {props.owned ? (
        <View className="flex flex-row items-center justify-center pr-1">
          <Text className="text-lg font-bold pl-1 text-[#101119]">Owned</Text>
        </View>
      ) : (
        <View className="flex flex-row items-center justify-center pr-1">
          <Image source={coinImg} className="w-[2rem] h-[2rem]" />
          <Text className="text-lg font-bold pl-1 text-[#101119]">
            {shortMoneyString(props.cost)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
