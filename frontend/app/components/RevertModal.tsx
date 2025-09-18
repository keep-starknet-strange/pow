import React, { memo, useEffect, useMemo, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { StatusModal } from "./StatusModal";
import { useOnchainActions } from "../stores/useOnchainActions";

const RevertModalComponent: React.FC = () => {
  const { isReverting, revertCounter } = useOnchainActions();
  const [shouldShow, setShouldShow] = useState(isReverting);
  const [canDismiss, setCanDismiss] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (isReverting) {
      setShouldShow(true);
      setCanDismiss(false);
      // Check network connectivity when reverting starts
      NetInfo.fetch().then((state) => {
        setIsConnected(state.isConnected ?? true);
      });

      // Subscribe to network changes while reverting
      const unsubscribe = NetInfo.addEventListener((state) => {
        setIsConnected(state.isConnected ?? true);
      });

      return () => unsubscribe();
    } else {
      // Allow dismissing the modal after reverting is done
      setTimeout(() => setCanDismiss(true), 5000);
    }
  }, [isReverting]);

  if (!shouldShow) return null;

  const title = useMemo(() => {
    return isConnected ? "Reversion Attack!" : "Connection Lost!";
  }, [isConnected]);

  const message = useMemo(() => {
    return isConnected
      ? revertCounter >= 3
        ? "Multiple failures detected! There may be network issues. Please try restarting the app or coming back later."
        : "A mysterious spammer has infiltrated your blockchain! They're causing chaos and forced a rollback of recent transactions."
      : "Your node went offline! POW! requires an internet connection for the fully onchain experience. Continuing in offline mode wont save progress!";
  }, [isConnected, revertCounter]);

  return (
    <StatusModal
      visible={shouldShow}
      title={title}
      message={message}
      avatarSeed={"revert-default"}
      isLoading={!canDismiss}
      primaryLabel={canDismiss ? "Okay" : undefined}
      onPrimaryPress={canDismiss ? () => setShouldShow(false) : undefined}
    />
  );
};

export const RevertModal = memo(RevertModalComponent);
