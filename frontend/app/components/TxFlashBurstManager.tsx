import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { TxFlashBurst } from "./TxFlashBurst";

interface TxFlashInstance {
  id: string;
  x: number;
  y: number;
  trigger: number;
  chainId: number;
  txId: number;
  isDapp: boolean;
}

interface TxFlashBurstManagerProps {
  chainId: number;
  txId: number;
  isDapp: boolean;
  onFlashRequested?: (callback: (x: number, y: number) => void) => void;
}

export const TxFlashBurstManager: React.FC<TxFlashBurstManagerProps> = ({
  chainId,
  txId,
  isDapp,
  onFlashRequested,
}) => {
  const [flashes, setFlashes] = useState<TxFlashInstance[]>([]);

  const triggerFlash = useCallback(
    (x: number, y: number) => {
      const newFlash: TxFlashInstance = {
        id: `tx-flash-${Date.now()}-${Math.random()}`,
        x,
        y,
        trigger: Date.now(),
        chainId,
        txId,
        isDapp,
      };

      setFlashes((prev) => [...prev, newFlash]);
    },
    [chainId, txId, isDapp],
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
        <TxFlashBurst
          key={flash.id}
          x={flash.x}
          y={flash.y}
          trigger={flash.trigger}
          chainId={flash.chainId}
          txId={flash.txId}
          isDapp={flash.isDapp}
          onComplete={() => removeFlash(flash.id)}
        />
      ))}
    </View>
  );
};
