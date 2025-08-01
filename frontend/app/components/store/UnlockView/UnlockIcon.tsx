import React from "react";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "@/app/hooks/useImages";

type UnlockIconProps = {
  icon: string;
};

export const UnlockIcon: React.FC<UnlockIconProps> = React.memo(({ icon }) => {
  const { getImage } = useImages();

  return (
    <Canvas style={{ width: 64, height: 92 }}>
      <Image
        image={getImage(icon)}
        fit="contain"
        sampling={{
          filter: FilterMode.Nearest,
          mipmap: MipmapMode.Nearest,
        }}
        x={0}
        y={4}
        width={64}
        height={64}
      />
    </Canvas>
  );
});
