import { View, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useTutorialLayout } from '../hooks/useTutorialLayout';
import { TargetId } from '../context/Tutorial';

export type ConfirmerProps = {
  progress: number;
  image: ImageSourcePropType;
  getAnimation: (progress: number) => ImageSourcePropType;
  onConfirm: () => void;
  renderedBy?: string;
};

export const Confirmer: React.FC<ConfirmerProps> = (props) => {
  const enabled = props.renderedBy === "miner";
  const { ref, onLayout } = useTutorialLayout("minerConfirmer" as TargetId, enabled);
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
        ref={ref}
        onLayout={onLayout}
      >
        <Image source={props.image} className="w-28 h-28" />
      </TouchableOpacity>
    </View>
  );
};
