import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import { StarknetConnectorProvider } from "./context/StarknetConnector";
import { FocEngineProvider } from "./context/FocEngineConnector";
import { PowContractProvider } from "./context/PowContractConnector";
import { useImagePreloader } from "./hooks/useImagePreloader";
import Game from "./game";

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useImagePreloader();

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        Xerxes: require("../assets/fonts/Xerxes-10.ttf"),
        Pixels: require("../assets/fonts/04B_03_.ttf"),
        Teatime: require("../assets/fonts/Teatime7.ttf"),
      });
      setFontLoaded(true);
    }
    loadFont();
  }, []);

  if (!fontLoaded) {
    return null; // or a loading screen
  }

  return (
    <StarknetConnectorProvider>
      <FocEngineProvider>
        <PowContractProvider>
          <Game />
        </PowContractProvider>
      </FocEngineProvider>
    </StarknetConnectorProvider>
  );
}
