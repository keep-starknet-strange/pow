import { Observer, EventType } from "@/app/stores/useEventManager";
import { useSoundStore } from "@/app/stores/useSoundStore";

export class SoundObserver implements Observer {
  private blockFullAttempts: number = 0; // Counter for consecutive BlockFull attempts

  constructor() {
    // No dependencies needed - will access store directly
  }

  async onNotify(eventType: EventType, data?: any): Promise<void> {
    // Get fresh state and actions directly from store
    const { isSoundOn, playSoundEffect } = useSoundStore.getState();

    if (!isSoundOn) return; // Early exit if sound is disabled

    switch (eventType) {
      case "TxAdded": {
        const blockProgess = data?.progress || 0;
        const fee = data?.tx.fee || 0;
        const feeDigits = fee.toString().length;
        const feeScaler = Math.min(feeDigits / 7, 1);
        const pitchShift =
          Math.min(Math.max(blockProgess, 0.25), 1) * 0.375 +
          feeScaler * 0.375 +
          0.25;
        playSoundEffect(eventType, pitchShift);
        this.blockFullAttempts = 0; // Reset counter after a successful transaction
        break;
      }
      case "MineClicked": {
        if (!data.counter || !data.difficulty) {
          playSoundEffect(eventType);
          break;
        }
        const progress = data.counter / data.difficulty;
        const pitchShift =
          progress > 0.35 ? Math.min(progress, 0.75) + 0.25 : 0.25;
        playSoundEffect(eventType, pitchShift);
        break;
      }
      case "SequenceClicked": {
        if (!data.counter || !data.difficulty) {
          playSoundEffect(eventType);
          break;
        }
        const progress = data.counter / data.difficulty;
        const pitchShift =
          progress > 0.35 ? Math.min(progress, 0.75) + 0.25 : 0.25;
        playSoundEffect(eventType, pitchShift);
        break;
      }
      case "BlockFull": {
        // Increment consecutive block full attempts
        this.blockFullAttempts++;

        // Only show notification after 3 consecutive attempts
        if (this.blockFullAttempts >= 3) {
          playSoundEffect(eventType);
          this.blockFullAttempts = 0; // Reset counter after showing notification
        }
        break;
      }
      default: {
        playSoundEffect(eventType, data?.pitchShift);
        break;
      }
    }
  }
}
