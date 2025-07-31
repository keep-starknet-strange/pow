import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

interface ConfirmationButtonProps {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: "confirm" | "cancel" | "danger";
  disabled?: boolean;
  style?: ViewStyle;
}

export const ConfirmationButton: React.FC<ConfirmationButtonProps> = ({
  label,
  onPress,
  variant = "confirm",
  disabled = false,
  style,
}) => {
  const { getImage } = useImages();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const getTextColor = () => {
    if (disabled) return "#666";
    switch (variant) {
      case "danger":
        return "#ff4444";
      case "cancel":
        return "#bbb";
      case "confirm":
      default:
        return "#fff7ff";
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return "#1a1a1a";
    switch (variant) {
      case "danger":
        return "#3a1f1f";
      case "cancel":
        return "#2a2a2a";
      case "confirm":
      default:
        return "#2c2c2e";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { backgroundColor: getBackgroundColor() }, style]}
      onLayout={onLayout}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {size.width > 0 && size.height > 0 && !disabled && (
        <Canvas
          style={[
            StyleSheet.absoluteFillObject,
            { width: size.width, height: size.height },
          ]}
        >
          <Image
            image={getImage("staking.button")}
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

      <Text
        style={[styles.label, { color: getTextColor() }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const BORDER_RADIUS = 8;

const styles = StyleSheet.create({
  button: {
    minWidth: 100,
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  label: {
    fontFamily: "Pixels",
    fontSize: 20,
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
