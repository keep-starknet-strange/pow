import { create } from "zustand";
import shareActions from "@/app/configs/shareActions.json";

export type ShareAction = {
  id: number;
  title: string;
  message: string;
  share: {
    x: string;
    other: string;
  };
};

export type SanitizedShareAction = {
  title: string;
  message: string;
  xShareLink: string;
  otherShareMessage: string;
};

interface ShareActionState {
  visibleShareAction: SanitizedShareAction | null;

  setVisibleShareAction: (actionId: number, data?: any) => void;
  dismissVisibleShareAction: () => void;
}

export const useShareActionStore = create<ShareActionState>((set) => ({
  visibleShareAction: null,

  setVisibleShareAction: (actionId: number, data?: any) => {
    const action = shareActions.find((a) => a.id === actionId);
    if (!action) return;

    switch (action.id) {
      case 1: {
        const prestigeLevel: number = data?.prestigeLevel ?? 1;
        const message = action.message.replace("{}", prestigeLevel.toString());
        const xShareMessage = encodeURI(
          action.share.x.replace("{}", prestigeLevel.toString()),
        );
        const otherShareMessage = action.share.other.replace(
          "{}",
          prestigeLevel.toString(),
        );
        set({
          visibleShareAction: {
            title: action.title,
            message: message,
            xShareLink: `https://twitter.com/intent/tweet?text=${xShareMessage}&via=POW_sn`,
            otherShareMessage: otherShareMessage,
          },
        });
        break;
      }
      default: {
        set({
          visibleShareAction: {
            title: action.title,
            message: action.message,
            xShareLink: `https://twitter.com/intent/tweet?text=${encodeURI(action.share.x)}&via=POW_sn`,
            otherShareMessage: action.share.other,
          },
        });
        break;
      }
    }
  },

  dismissVisibleShareAction: () => {
    set({ visibleShareAction: null });
  },
}));
