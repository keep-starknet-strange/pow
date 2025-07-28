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

export const AutomationView: React.FC<AutomationViewProps> = (props) => {
  const { automations, upgradeAutomation, getNextAutomationCost } =
    useUpgrades();

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
            level - 1,
          )}
          locked={false}
        />
        <TxDetails
          name={`${props.automation.levels[level]?.name} ${props.automation.name}`}
          description={props.automation.description}
        />
      </View>
      <UpgradeButton
        label={`Upgrade to`}
        specialLabel={{
          text: `${props.automation.levels[level]?.name}`,
          color: "#D7A833",
        }}
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
};
