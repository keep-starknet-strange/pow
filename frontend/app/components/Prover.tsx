import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useUpgrades } from "../stores/useUpgradesStore";
import { Confirmer } from "./Confirmer";

interface ProverProps {
  triggerAnim: () => void;
  proverProgress: number;
  prove: () => void;
}

export const Prover: React.FC<ProverProps> = ({
  triggerAnim,
  proverProgress,
  prove,
}) => {
  const [proverText, setProverText] = useState("QzPxWr");
  const [proverColor, setProverColor] = useState("#CA1F4B");

  const generateJumbledText = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const getSuccessWord = () => {
    const words = [
      "Complete!",
      "Done!",
      "You did it!",
      "Success!",
      "Verified!",
    ];
    return words[Math.floor(Math.random() * words.length)];
  };

  useEffect(() => {
    if (proverProgress === 1) {
      setProverText(getSuccessWord());
      setProverColor("#20DF20");
    } else {
      setProverText(generateJumbledText());
      setProverColor("#CA1F4B");
    }
  }, [proverProgress]);

  // Generate flash text and color based on whether this will be the final click
  const getFlashData = () => {
    const willComplete = proverProgress >= 0.99; // Close to completion
    return {
      text: willComplete ? getSuccessWord() : generateJumbledText(),
      color: willComplete ? "#20DF20" : "#CA1F4B",
    };
  };

  const flashData = getFlashData();

  return (
    <View className="flex flex-col bg-[#27272740] rounded-xl relative w-full">
      <Confirmer
        progress={proverProgress}
        text={"Click to prove!"}
        onConfirm={() => {
          triggerAnim();
          prove();
        }}
        renderedBy="prover"
        specialFlashText={flashData.text}
        specialFlashTextColor={flashData.color}
      />
    </View>
  );
};

export default Prover;
