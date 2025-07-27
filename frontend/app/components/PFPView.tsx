import React, { useState, useEffect } from "react";
import { View, Image } from "react-native";
import {
  getNounsHead,
  getNounsGlasses,
  getNounsBody,
  getNounsAccessories,
  NounsAttributes,
} from "../configs/nouns";
import Animated, {
  BounceInRight,
  BounceInLeft,
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  withSequence,
} from "react-native-reanimated";

type PFPViewProps = {
  user?: string | undefined;
  attributes?: NounsAttributes;
};

export const PFPView: React.FC<PFPViewProps> = ({ user, attributes }) => {
  const [nounsAttributes, setNounsAttributes] = useState(attributes);
  useEffect(() => {
    setHasInitialized(true);
    if (attributes) {
      setNounsAttributes(attributes);
      return;
    }
    if (user) {
      // TODO: Get the user PFP from the server/passed props?
    }
  }, [user, attributes]);

  const updateNouns = (newAttributes: NounsAttributes | undefined) => {
    setNounsBody(getNounsBody(newAttributes?.body || 0));
    setNounsAccessories(getNounsAccessories(newAttributes?.accessories || 0));
    setNounsHead(getNounsHead(newAttributes?.head || 0));
    setNounsGlasses(getNounsGlasses(newAttributes?.glasses || 0));
  };

  const [nounsBody, setNounsBody] = useState(
    getNounsBody(nounsAttributes?.body || 0),
  );
  const [nounsAccessories, setNounsAccessories] = useState(
    getNounsAccessories(nounsAttributes?.accessories || 0),
  );
  const [nounsHead, setNounsHead] = useState(
    getNounsHead(nounsAttributes?.head || 0),
  );
  const [nounsGlasses, setNounsGlasses] = useState(
    getNounsGlasses(nounsAttributes?.glasses || 0),
  );
  const bodySlideOutAnim = useSharedValue(0);
  const accessoriesSlideOutAnim = useSharedValue(0);
  const headSlideOutAnim = useSharedValue(0);
  const glassesSlideOutAnim = useSharedValue(0);
  const bodySlideOutOpacity = useSharedValue(1);
  const accessoriesSlideOutOpacity = useSharedValue(1);
  const headSlideOutOpacity = useSharedValue(1);
  const glassesSlideOutOpacity = useSharedValue(1);
  const [hasInitialized, setHasInitialized] = useState(false);
  const doSlideAnim = (
    slideOutSV: Animated.SharedValue<number>,
    slideOutOpacitySV: Animated.SharedValue<number>,
  ) => {
    slideOutSV.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 50 }, () =>
        runOnJS(updateNouns)(nounsAttributes),
      ),
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 200 }),
    );
    slideOutOpacitySV.value = withSequence(
      withTiming(0, { duration: 100 }),
      withTiming(0, { duration: 100 }),
      withTiming(1, { duration: 200 }),
    );
  };
  useEffect(() => {
    if (!hasInitialized) {
      return;
    }
    doSlideAnim(bodySlideOutAnim, bodySlideOutOpacity);
  }, [nounsAttributes?.body]);
  useEffect(() => {
    if (!hasInitialized) {
      return;
    }
    doSlideAnim(accessoriesSlideOutAnim, accessoriesSlideOutOpacity);
  }, [nounsAttributes?.accessories]);
  useEffect(() => {
    if (!hasInitialized) {
      return;
    }
    doSlideAnim(headSlideOutAnim, headSlideOutOpacity);
  }, [nounsAttributes?.head]);
  useEffect(() => {
    if (!hasInitialized) {
      return;
    }
    doSlideAnim(glassesSlideOutAnim, glassesSlideOutOpacity);
  }, [nounsAttributes?.glasses]);

  const bodySlideStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: bodySlideOutAnim.value * -50 }],
      opacity: bodySlideOutOpacity.value,
    };
  });
  const accessoriesSlideStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: accessoriesSlideOutAnim.value * 50 }],
      opacity: accessoriesSlideOutOpacity.value,
    };
  });
  const headSlideStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: headSlideOutAnim.value * 50 }],
      opacity: headSlideOutOpacity.value,
    };
  });
  const glassesSlideStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: glassesSlideOutAnim.value * -50 }],
      opacity: glassesSlideOutOpacity.value,
    };
  });

  return (
    <View className="flex flex-row items-center relative w-full h-full overflow-hidden">
      <Animated.Image
        style={bodySlideStyle}
        source={nounsBody}
        className="w-full h-full absolute top-0 left-0"
        resizeMode="contain"
      />
      <Animated.Image
        style={accessoriesSlideStyle}
        source={nounsAccessories}
        className="w-full h-full absolute top-0 left-0"
        resizeMode="contain"
      />
      <Animated.Image
        style={headSlideStyle}
        source={nounsHead}
        className="w-full h-full absolute top-0 left-0"
        resizeMode="contain"
      />
      <Animated.Image
        style={glassesSlideStyle}
        source={nounsGlasses}
        className="w-full h-full absolute top-0 left-0"
        resizeMode="contain"
      />
    </View>
  );
};
