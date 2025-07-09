import { View } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../../hooks/useImages";

type IconWithLockProps = {
  txIcon: string;
  locked: boolean;
};

export const IconWithLock: React.FC<IconWithLockProps> = ({
  txIcon,
  locked,
}) => {
  const { getImage } = useImages();

  return (
    <View className="flex flex-col justify-center relative w-[64px] h-[64px] relative">
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={getImage("shop.tx.bg")}
          fit="fill"
          x={0}
          y={0}
          width={64}
          height={64}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.None,
          }}
        />
      </Canvas>
      <View className="absolute top-0 left-0 w-full h-full">
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getImage(txIcon)}
            fit="fill"
            x={14}
            y={14}
            width={36}
            height={36}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.None,
            }}
          />
        </Canvas>
      </View>
      {locked && (
        <View
          className="absolute top-0 left-0 w-full h-full
                         bg-[#10111970] rounded-sm"
        >
          <Canvas style={{ flex: 1 }} className="w-full h-full">
            <Image
              image={getImage("shop.lock")}
              fit="fill"
              x={14}
              y={14}
              width={36}
              height={36}
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.None,
              }}
            />
          </Canvas>
        </View>
      )}
    </View>
  );
};
