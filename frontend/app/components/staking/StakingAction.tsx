import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  LayoutChangeEvent,
  GestureResponderEvent,
} from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

interface StakingActionsProps {
  action: (e: GestureResponderEvent) => void;
  label: string;
  disabled?: boolean;
  expand?: boolean; // if false, button will size to content
  style?: object;
}

export const StakingAction: React.FC<StakingActionsProps> = ({
  action,
  label,
  disabled = false,
  expand = true,
  style,
}) => {
  const { getImage } = useImages();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <TouchableOpacity
      onPress={action}
      disabled={disabled}
      style={[styles.button, !expand && styles.buttonCompact, style]}
      onLayout={onLayout}
      activeOpacity={0.8}
    >
      {size.width > 0 && size.height > 0 && (
        <Canvas
          style={[
            StyleSheet.absoluteFillObject,
            { width: size.width, height: size.height },
          ]}
        >
          <Image
            image={getImage("staking.button.bg")}
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            fit="fill"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>
      )}

      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const BORDER_RADIUS = 8;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    marginHorizontal: 4,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonCompact: {
    flex: 0,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: "Teatime",
    fontSize: 33,
    color: "#fff7ff",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
