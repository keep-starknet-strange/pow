import { Observer, EventType } from "@/app/stores/useEventManager";

export class SoundObserver implements Observer {
  private playSound: (soundType: string, pitchShift?: number) => Promise<void>;

  constructor(
    playSoundEffect: (soundType: string, pitchShift?: number) => Promise<void>,
  ) {
    this.playSound = playSoundEffect;
  }

  async onNotify(eventType: EventType, data?: any): Promise<void> {
    switch (eventType) {
      case "TxAdded": {
        const blockProgess = data?.progress || 0;
        const fee = data?.tx.fee || 0;
        const feeDigits = fee.toString().length;
        const feeScaler = Math.min(feeDigits / 7, 1);
        const pitchShift = Math.min(Math.max(blockProgess, 0.25), 1) * 0.375 + feeScaler * 0.375 + 0.25;
        this.playSound(eventType, pitchShift);
        break;
      }
      case "MineClicked": {
        if (!data.counter || !data.difficulty) {
          this.playSound(eventType);
          break;
        }
        const progress = data.counter / data.difficulty;
        const pitchShift = progress > 0.35 ? Math.min(progress, 0.75) + 0.25 : 0.25;
        this.playSound(eventType, pitchShift);
        break;
      }
      case "SequenceClicked": {
        if (!data.counter || !data.difficulty) {
          this.playSound(eventType);
          break;
        }
        const progress = data.counter / data.difficulty;
        const pitchShift = progress > 0.35 ? Math.min(progress, 0.75) + 0.25 : 0.25;
        this.playSound(eventType, pitchShift);
        break;
      }
      default: {
        this.playSound(eventType, data?.pitchShift);
        break;
      }
    }
  }
}
