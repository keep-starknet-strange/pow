import React from "react";
import { View, Pressable, Text, Dimensions } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "@/app/hooks/useImages";
import { useEventManager } from "@/app/stores/useEventManager";


interface TransactionTabsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  show: boolean;
  topPosition: number;
  dappsRef?: React.Ref<any>;
  dappsOnLayout?: () => void;
}

export const TransactionTabs: React.FC<TransactionTabsProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  show,
  topPosition,
  dappsRef,
  dappsOnLayout,
}) => {
  const { getImage } = useImages();
  const { notify } = useEventManager();
  const window = Dimensions.get("window");

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    notify("SwitchTab", { name: tab });
  };

  if (!show) return null;

  return (
    <View 
      className="absolute left-0 px-[4px] h-[28px] flex flex-row items-end justify-between gap-[4px]"
      style={{ top: topPosition }}
    >
      {tabs.map((tab) => (
        <Pressable
          style={{
            width: window.width / 2 - 6,
            height: tab === activeTab ? 28 : 24,
          }}
          key={tab}
          onPress={() => handleTabPress(tab)}
          ref={tab === "dApps" ? dappsRef : undefined}
          onLayout={tab === "dApps" ? dappsOnLayout : undefined}
        >
          <Canvas style={{ width: "100%", height: "100%" }}>
            <Image
              image={getImage(
                tab === activeTab ? "tx.tab.active" : "tx.tab.inactive",
              )}
              fit="fill"
              x={0}
              y={0}
              width={window.width / 2 - 6}
              height={tab === activeTab ? 28 : 24}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
            />
          </Canvas>
          <Text
            className="absolute top-[6px] left-0 right-0 text-[16px] font-Pixels text-center w-full"
            style={{
              color: tab === activeTab ? "#FFF7FF" : "#a9a9a9",
            }}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default TransactionTabs;