import React, { memo } from "react";
import { View, Text, Dimensions } from "react-native";
import { Canvas, ImageShader, Image, FilterMode, MipmapMode, Rect } from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";
import { useImages } from "../../hooks/useImages";
import { getTxBg, getTxIcon, getTxInner, getTxNameplate } from "../../utils/transactions";

export interface TxButtonInnerProps {
  chainId: number;
  txId: number;
  feeLevel: number;
  name: string;
}

export const TxButtonInner = memo(
  (props: TxButtonInnerProps) => {
  const { getImage } = useImages();
  const { width } = Dimensions.get("window");

  const automationAnimHeight = useSharedValue(94);
  const automationAnimY = useDerivedValue(() => {
    return 94 - automationAnimHeight.value;
  }, [automationAnimHeight]);

  return (
    <View className="w-full h-[94px] relative">
    <View
      className="absolute h-[94px]"
      style={{
        width: width * 0.185,
      }}
    >
      <Canvas style={{ flex: 1 }} className="w-full h-full">
        <Image
          image={getTxBg(props.chainId, props.txId, false, getImage)}
          fit="fill"
          sampling={{
            filter: FilterMode.Nearest,
            mipmap: MipmapMode.Nearest,
          }}
          x={0}
          y={0}
          width={width * 0.185}
          height={94}
        />
      </Canvas>
    </View>
    {props.feeLevel !== -1 && (
      <View
        className="absolute bottom-0 h-full"
        style={{
          width: width * 0.18,
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Rect
            x={0}
            y={automationAnimY}
            width={width * 0.18}
            height={automationAnimHeight}
          >
            <ImageShader
              image={getTxInner(props.chainId, props.txId, false, getImage)}
              fit="fill"
              sampling={{
                filter: FilterMode.Nearest,
                mipmap: MipmapMode.Nearest,
              }}
              rect={{ x: 0, y: 0, width: width * 0.18, height: 94 }}
            />
          </Rect>
        </Canvas>
      </View>
    )}
    {props.feeLevel !== -1 && (
      <View
        className="absolute left-[3px] h-[94px] w-full"
        style={{
          width: width * 0.17,
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getTxNameplate(props.chainId, props.txId, false, getImage)}
            fit="fill"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={2}
            width={width * 0.165}
            height={19}
          />
        </Canvas>
        <Text className="absolute left-0 top-[4px] w-full text-center text-[16px] text-[#fff8ff] font-Pixels">
          {props.name}
        </Text>
      </View>
    )}
    {props.feeLevel === -1 ? (
      <View
        className="absolute w-full h-full
               pointer-events-none
               top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
        style={{
          width: width * 0.18,
        }}
      >
        <Canvas
          style={{ flex: 1 }}
          className="w-full h-full flex justify-center items-center"
        >
          <Image
            image={getImage("shop.lock")}
            fit="contain"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={30}
            width={width * 0.18}
            height={40}
          />
        </Canvas>
      </View>
    ) : (
      <View
        className="absolute h-[94px]"
        style={{
          width: width * 0.18,
        }}
      >
        <Canvas style={{ flex: 1 }} className="w-full h-full">
          <Image
            image={getTxIcon(props.chainId, props.txId, false, getImage)}
            fit="contain"
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
            x={0}
            y={30}
            width={width * 0.18}
            height={40}
          />
        </Canvas>
      </View>
    )}
    </View>
  );
});
