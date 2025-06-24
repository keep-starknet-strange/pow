import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { EventManagerProvider } from "./context/EventManager";
import { InAppNotificationsProvider } from "./context/InAppNotifications";
import { SoundProvider } from "./context/Sound";
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
import { AchievementProvider } from "./context/Achievements";
import { TutorialProvider } from "./context/Tutorial";
import Game from "./game";

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'Xerxes': require('../assets/fonts/Xerxes-10.ttf'),
        'Pixels': require('../assets/fonts/04B_03_.ttf'),
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
      <InAppNotificationsProvider>
        <TutorialProvider>
          <SoundProvider>
            <StarknetConnectorProvider>
              <FocEngineProvider>
                <PowContractProvider>
                  <BalanceProvider>
                    <UpgradesProvider>
                      <ChainsProvider>
                        <StakingProvider>
                          <GameProvider>
                            <TransactionsProvider>
                              <AchievementProvider>
                                <ImageProvider>
                                  <Game />
                                </ImageProvider>
                              </AchievementProvider>
                            </TransactionsProvider>
                          </GameProvider>
                        </StakingProvider>
                      </ChainsProvider>
                    </UpgradesProvider>
                  </BalanceProvider>
                </PowContractProvider>
              </FocEngineProvider>
            </StarknetConnectorProvider>
         </SoundProvider>
        </TutorialProvider>
      </InAppNotificationsProvider>
    </EventManagerProvider>
  );
}
