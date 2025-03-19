import React from "react";
import { EventManagerProvider } from "./context/EventManager";
import { SoundProvider } from "./context/Sound";
import { AchievementProvider } from "./context/Achievements";
import Game from "./game";

export default function App() {
  return (
    <EventManagerProvider>
      <SoundProvider>
        <AchievementProvider>
          <Game />
        </AchievementProvider>
      </SoundProvider>
    </EventManagerProvider>
  );
}
