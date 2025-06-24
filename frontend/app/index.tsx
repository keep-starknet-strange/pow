import React from "react";
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
import { GameProvider } from "./context/Game";
import { AchievementProvider } from "./context/Achievements";
import { TutorialProvider } from "./context/Tutorial";
import Game from "./game";

export default function App() {
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
                                <Game />
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
