import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { FlashBurst } from "./FlashBurst";

interface FlashInstance {
  id: string;
  x: number;
  y: number;
  trigger: number;
  renderedBy?: string;
  specialText?: string;
  specialTextColor?: string;
}

interface FlashBurstManagerProps {
  renderedBy?: string; // "miner", "sequencer", "da", "prover"
  onFlashRequested?: (
    callback: (
      x: number,
      y: number,
      specialText?: string,
      specialTextColor?: string,
    ) => void,
  ) => void;
  specialText?: string;
  specialTextColor?: string;
}

export const FlashBurstManager: React.FC<FlashBurstManagerProps> = ({
  renderedBy,
  onFlashRequested,
  specialText,
  specialTextColor,
}) => {
  const [flashes, setFlashes] = useState<FlashInstance[]>([]);

  const triggerFlash = useCallback(
    (
      x: number,
      y: number,
      flashSpecialText?: string,
      flashSpecialTextColor?: string,
    ) => {
      const newFlash: FlashInstance = {
        id: `flash-${Date.now()}-${Math.random()}`,
        x,
        y,
        trigger: Date.now(),
        renderedBy,
        specialText: flashSpecialText || specialText,
        specialTextColor: flashSpecialTextColor || specialTextColor,
      };

      setFlashes((prev) => [...prev, newFlash]);
    },
    [renderedBy, specialText, specialTextColor],
  );

  const removeFlash = useCallback((id: string) => {
    setFlashes((prev) => prev.filter((flash) => flash.id !== id));
  }, []);

  // Expose the triggerFlash function to parent
  React.useEffect(() => {
    onFlashRequested?.(triggerFlash);
  }, [onFlashRequested, triggerFlash]);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
      }}
    >
      {flashes.map((flash) => (
        <FlashBurst
          key={flash.id}
          x={flash.x}
          y={flash.y}
          trigger={flash.trigger}
          renderedBy={flash.renderedBy}
          specialText={flash.specialText}
          specialTextColor={flash.specialTextColor}
          onComplete={() => removeFlash(flash.id)}
        />
      ))}
    </View>
  );
};
