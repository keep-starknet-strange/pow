import { useShareActionStore } from "@/app/stores/useShareActionStore";
import { StatusModal } from "@/app/components/StatusModal";
import React, { useEffect, useMemo } from "react";
import { Linking, Share, View } from "react-native";
import { PFPView } from "@/app/components/PFPView";
import {
  createNounsAttributes,
  getRandomNounsAttributes,
} from "@/app/configs/nouns";
import { useFocEngine } from "@/app/context/FocEngineConnector";

const GENERIC_SHARE_SHEET_ENABLED = false;

export const ShareActionModal = () => {
  const { user } = useFocEngine();
  const { visibleShareAction, dismissVisibleShareAction } =
    useShareActionStore();

  const nounsAttributes = useMemo(() => {
    if (!visibleShareAction) return null;

    if (user?.account.metadata) {
      return createNounsAttributes(
        parseInt(user.account.metadata[0], 16),
        parseInt(user.account.metadata[1], 16),
        parseInt(user.account.metadata[2], 16),
        parseInt(user.account.metadata[3], 16),
      );
    } else {
      return getRandomNounsAttributes(user?.account_address);
    }
  }, [visibleShareAction, user]);

  useEffect(() => {
    console.log("ShareActionModal", visibleShareAction);
  }, [visibleShareAction]);

  return (
    <StatusModal
      visible={visibleShareAction !== null}
      title={visibleShareAction?.title ?? ""}
      message={visibleShareAction?.message ?? ""}
      renderAvatar={
        nounsAttributes && (
          <View className="w-[80px] aspect-square">
            <PFPView attributes={nounsAttributes} />
          </View>
        )
      }
      isLoading={false}
      primaryLabel="Share on X"
      onPrimaryPress={() => {
        if (visibleShareAction) {
          Linking.openURL(visibleShareAction.xShareLink).then((_) => {
            dismissVisibleShareAction();
          });
        }
      }}
      secondaryLabel={
        GENERIC_SHARE_SHEET_ENABLED ? "Share on other..." : undefined
      }
      onSecondaryPress={() => {
        if (visibleShareAction) {
          try {
            Share.share({
              message: visibleShareAction.otherShareMessage,
            }).then((_) => {
              dismissVisibleShareAction();
            });
          } catch (error) {
            console.error(error);
            dismissVisibleShareAction();
          }
        }
      }}
      closeButtonVisible={true}
      onRequestClose={() => {
        dismissVisibleShareAction();
      }}
    />
  );
};
