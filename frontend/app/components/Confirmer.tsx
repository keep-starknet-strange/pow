import { useLayoutEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, ImageSourcePropType } from 'react-native'
import { useTutorial } from '../context/Tutorial'

export type ConfirmerProps = {
  progress: number;
  image: ImageSourcePropType;
  getAnimation: (progress: number) => ImageSourcePropType;
  onConfirm: () => void;
};

export const Confirmer: React.FC<ConfirmerProps> = (props) => {
  const viewRef = useRef<View>(null);
  const { step, registerLayout } = useTutorial();
    useLayoutEffect(() => {
      if (viewRef.current && step === "mineBlock") {
        viewRef.current.measureInWindow((x, y, width, height) => {
          console.log("Confirmer layout", x, y, width, height);
          // registerLayout("mineBlock", { x, y, width, height });
        });
      }
    }, [step]);

  return (
    <View className="w-full h-full relative">
      {props.progress > 0 && (
        <Image
        source={props.getAnimation(props.progress)}
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] w-full h-full"
        />
      )}
      <TouchableOpacity
        ref={viewRef}
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
        onPress={props.onConfirm}
      >
        <Image source={props.image} className="w-28 h-28" />
      </TouchableOpacity>
    </View>
  );
};
