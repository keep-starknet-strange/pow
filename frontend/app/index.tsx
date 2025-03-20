import React from "react";
import { EventManagerProvider } from "./context/EventManager";
import { SoundProvider } from "./context/Sound";
import { GameStateProvider } from "./context/GameState";
import { AchievementProvider } from "./context/Achievements";
import { UpgradesProvider } from "./context/Upgrades";
import Game from "./game";

export default function App() {
  return (
    <EventManagerProvider>
      <SoundProvider>
        <GameStateProvider>
          <AchievementProvider>
            <UpgradesProvider>
              <Game />
            </UpgradesProvider>
          </AchievementProvider>
        </GameStateProvider>
      </SoundProvider>
    </EventManagerProvider>
  );
}
