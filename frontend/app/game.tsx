import "./global.css";

import React, { useEffect, useState } from "react";
import { RootNavigator } from "./navigation/RootNavigator";
import { ObserversInitializer } from "./components/initializers/ObserversInitializer";
import { StoreInitializer } from "./components/initializers/StoreInitializer";
import { useRemoteConfig } from "./stores/useRemoteConfigStore";
import { UpdateModal } from "./components/UpdateModal";

export default function game() {
  const {
    newsMessage,
    optionalLink,
    shouldShowNews,
    dismissNews,
    loadDismissedNewsHash,
  } = useRemoteConfig();
  const [showNewsModal, setShowNewsModal] = useState(false);

  // Load dismissed news hash on mount
  useEffect(() => {
    loadDismissedNewsHash();
  }, [loadDismissedNewsHash]);

  // Check if we should show news when newsMessage changes
  useEffect(() => {
    if (newsMessage && shouldShowNews()) {
      setShowNewsModal(true);
    }
  }, [newsMessage, shouldShowNews]);

  const handleDismissNews = () => {
    setShowNewsModal(false);
    dismissNews();
  };

  return (
    <>
      <ObserversInitializer />
      <StoreInitializer />
      <RootNavigator />
      <UpdateModal
        visible={showNewsModal}
        mode="news"
        title="What's New"
        message={newsMessage || ""}
        optionalLink={optionalLink || undefined}
        onDismiss={handleDismissNews}
      />
    </>
  );
}
