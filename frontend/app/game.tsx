import "./global.css";

import { RootNavigator } from "./navigation/RootNavigator";
import { ObserversProvider } from "./components/providers/ObserversProvider";
import { StoreInitializer } from "./components/providers/StoreInitializer";

export default function game() {
  console.log("Game started");
  return (
    <ObserversProvider>
      <StoreInitializer />
      <RootNavigator />
    </ObserversProvider>
  );
}
