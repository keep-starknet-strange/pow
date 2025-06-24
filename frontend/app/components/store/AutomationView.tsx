import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useUpgrades } from "../../context/Upgrades";
import { getAutomationIcons } from "../../utils/upgrades";
import lockImg from "../../../assets/images/lock.png";
import { shortMoneyString } from "../../utils/helpers";

export type AutomationViewProps = {
  chainId: number;
  automation: any; // TODO: define a proper type for automation
};

export const AutomationView: React.FC<AutomationViewProps> = (props) => {
  const { automations, upgradeAutomation } = useUpgrades();

  const [level, setLevel] = useState(0);
  const [currAutomationIcon, setCurrAutomationIcon] = useState(
    getAutomationIcons(props.chainId)[props.automation.name][
      props.automation.levels[0].name
    ],
  );
  const [automationIcons, setAutomationIcons] = useState(
    getAutomationIcons(props.chainId)[props.automation.name],
  );
  useEffect(() => {
    const automationLevel =
      automations[props.chainId][props.automation.id] + 1 || 0;
    setLevel(automationLevel);
    const automationIcons = getAutomationIcons(props.chainId)[
      props.automation.name
    ];
    setCurrAutomationIcon(
      automationLevel === 0
        ? automationIcons["None"]
        : automationIcons[props.automation.levels[automationLevel - 1].name],
    );
    setAutomationIcons(automationIcons);
  }, [props.chainId, props.automation.id, automations]);

  return (
    <View className="flex flex-row w-full items-center">
      <View
        className="flex flex-col justify-center items-center p-1
                       rounded-lg border-2 border-[#e7e7e740] relative"
        style={{
          backgroundColor: props.automation.color,
        }}
      >
        <Image
          source={currAutomationIcon}
          className="w-[5.4rem] h-[5.4rem] rounded-lg"
        />
      </View>
      <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
        <View className="flex flex-col justify-start items-start ml-2 gap-1 flex-1">
          <Text className="text-[#e7e7e7] text-xl font-bold">
            {props.automation.name}
          </Text>
          <Text className="text-[#e7e7e7] text-md mb-[1rem]">
            {props.automation.description}
          </Text>
        </View>
        <View className="flex flex-row justify-start items-start ml-2 gap-1 flex-1">
          {props.automation.levels.map((automation: any, index: number) => (
            <TouchableOpacity
              key={index}
              className="flex justify-center items-center rounded-lg p-2 relative"
              style={{
                backgroundColor:
                  level <= index ? "#e7e7e730" : automation.color,
              }}
              onPress={() => {
                if (level !== index) return;
                upgradeAutomation(props.chainId, props.automation.id);
              }}
            >
              <Image
                source={automationIcons[automation.name]}
                className="w-[2rem] h-[2rem]"
              />
              {level < index && (
                <View className="absolute pointer-events-none rounded-lg p-2 bg-[#272727a0]">
                  <Image source={lockImg} className="h-[2rem] w-[2rem]" />
                </View>
              )}
              {level === index && (
                <Text
                  className="absolute top-[-1rem] text-center py-[2px]
                           border-2 border-[#e7e7e740] rounded-xl w-[2.8rem]
                           text-[#171717] text-xs font-bold bg-[#e7e760f0]"
                >
                  {shortMoneyString(automation.cost)}
                </Text>
              )}
              <Text
                className="absolute bottom-[-1rem] text-center text-nowrap w-[20rem]
                            text-[#f7f7f7] text-xs"
              >
                {automation.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
