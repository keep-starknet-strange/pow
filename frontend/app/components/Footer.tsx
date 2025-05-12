import { Text, View, TouchableOpacity } from 'react-native';
import { useSound } from "../context/Sound";

export type FooterProps = {
  tabs: {name: string, icon: string}[];
  switchPage: (page: string) => void;
};

export const Footer: React.FC<FooterProps> = (props) => {
  const { playSoundEffect } = useSound();
  const switchPage = (page: string) => {
    playSoundEffect("BasicClick");
    props.switchPage(page);
  }

  // TODO: Add small lines between the icons
  return (
    <View className="absolute bottom-0 left-0 bg-[#010108ff] z-[100] flex flex-row justify-around w-full pb-[1.5rem] rounded-2xl pt-[1rem] px-[0.5rem]
      border-2 border-[#2020600f0] border-b-0 shadow-2 shadow-[#000000]">
      {props.tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          className="flex flex-row"
          onPress={() => switchPage(tab.name)}
        >
          <Text className="text-[#f7f7f7] text-[2.8rem]">{tab.icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Footer;
