import React from "react";
import { EventManagerProvider } from "./context/EventManager";
import { SoundProvider } from "./context/Sound";
import { AchievementProvider } from "./context/Achievements";
import Game from "./game";
import { UpgradesProvider } from "./context/Upgrades";

export default function App() {
  return (
    <EventManagerProvider>
      <SoundProvider>
        <AchievementProvider>
          <UpgradesProvider>
          <Game />
          </UpgradesProvider>
        </AchievementProvider>
      </SoundProvider>
    </EventManagerProvider>
  );
}
