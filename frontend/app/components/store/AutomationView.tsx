import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useUpgrades } from "../../stores/useUpgradesStore";
import { IconWithLock } from "./transactionUpgrade/IconWithLock";
import { TxDetails } from "./transactionUpgrade/TxDetails";
import { UpgradeButton } from "./transactionUpgrade/UpgradeButton";
import { getAutomationIcon } from "../../utils/upgrades";

export type AutomationViewProps = {
  chainId: number;
  automation: any; // TODO: define a proper type for automation
};

export const AutomationView: React.FC<AutomationViewProps> = React.memo(
  (props) => {
    const { automations, upgradeAutomation, getNextAutomationCost } =
      useUpgrades();

    const [level, setLevel] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(-1);
    useEffect(() => {
      const automationLevels = automations[props.chainId] || {};
      const automationLevel =
        automationLevels[props.automation.id] !== undefined
          ? automationLevels[props.automation.id]
          : -1;
      setCurrentLevel(automationLevel);
      setLevel(automationLevel + 1);
    }, [props.chainId, props.automation.id, automations]);

    return (
      <View className="flex flex-col w-full">
        <View className="flex flex-row w-full mb-[4px]">
          <IconWithLock
            txIcon={getAutomationIcon(
              props.chainId,
              props.automation.name,
              level - 1,
            )}
            locked={false}
          />
          <TxDetails
            name={
              level === 0
                ? props.automation.name
                : `${props.automation.levels[level - 1]?.name} ${props.automation.name}`
            }
            description={props.automation.description}
            chainId={props.chainId}
            upgradeId={props.automation.id}
            currentLevel={currentLevel}
            speeds={props.automation.levels?.map((level: any) => level.speed)}
            baseSpeed={0}
            subDescription={props.automation.subDescription}
            maxSubDescription={props.automation.maxSubDescription}
          />
        </View>
        <UpgradeButton
          label={
            level >= props.automation.levels.length
              ? `Upgrade maxxed`
              : `Upgrade to`
          }
          specialLabel={
            level >= props.automation.levels.length
              ? undefined
              : {
                  text: `${props.automation.levels[level]?.name}`,
                  color: "#D7A833",
                }
          }
          level={level}
          maxLevel={props.automation.levels.length}
          nextCost={getNextAutomationCost(props.chainId, props.automation.id)}
          onPress={() => {
            upgradeAutomation(props.chainId, props.automation.id);
          }}
          bgImage={"shop.auto.buy"}
        />
      </View>
    );
  },
);
