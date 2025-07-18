import { View, Text } from "react-native";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import { useImages } from "../../hooks/useImages";

interface SectionHeaderProps {
  width: number;
  title: string;
}
export const PageHeader: React.FC<SectionHeaderProps> = ({ width, title }) => {
  const { getImage } = useImages();

  return (
    <View className="w-full relative mb-14">
      <Canvas style={{ width: width - 8, height: 24, marginLeft: 4 }}>
        <Image
          image={getImage("shop.title")}
          fit="fill"
          x={0}
          y={0}
          width={width - 8}
          height={24}
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
        />
      </Canvas>
      <Text className="text-[#fff7ff] text-2xl font-bold absolute right-2 font-Pixels">
        {title}
      </Text>
    </View>
  );
};
