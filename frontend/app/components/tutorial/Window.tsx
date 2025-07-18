import React, { useState } from "react";
import {
  View,
  StyleSheet,
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

interface WindowProps {
  style?: ViewStyle | ViewStyle[];
  onLayout?: (e: LayoutChangeEvent) => void;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  style,
  onLayout,
  children,
}) => {
  const { getImage } = useImages();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
    onLayout?.(e);
  };

  return (
    <View style={style} onLayout={handleLayout}>
      {/* background */}
      {size.width > 0 && size.height > 0 && (
        <Canvas
          style={[
            StyleSheet.absoluteFillObject,
            { width: size.width, height: size.height },
          ]}
        >
          <SkiaImage
            image={getImage("tutorial.window")}
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            fit="fill"
            sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
          />
        </Canvas>
      )}

      {/* content wrapper (NOT absolute) so it drives layout height */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 12,
    alignItems: "center",
  },
});
