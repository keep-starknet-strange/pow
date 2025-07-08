import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { useUpgrades } from "../../context/Upgrades";
import { shortMoneyString } from "../../utils/helpers";
import { IconWithLock } from "./transactionUpgrade/IconWithLock";
import { TxDetails } from "./transactionUpgrade/TxDetails";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

export type AutomationViewProps = {
  chainId: number;
  automation: any; // TODO: define a proper type for automation
};

export const AutomationView: React.FC<AutomationViewProps> = (props) => {
  const { getImage } = useImages();
  const { width } = Dimensions.get("window");
  const { automations, upgradeAutomation, getNextAutomationCost } =
    useUpgrades();

  const getAutomationIcon = (
    chainId: number,
    automationName: string,
    levelId: number,
  ) => {
    switch (automationName) {
      case "Miner":
        switch (levelId) {
          case 0:
            return "shop.automation.miner.0";
          case 1:
            return "shop.automation.miner.1";
          case 2:
            return "shop.automation.miner.2";
          case 3:
            return "shop.automation.miner.3";
          case 4:
            return "shop.automation.miner.4";
          case 5:
            return "shop.automation.miner.5";
          case 6:
            return "shop.automation.miner.6";
          default:
            return "unknown";
        }
      case "Sequencer":
        switch (levelId) {
          case 0:
            return "shop.automation.sequencer.0";
          case 1:
            return "shop.automation.sequencer.1";
          case 2:
            return "shop.automation.sequencer.2";
          case 3:
            return "shop.automation.sequencer.3";
          case 4:
            return "shop.automation.sequencer.4";
          case 5:
            return "shop.automation.sequencer.5";
          default:
            return "unknown";
        }
      case "DA":
        switch (levelId) {
          case 0:
            return "shop.automation.da.0";
          case 1:
            return "shop.automation.da.1";
          case 2:
            return "shop.automation.da.2";
          case 3:
            return "shop.automation.da.3";
          case 4:
            return "shop.automation.da.4";
          default:
            return "unknown";
        }
      case "Prover":
        switch (levelId) {
          case 0:
            return "shop.automation.prover.0";
          case 1:
            return "shop.automation.prover.1";
          case 2:
            return "shop.automation.prover.2";
          case 3:
            return "shop.automation.prover.3";
          case 4:
            return "shop.automation.prover.4";
          case 5:
            return "shop.automation.prover.5";
          default:
            return "unknown";
        }
      default:
        return "unknown";
    }
  };

  const [level, setLevel] = useState(0);
  useEffect(() => {
    const automationLevel =
      automations[props.chainId][props.automation.id] + 1 || 0;
    setLevel(automationLevel);
  }, [props.chainId, props.automation.id, automations]);

  return (
    <View className="flex flex-col w-full">
      <View className="flex flex-row w-full mb-[4px]">
        <IconWithLock
          txIcon={getAutomationIcon(
            props.chainId,
            props.automation.name,
            level,
          )}
          locked={false}
        />
        <TxDetails
          name={props.automation.name}
          description={props.automation.description}
        />
      </View>
      <TouchableOpacity
        className="relative"
        style={{
          width: width - 32,
          height: 36,
        }}
        onPress={() => {
          upgradeAutomation(props.chainId, props.automation.id);
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage("shop.auto.buy")}
            fit="fill"
            x={0}
            y={0}
            width={width - 32}
            height={36}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.None,
            }}
          />
        </Canvas>
        <View className="flex flex-row absolute left-[8px] top-[6px] gap-2">
          <Text className="font-Pixels text-xl text-[#fff7ff]">Upgrade to</Text>
          <Text className="font-Pixels text-xl text-[#c89632]">
            {props.automation.levels[level]?.name || "Max"}
          </Text>
        </View>
        {level === props.automation.levels.length ? (
          <Text className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#ff0000]">
            Max
          </Text>
        ) : (
          <Text className="absolute right-[8px] top-[6px] font-Pixels text-xl text-[#fff7ff]">
            Cost:{" "}
            {shortMoneyString(
              getNextAutomationCost(props.chainId, props.automation.id),
            )}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
