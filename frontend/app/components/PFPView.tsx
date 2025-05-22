import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';
import {
  getNounsHead, getNounsGlasses, getNounsBody, getNounsAccessories,
  NounsAttributes
} from '../configs/nouns';

type PFPViewProps = {
  user?: String | undefined;
  attributes?: NounsAttributes;
}

export const PFPView: React.FC<PFPViewProps> = ({ user, attributes }) => {
  const [nounsAttributes, setNounsAttributes] = useState(attributes);
  useEffect(() => {
    if (attributes) {
      setNounsAttributes(attributes);
      return;
    }
    if (user) {
      // TODO: Get the user PFP from the server/passed props?
    }
  }, [user, attributes]);

  return (
    <View className="flex flex-row items-center relative w-full h-full">
      <Image
        source={getNounsBody(nounsAttributes?.body || 0)}
        className="w-full h-full absolute top-0 left-0"
        resizeMode="contain"
      />
      <Image
        source={getNounsAccessories(nounsAttributes?.accessories || 0)}
        className="w-full h-full absolute top-0 left-0"
        resizeMode="contain"
      />
      <Image
        source={getNounsHead(nounsAttributes?.head || 0)}
        className="w-full h-full absolute top-0 left-0"
        resizeMode="contain"
      />
      <Image
        source={getNounsGlasses(nounsAttributes?.glasses || 0)}
        className="w-full h-full absolute top-0 left-0"
        resizeMode="contain"
      />
    </View>
  );
};
