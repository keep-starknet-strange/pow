import "react-native-get-random-values";
import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import { FingerprintJsProProvider } from "@fingerprintjs/fingerprintjs-pro-react-native";
import { StarknetConnectorProvider } from "./context/StarknetConnector";
import { FocEngineProvider } from "./context/FocEngineConnector";
import { PowContractProvider } from "./context/PowContractConnector";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { FINGERPRINT_CONFIG } from "./configs/fingerprint";
import Game from "./game";
import { useRemoteConfig } from "./stores/useRemoteConfigStore";
import { useVersionCheck } from "./hooks/useVersionCheck";
import { UpdateModal } from "./components/UpdateModal";

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  const { minVersion, fetchConfig } = useRemoteConfig();
  const { needsUpdate, currentVersion } = useVersionCheck(minVersion);

  useImagePreloader();

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        Xerxes: require("../assets/fonts/Xerxes-10.ttf"),
        Pixels: require("../assets/fonts/04B_03_.ttf"),
        Teatime: require("../assets/fonts/Teatime7.ttf"),
      });
      setFontLoaded(true);
    }
    loadFont();
  }, []);

  // Fetch remote config on app start
  useEffect(() => {
    if (fontLoaded) {
      fetchConfig();
    }
  }, [fontLoaded, fetchConfig]);

  if (!fontLoaded) {
    return null; // or a loading screen
  }

  return (
    <>
      <FingerprintJsProProvider
        apiKey={FINGERPRINT_CONFIG.apiKey}
        region={FINGERPRINT_CONFIG.region}
      >
        <StarknetConnectorProvider>
          <FocEngineProvider>
            <PowContractProvider>
              <Game />
            </PowContractProvider>
          </FocEngineProvider>
        </StarknetConnectorProvider>
      </FingerprintJsProProvider>

      <UpdateModal
        visible={needsUpdate}
        mode="force-update"
        title="Update Required"
        message={`Please update to the latest version (${minVersion || "latest"}) to continue. Your current version is ${currentVersion}.`}
      />
    </>
  );
}
