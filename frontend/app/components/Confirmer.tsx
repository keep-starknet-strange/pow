import React from 'react';
import { View, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';

export type ConfirmerProps = {
  progress: number;
  image: ImageSourcePropType;
  getAnimation: (progress: number) => ImageSourcePropType;
  onConfirm: () => void;
};

export const Confirmer: React.FC<ConfirmerProps> = (props) => {

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
      >
        <Image source={props.image} className="w-28 h-28" />
      </TouchableOpacity>
    </View>
  );
};
