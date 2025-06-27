import "./global.css";

import { useState, useEffect } from "react";

import { RootNavigator } from "./navigation/RootNavigator";

import { useEventManager } from "./context/EventManager";
import { usePowContractConnector } from "./context/PowContractConnector";
import { useGame } from "./context/Game";
import { useInAppNotifications } from "./context/InAppNotifications";
import { useAchievement } from "./context/Achievements";
import { useSound } from "./context/Sound";
import { InAppNotificationsObserver } from "./observers/InAppNotificationsObserver";
import { AchievementObserver } from "./observers/AchievementObserver";
import { SoundObserver } from "./observers/SoundObserver";
import { TxBuilderObserver } from "./observers/TxBuilderObserver";

export default function game() {
  const { registerObserver, unregisterObserver } = useEventManager();

  const { sendInAppNotification } = useInAppNotifications();
  const [inAppNotificationObserver, setInAppNotificationObserver] = useState<
    null | number
  >(null);
  useEffect(() => {
    if (inAppNotificationObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(inAppNotificationObserver);
    }
    setInAppNotificationObserver(
      registerObserver(new InAppNotificationsObserver(sendInAppNotification)),
    );
  }, [sendInAppNotification]);

  const { updateAchievement } = useAchievement();
  const [achievementObserver, setAchievementObserver] = useState<null | number>(
    null,
  );
  useEffect(() => {
    if (achievementObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(achievementObserver);
    }
    setAchievementObserver(
      registerObserver(new AchievementObserver(updateAchievement)),
    );
  }, [updateAchievement]);

  const { getWorkingBlock } = useGame();
  const { addAction } = usePowContractConnector();
  const [txBuilderObserver, setTxBuilderObserver] = useState<null | number>(
    null,
  );
  useEffect(() => {
    if (txBuilderObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(txBuilderObserver);
    }
    setTxBuilderObserver(
      registerObserver(new TxBuilderObserver(addAction, getWorkingBlock)),
    );
  }, [addAction, getWorkingBlock]);

  const { playSoundEffect } = useSound();
  const [soundObserver, setSoundObserver] = useState<null | number>(null);
  useEffect(() => {
    if (soundObserver !== null) {
      // Unregister the previous observer if it exists
      unregisterObserver(soundObserver);
    }
    setSoundObserver(registerObserver(new SoundObserver(playSoundEffect)));
  }, [playSoundEffect]);

  return <RootNavigator />;
}
