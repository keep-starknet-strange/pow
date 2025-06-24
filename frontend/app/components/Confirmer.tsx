import {
  View,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useTutorialLayout } from "../hooks/useTutorialLayout";
import { TargetId } from "../context/Tutorial";

export type ConfirmerProps = {
  progress: number;
  image: ImageSourcePropType;
  getAnimation: (progress: number) => ImageSourcePropType;
  onConfirm: () => void;
  renderedBy?: string;
};

export const Confirmer: React.FC<ConfirmerProps> = (props) => {
  const enabled =
    props.renderedBy !== undefined &&
    ["miner", "sequencer", "da", "prover"].includes(props.renderedBy);
  let tutorialProps = {};
  let ref, onLayout;
  if (enabled) {
    const targetId = `${props.renderedBy}Confirmer` as TargetId;
    ({ ref, onLayout } = useTutorialLayout(targetId, enabled));
    tutorialProps = { ref, onLayout };
  }

  return (
    <View className="w-full h-full relative">
      {props.progress > 0 && (
        <Image
          source={props.getAnimation(props.progress)}
          className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-full h-full"
        />
      )}
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
        onPress={props.onConfirm}
        {...tutorialProps}
      >
        <Image source={props.image} className="w-28 h-28" />
      </TouchableOpacity>
    </View>
  );
};
