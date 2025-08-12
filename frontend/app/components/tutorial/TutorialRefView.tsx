import React, { memo } from "react";
import { View } from "react-native";
import { useTutorialLayout } from "../../hooks/useTutorialLayout";
import { TargetId } from "../../stores/useTutorialStore";

export interface TutorialRefViewProps {
  targetId: string;
  enabled: boolean;
}

export const TutorialRefView: React.FC<TutorialRefViewProps> = memo((props) => {
  const { ref, onLayout } = useTutorialLayout(
    props.targetId as TargetId,
    props.enabled,
  );
  return (
    <View className="w-full h-full absolute" ref={ref} onLayout={onLayout} />
  );
});
