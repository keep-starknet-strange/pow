import { memo } from "react";
import { View } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";

import { TransactionUpgradeView } from "./TransactionUpgradeView";
import { UpgradeView } from "./UpgradeView";
import { AutomationView } from "./AutomationView";
import { DappsUnlock } from "./DappsUnlock";
import { L2Unlock } from "./L2Unlock";
import { PrestigeUnlock } from "./PrestigeUnlock";

export const StoreListItem = memo(
  ({ item, width, getImage }: { item: any; width: number; getImage: any }) => {
    switch (item.type) {
      case "transaction":
        return (
          <View className="px-[16px]">
            <TransactionUpgradeView
              chainId={item.chainId}
              txData={item.data}
              isDapp={false}
            />
          </View>
        );
      case "dapp":
        return (
          <View className="px-[16px]">
            <TransactionUpgradeView
              chainId={item.chainId}
              txData={item.data}
              isDapp={true}
            />
          </View>
        );
      case "upgrade":
        return (
          <View className="px-[16px]">
            <UpgradeView chainId={item.chainId} upgrade={item.data} />
          </View>
        );
      case "automation":
        return (
          <View className="px-[16px]">
            <AutomationView chainId={item.chainId} automation={item.data} />
          </View>
        );
      case "dapps-header":
        return (
          <View className="flex flex-col px-[16px]">
            <View className="w-full relative pb-[16px]">
              <Canvas style={{ width: width - 32, height: 24 }}>
                <Image
                  image={getImage("shop.title")}
                  fit="fill"
                  x={0}
                  y={0}
                  width={width - 32}
                  height={24}
                  sampling={{
                    filter: FilterMode.Nearest,
                    mipmap: MipmapMode.Nearest,
                  }}
                />
              </Canvas>
              <Animated.Text
                className="text-[#fff7ff] text-xl absolute right-2 font-Pixels"
                entering={FadeInLeft}
              >
                DAPPS
              </Animated.Text>
            </View>
          </View>
        );
      case "dapps-unlock":
        return (
          <View className="px-[16px]">
            <DappsUnlock chainId={item.chainId} />
          </View>
        );
      case "l2-unlock":
        return (
          <View className="px-[16px]">
            <L2Unlock />
          </View>
        );
      case "prestige-unlock":
        return (
          <View className="px-[16px]">
            <PrestigeUnlock disableMinimize={true} marginHorizontal={0} />
          </View>
        );
      default:
        return null;
    }
  },
);
