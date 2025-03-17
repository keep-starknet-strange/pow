import React from "react";
import { SoundProvider } from "./context/Sound";
import Game from "./game";

export default function App() {
  return (
    <SoundProvider>
      <Game />
    </SoundProvider>
  );
}
