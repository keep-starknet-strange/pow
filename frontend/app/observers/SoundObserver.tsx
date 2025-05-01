import { Observer, EventType } from "../context/EventManager";

export class SoundObserver implements Observer {
  private playSound: (soundType: string, pitchShift?: number) => Promise<void>;

  constructor(playSoundEffect: (soundType: string, pitchShift?: number) => Promise<void>) {
    this.playSound = playSoundEffect;
  }

  onNotify(eventType: EventType, data?: any): void {
    switch (eventType) {
      case "TxAdded": {
        const pitchShift = data?.tx.fee ? (data.tx.fee / 8) + 1 : 0;
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
