import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { playMineClicked, playBlockMined } from "../components/utils/sounds";
import { useEventManager } from "../context/EventManager";
import { useGameState } from "../context/GameState";
import { useSound } from "../context/Sound";
import { useAutoClicker } from "../hooks/useAutoClicker";
import { useCurrentBlock } from "../context/CurrentBlock";
import { useBlockActions } from "../hooks/useBlockActions";

type MinerProps = {
  switchPage: (page: string) => void;
};

export const Miner: React.FC<MinerProps> = ({ switchPage }) => {
    const [mineCounter, setMineCounter] = useState(0);
    const { notify } = useEventManager();
    const { upgradableGameState } = useGameState();
    const { currentBlock } = useCurrentBlock();
    const { isSoundOn } = useSound();
    const { finalizeBlock } = useBlockActions();
    
    const shouldMine =
    upgradableGameState.minerSpeed > 0 &&
    mineCounter < currentBlock.hp &&
    currentBlock.transactions.length === currentBlock.maxSize;

    const tryMineBlock = useCallback(() => {
      playMineClicked(isSoundOn);
      setMineCounter(prev => {
        const newMineCounter = prev + 1;

        if (newMineCounter >= currentBlock.hp) {
          setTimeout(() => {
            notify("TryMineBlock", {
              mineCounter: newMineCounter,
              isMined: true,
            });
            finalizeBlock();
            playBlockMined(isSoundOn);
            switchPage("SequencingPage");
          }, 0);
        }
        return newMineCounter;
      });
    }, [currentBlock.hp, finalizeBlock, isSoundOn, notify, switchPage]);

  useAutoClicker(
    shouldMine,
    1000 / upgradableGameState.minerSpeed,
    tryMineBlock
  );

  const progressPercent = Math.floor((mineCounter / currentBlock.hp) * 100);
  return (
    <View className="flex flex-col bg-[#272727b0] h-full aspect-square rounded-xl relative">
      <View
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#ff6727] opacity-50 aspect-square rounded-full"
        style={{ width: `${Math.floor(mineCounter / currentBlock.hp * 100)}%`, height: `${Math.floor(mineCounter / currentBlock.hp * 100)}%` }}
      />
      <TouchableOpacity
        className="absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] bg-[#a7a7a7c0] rounded-full flex items-center justify-center
                  border-2 border-[#c7c7f780]"
        onPress={tryMineBlock}
      >
        <Text className="text-[#171717] text-6xl m-4 mx-10">⛏️</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Miner;
