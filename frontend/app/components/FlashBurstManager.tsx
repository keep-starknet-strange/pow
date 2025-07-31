import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { FlashBurst } from "./FlashBurst";

interface FlashInstance {
  id: string;
  x: number;
  y: number;
  trigger: number;
  renderedBy?: string;
}

interface FlashBurstManagerProps {
  renderedBy?: string; // "miner", "sequencer", "da", "prover"
  onFlashRequested?: (callback: (x: number, y: number) => void) => void;
}

export const FlashBurstManager: React.FC<FlashBurstManagerProps> = ({
  renderedBy,
  onFlashRequested,
}) => {
  const [flashes, setFlashes] = useState<FlashInstance[]>([]);

  const triggerFlash = useCallback(
    (x: number, y: number) => {
      const newFlash: FlashInstance = {
        id: `flash-${Date.now()}-${Math.random()}`,
        x,
        y,
        trigger: Date.now(),
        renderedBy,
      };

      setFlashes((prev) => [...prev, newFlash]);
    },
    [renderedBy],
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
          onComplete={() => removeFlash(flash.id)}
        />
      ))}
    </View>
  );
};
