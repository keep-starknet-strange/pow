import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import { EventManagerProvider } from "./context/EventManager";
import { StarknetConnectorProvider } from "./context/StarknetConnector";
import { FocEngineProvider } from "./context/FocEngineConnector";
import { PowContractProvider } from "./context/PowContractConnector";
import { BalanceProvider } from "./context/Balance";
import { UpgradesProvider } from "./context/Upgrades";
import { TransactionsProvider } from "./context/Transactions";
import { ChainsProvider } from "./context/Chains";
import { StakingProvider } from "./context/Staking";
import { ImageProvider } from "./context/ImageProvider";
import { GameProvider } from "./context/Game";
import Game from "./game";

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        Xerxes: require("../assets/fonts/Xerxes-10.ttf"),
        Pixels: require("../assets/fonts/04B_03_.ttf"),
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
            <BalanceProvider>
              <UpgradesProvider>
                <ChainsProvider>
                  <StakingProvider>
                    <GameProvider>
                      <TransactionsProvider>
                        <ImageProvider>
                          <Game />
                        </ImageProvider>
                      </TransactionsProvider>
                    </GameProvider>
                  </StakingProvider>
                </ChainsProvider>
              </UpgradesProvider>
            </BalanceProvider>
          </PowContractProvider>
        </FocEngineProvider>
      </StarknetConnectorProvider>
    </EventManagerProvider>
  );
}
