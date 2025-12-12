import "./global.css";

import { RootNavigator } from "./navigation/RootNavigator";
import { ObserversInitializer } from "./components/initializers/ObserversInitializer";
import { StoreInitializer } from "./components/initializers/StoreInitializer";
import { AuthInitializer } from "./components/initializers/AuthInitializer";

export default function game() {
  return (
    <>
      <AuthInitializer />
      <ObserversInitializer />
      <StoreInitializer />
      <RootNavigator />
    </>
  );
}
