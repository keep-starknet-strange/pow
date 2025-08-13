import "./global.css";

import { RootNavigator } from "./navigation/RootNavigator";
import { ObserversInitializer } from "./components/initializers/ObserversInitializer";
import { StoreInitializer } from "./components/initializers/StoreInitializer";

export default function game() {
  return (
    <>
      <ObserversInitializer />
      <StoreInitializer />
      <RootNavigator />
    </>
  );
}
