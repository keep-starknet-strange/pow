import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import { EventManagerProvider } from "./context/EventManager";
import { StarknetConnectorProvider } from "./context/StarknetConnector";
import { FocEngineProvider } from "./context/FocEngineConnector";
import { PowContractProvider } from "./context/PowContractConnector";
import { UpgradesProvider } from "./context/Upgrades";
import { TransactionsProvider } from "./context/Transactions";
import { ChainsProvider } from "./context/Chains";
import { GameProvider } from "./context/Game";
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
    <EventManagerProvider>
      <StarknetConnectorProvider>
        <FocEngineProvider>
          <PowContractProvider>
            <UpgradesProvider>
              <ChainsProvider>
                <GameProvider>
                  <TransactionsProvider>
                    <Game />
                  </TransactionsProvider>
                </GameProvider>
              </ChainsProvider>
            </UpgradesProvider>
          </PowContractProvider>
        </FocEngineProvider>
      </StarknetConnectorProvider>
    </EventManagerProvider>
  );
}
