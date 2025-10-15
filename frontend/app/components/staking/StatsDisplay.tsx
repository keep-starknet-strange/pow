import React, { memo, useState } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { Canvas, Image } from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

interface StatsDisplayProps {
  label: string;
  value: string;
}

const StatsDisplayComponent: React.FC<StatsDisplayProps> = ({
  label,
  value,
}) => {
  const { getImage } = useImages();
  const backgroundImage = getImage("staking.stat.bg");
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {size.width > 0 && size.height > 0 && backgroundImage && (
        <Canvas style={styles.backgroundCanvas}>
          <Image
            image={backgroundImage}
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            fit="fill"
          />
        </Canvas>
      )}
      <Text style={styles.text} numberOfLines={1}>
        {label} {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 56, // match staking button height
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: 56,
  },
  text: {
    fontFamily: "Pixels",
    fontSize: 20, // slightly smaller
    lineHeight: 32,
    textAlign: "center",
    color: "#fff7ff",
    zIndex: 1,
  },
});

export const StatsDisplay = memo(StatsDisplayComponent);
