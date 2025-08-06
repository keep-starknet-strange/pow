import React, { useState, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import {
  Canvas,
  Image as SkiaImage,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

export interface WindowProps {
  style: StyleProp<ViewStyle>;
  onMeasured?: (h: number) => void;
  children: React.ReactNode;
}

const BG_SAMPLING = { filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest };

const WindowComponent: React.FC<WindowProps> = ({
  style,
  onMeasured,
  children,
}) => {
  const { getImage } = useImages();
  const [size, setSize] = useState({ w: 0, h: 0 });

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      if (width !== size.w || height !== size.h) {
        setSize({ w: width, h: height });
        onMeasured?.(height);
      }
    },
    [onMeasured, size.w, size.h],
  );

  return (
    <View
      style={[
        style,
        {
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          shadowColor: "black",
        },
      ]}
      onLayout={handleLayout}
    >
      {size.w > 0 && size.h > 0 && (
        <Canvas
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { width: size.w, height: size.h },
          ]}
        >
          <SkiaImage
            image={getImage("tutorial.window")}
            width={size.w}
            height={size.h}
            fit="fill"
            sampling={BG_SAMPLING}
          />
        </Canvas>
      )}

      <View style={styles.content}>{children}</View>
    </View>
  );
};

export const Window = memo(WindowComponent);

const styles = StyleSheet.create({
  content: {
    padding: 12,
    alignItems: "center",
  },
});
