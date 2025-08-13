import "./global.css";

import { RootNavigator } from "./navigation/RootNavigator";
import { ObserversInitializer } from "./components/initializers/ObserversInitializer";
import { StoreInitializer } from "./components/initializers/StoreInitializer";

export default function game() {
  console.log("Game started");
  return (
    <>
      <ObserversInitializer />
      <StoreInitializer />
      <RootNavigator />
    </>
  );
}
