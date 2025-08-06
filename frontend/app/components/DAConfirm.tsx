import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Confirmer } from "./Confirmer";

interface DAConfirmProps {
  triggerAnim: () => void;
  daProgress: number;
  daConfirm: () => void;
}

export const DAConfirm: React.FC<DAConfirmProps> = ({
  triggerAnim,
  daProgress,
  daConfirm,
}) => {
  const [daText, setDaText] = useState("XyZaB9");
  const [daColor, setDaColor] = useState("#CA1F4B");

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
    const words = ["Complete!", "Done!", "Stored!", "Success!", "Confirmed!"];
    return words[Math.floor(Math.random() * words.length)];
  };

  useEffect(() => {
    if (daProgress === 1) {
      setDaText(getSuccessWord());
      setDaColor("#20DF20");
    } else {
      setDaText(generateJumbledText());
      setDaColor("#CA1F4B");
    }
  }, [daProgress]);

  // Generate flash text and color based on whether this will be the final click
  const getFlashData = () => {
    const willComplete = daProgress >= 0.99; // Close to completion
    return {
      text: willComplete ? getSuccessWord() : generateJumbledText(),
      color: willComplete ? "#20DF20" : "#CA1F4B",
    };
  };

  const flashData = getFlashData();

  return (
    <View className="flex flex-col bg-[#27272740] rounded-xl relative w-full">
      <Confirmer
        progress={daProgress}
        text={"Click to store!"}
        onConfirm={() => {
          triggerAnim();
          daConfirm();
        }}
        renderedBy="da"
        specialFlashText={flashData.text}
        specialFlashTextColor={flashData.color}
      />
    </View>
  );
};

export default DAConfirm;
