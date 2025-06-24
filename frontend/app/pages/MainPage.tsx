import React from "react";
import { View, Dimensions, ImageBackground } from "react-native";
import { useGame } from "../context/Game";
import { L1Phase } from "./main/L1Phase";
import { L2Phase } from "./main/L2Phase";
import background from "../../assets/background.png";

export const MainPage: React.FC = () => {
  const { l2 } = useGame();

  const [currentView, setCurrentView] = React.useState(l2 ? "L2" : "L1");

  return (
    <View
      className="flex-1"
      style={{
        transform: [
          {
            translateY:
              currentView === "L1" ? 0 : -Dimensions.get("window").height,
          },
        ],
      }}
    >
      <ImageBackground
        style={{ height: Dimensions.get("window").height }}
        source={background}
        resizeMode="cover"
      >
        <L1Phase setCurrentView={setCurrentView} />
      </ImageBackground>
      {l2 && (
        <ImageBackground
          style={{ height: Dimensions.get("window").height }}
          source={background}
          resizeMode="cover"
        >
          <L2Phase setCurrentView={setCurrentView} />
        </ImageBackground>
      )}
    </View>
  );
};

export default MainPage;
