import { useGameState } from "../context/GameState";
import { L1Phase } from "./main/L1Phase";
import { L2Phase } from "./main/L2Phase";

export const MainPage: React.FC = (props) => {
  const { gameState } = useGameState();
  // TODO: Phase from state
  // TODO: Style overflow with shadow of pastBlocks
  // TODO: Disable mempool if block is full
  return (
    <>
      {gameState.l2 ? (
        <L2Phase {...props} />
      ) : (
        <L1Phase {...props} />
      )}
    </>
  );
}

export default MainPage;
