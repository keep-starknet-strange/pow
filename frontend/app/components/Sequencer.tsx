import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Confirmer } from "./Confirmer";

interface SequencerProps {
  triggerAnim: () => void;
  sequencingProgress: number;
  sequenceBlock: () => void;
}

export const Sequencer: React.FC<SequencerProps> = ({
  triggerAnim,
  sequencingProgress,
  sequenceBlock,
}) => {
  const [sequenceHash, setSequenceHash] = useState("0xdEadBeefDeadbE");
  const [sequenceColor, setSequenceColor] = useState("#CA1F4B");

  const generateRandomHash = (isDone: boolean) => {
    const difficulty = 4; // TODO: match with miner difficulty
    const randomPart = Math.floor(Math.random() * 0xffffffffff)
      .toString(14)
      .padStart(14, "0");
    // Replace first `difficulty` bytes with 00 if done
    return isDone
      ? `0x${"00".repeat(difficulty)}${randomPart}`
      : `0x${randomPart}`;
  };

  useEffect(() => {
    setSequenceHash(generateRandomHash(sequencingProgress === 1));
    setSequenceColor(sequencingProgress === 1 ? "#20DF20" : "#CA1F4B");
  }, [sequencingProgress]);

  // Generate flash text and color based on whether this will be the final click
  const getFlashData = () => {
    const willComplete = sequencingProgress >= 0.99; // Close to completion
    return {
      text: generateRandomHash(willComplete),
      color: willComplete ? "#20DF20" : "#CA1F4B",
    };
  };

  const flashData = getFlashData();

  return (
    <View className="flex flex-col h-full aspect-square relative">
      <Confirmer
        progress={sequencingProgress}
        onConfirm={() => {
          triggerAnim();
          sequenceBlock();
        }}
        renderedBy="sequencer"
        specialFlashText={flashData.text}
        specialFlashTextColor={flashData.color}
      />
    </View>
  );
};
