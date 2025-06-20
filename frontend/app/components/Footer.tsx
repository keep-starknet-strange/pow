import { Text, View, TouchableOpacity } from 'react-native';
import { TargetId } from '../context/Tutorial';
import { useTutorialLayout } from '../hooks/useTutorialLayout';
import { Canvas, Image, useImage, FilterMode, MipmapMode } from '@shopify/react-native-skia';

export type FooterProps = {
  tabs: {name: string, icon: string}[];
  selectedTab: string;
  switchPage: (page: string) => void;
};

export const Footer: React.FC<FooterProps> = (props) => {
  const {ref, onLayout} = useTutorialLayout("storeTab" as TargetId)
  const menuButtonImg = useImage(require('../../assets/navigation/menu_button_normal.png'));
  const menuButtonSelectedImg = useImage(require('../../assets/navigation/menu_button_selected.png'));

  const gameTabIcon = useImage(require('../../assets/navigation/icon_game.png'));
  const gameTabSelectedIcon = useImage(require('../../assets/navigation/icon_game_selected.png'));
  const storeTabIcon = useImage(require('../../assets/navigation/icon_shop.png'));
  const storeTabSelectedIcon = useImage(require('../../assets/navigation/icon_shop_selected.png'));
  const achievementsTabIcon = useImage(require('../../assets/navigation/icon_flag.png'));
  const achievementsTabSelectedIcon = useImage(require('../../assets/navigation/icon_flag_selected.png'));
  const leaderboardTabIcon = useImage(require('../../assets/navigation/icon_medal.png'));
  const leaderboardTabSelectedIcon = useImage(require('../../assets/navigation/icon_medal_selected.png'));
  const settingsTabIcon = useImage(require('../../assets/navigation/icon_settings.png'));
  const settingsTabSelectedIcon = useImage(require('../../assets/navigation/icon_settings_selected.png'));

  const getTabIcon = (tabName: string, selected: boolean) => {
    switch (tabName) {
      case 'Main':
        return selected ? gameTabSelectedIcon : gameTabIcon;
      case 'Store':
        return selected ? storeTabSelectedIcon : storeTabIcon;
      case 'Achievements':
        return selected ? achievementsTabSelectedIcon : achievementsTabIcon;
      case 'Leaderboard':
        return selected ? leaderboardTabSelectedIcon : leaderboardTabIcon;
      case 'Settings':
        return selected ? settingsTabSelectedIcon : settingsTabIcon;
      default:
        return null;
    }
  }

  // TODO: Add small lines between the icons
  return (
    <View className="bg-[#101119ff] flex flex-row justify-center w-full pb-[1.5rem] pt-[0.5rem]
                     absolute bottom-0 items-center z-[50] gap-2
    ">
      {props.tabs.map((tab, index) => {
        const tutorialProps =
          tab.name === "Store"
            ? { ref, onLayout }
            : {};
        return (
          <TouchableOpacity
            key={index}
            className="flex flex-row h-[68px] w-[68px] relative"
            onPress={() => props.switchPage(tab.name)}
            {...tutorialProps}
          >
            <Canvas style={{ flex: 1 }} className="w-full h-full">
              <Image
                image={tab.name === props.selectedTab ? menuButtonSelectedImg : menuButtonImg}
                fit="contain"
                x={0}
                y={0}
                width={68}
                height={68}
                sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
              />
            </Canvas>
            <Canvas style={{ position: 'absolute', left: 0, top: 0, width: 68, height: 68 }}>
              <Image
                image={getTabIcon(tab.name, tab.name === props.selectedTab)}
                fit="contain"
                x={10}
                y={10}
                width={48}
                height={48}
                sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
              />
            </Canvas>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Footer;
