import { Dimensions, View } from "react-native";
import { useTransactions } from "../../context/Transactions";
import { useImageProvider } from "../../context/ImageProvider";
import { TransactionButtonsView } from "../../components/TransactionButtonsView";
import {
  Canvas,
  Image,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import BlockchainView from "@/app/components/BlockchainView";

export interface L2PhaseProps {
  setCurrentView: (view: string) => void;
}

export const L2Phase: React.FC<L2PhaseProps> = ({ setCurrentView }) => {
  const { dappsUnlocked } = useTransactions();
  const { getImage } = useImageProvider();
  const window = Dimensions.get("window");

  return (
    <View
      style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}
    >
      <BlockchainView chainId={1} style={{ flex: 1 }} />

      {/* TODO dapps unlocked*/}
      {/*<View className="mt-[0.5rem] w-full">*/}
      {/*  {!dappsUnlocked[1] && <DappsUnlock chainId={1} />}*/}
      {/*  <View className="flex flex-row justify-between items-center px-4">*/}
      {/*    <DaView />*/}
      {/*    <ProverView />*/}
      {/*  </View>*/}
      {/*</View>*/}

      <View
        style={{
          width: "100%",
          height: 120,
          zIndex: 20,
        }}
      >
        <Canvas
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            image={getImage("nav.bg")}
            fit="fill"
            x={0}
            y={0}
            width={window.width}
            height={200}
            sampling={{
              filter: FilterMode.Nearest,
              mipmap: MipmapMode.Nearest,
            }}
          />
        </Canvas>

        <TransactionButtonsView chainId={1} isDapps={dappsUnlocked[1]} />
      </View>
    </View>
  );
};

export default L2Phase;
