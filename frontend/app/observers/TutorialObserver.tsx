import { Observer, EventType } from '../context/EventManager';

export class TutorialObserver implements Observer {
  constructor(private advanceStep: () => void) {}

  onNotify(eventName: EventType, data?: any): void {
    if (eventName === 'MineDone') {
      console.log("I did it!");
      this.advanceStep();
    }
    // once a transaction is added to the block, mark tutorial complete
    else if (eventName === 'TxAdded') {
      this.advanceStep();
    }
    // do extra stuff here
  }
}
