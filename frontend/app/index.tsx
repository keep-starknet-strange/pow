import React from "react";
import { EventManagerProvider } from "./context/EventManager";
import { SoundProvider } from "./context/Sound";
import { GameStateProvider } from "./context/GameState";
import { AchievementProvider } from "./context/Achievements";
import { UpgradesProvider } from "./context/Upgrades";
import Game from "./game";
import { CurrentBlockProvider } from "./context/CurrentBlock";

export default function App() {
  return (
    <EventManagerProvider>
      <SoundProvider>
        <GameStateProvider> 
          <CurrentBlockProvider>
            <AchievementProvider>
              <UpgradesProvider>
                <Game />
              </UpgradesProvider>
            </AchievementProvider>
          </CurrentBlockProvider>
        </GameStateProvider>
      </SoundProvider>
    </EventManagerProvider>

  );
}
