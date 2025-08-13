import React, { memo } from "react";
import { useObserversSetup } from "@/app/hooks/useObserversSetup";

export const ObserversProvider = memo(
  ({ children }: { children: React.ReactNode }) => {
    console.log("ObserversProvider rendered");
    useObserversSetup();

    return <>{children}</>;
  },
);

ObserversProvider.displayName = "ObserversProvider";
