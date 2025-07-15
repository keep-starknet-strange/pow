import { View, TouchableOpacity } from "react-native";
import { TargetId } from "../stores/useTutorialStore";
import { useImages } from "../hooks/useImages";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type FooterProps = {
  tabs: { name: string; icon: string }[];
  selectedTab: string;
  switchPage: (page: string) => void;
};

export const Footer: React.FC<FooterProps> = (props) => {
  const { ref, onLayout } = useTutorialLayout("storeTab" as TargetId);
  const { getImage } = useImages();
  const insets = useSafeAreaInsets();

  const getTabIcon = (tabName: string, selected: boolean) => {
    switch (tabName) {
      case "Main":
        return selected
          ? getImage("nav.icon.game.active")
          : getImage("nav.icon.game");
      case "Store":
        return selected
          ? getImage("nav.icon.shop.active")
          : getImage("nav.icon.shop");
      case "Achievements":
        return selected
          ? getImage("nav.icon.flag.active")
          : getImage("nav.icon.flag");
      case "Leaderboard":
        return selected
          ? getImage("nav.icon.medal.active")
          : getImage("nav.icon.medal");
      case "Settings":
        return selected
          ? getImage("nav.icon.settings.active")
          : getImage("nav.icon.settings");
      default:
        return null;
    }
  };

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="bg-[#101119ff] flex flex-row justify-center w-full
                     absolute bottom-0 items-center z-[20] gap-2
    "
    >
      {props.tabs.map((tab, index) => {
        const tutorialProps = tab.name === "Store" ? { ref, onLayout } : {};
        return (
          <TouchableOpacity
            key={index}
            className="flex flex-row h-[68px] w-[68px] relative"
            onPress={() => props.switchPage(tab.name)}
            {...tutorialProps}
          >
            <Canvas style={{ flex: 1 }} className="w-full h-full">
              <Image
                image={
                  tab.name === props.selectedTab
                    ? getImage("nav.button.active")
                    : getImage("nav.button")
                }
                fit="fill"
                x={0}
                y={0}
                width={68}
                height={68}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Canvas>
            <Canvas
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 68,
                height: 68,
              }}
            >
              <Image
                image={getTabIcon(tab.name, tab.name === props.selectedTab)}
                fit="contain"
                x={10}
                y={10}
                width={48}
                height={48}
                sampling={{
                  filter: FilterMode.Nearest,
                  mipmap: MipmapMode.Nearest,
                }}
              />
            </Canvas>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Footer;
