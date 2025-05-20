import { Text, View, TouchableOpacity } from 'react-native';
import { TargetId } from '../context/Tutorial';
import { useTutorialLayout } from '../hooks/useTutorialLayout';
export type FooterProps = {
  tabs: {name: string, icon: string}[];
  switchPage: (page: string) => void;
};

export const Footer: React.FC<FooterProps> = (props) => {
  const {ref, onLayout} = useTutorialLayout("storeTab" as TargetId)

  // TODO: Add small lines between the icons
  return (
    <View className="absolute bottom-0 left-0 bg-[#010108ff] z-[5] flex flex-row justify-around w-full pb-[1.5rem] rounded-2xl pt-[1rem] px-[0.5rem]
      border-2 border-[#2020600f0] border-b-0 shadow-2 shadow-[#000000]">
      {props.tabs.map((tab, index) => {
        const tutorialProps =
          tab.name === "Store"
            ? { ref, onLayout }
            : {};
        return (
          <TouchableOpacity
            key={index}
            className="flex flex-row"
            onPress={() => props.switchPage(tab.name)}
            {...tutorialProps}
          >
              <Text className="text-[#f7f7f7] text-[2.8rem]">{tab.icon}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Footer;
