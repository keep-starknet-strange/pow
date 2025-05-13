import { Observer, EventType } from '../context/EventManager';

export class TutorialObserver implements Observer {
  constructor(private advanceStep: () => void, private setVisible: (visible: boolean) => void) {}

  onNotify(eventName: EventType, data?: any): void {
    if (eventName == 'MineClicked') {
      this.setVisible(false);
    }
    if (eventName === 'MineDone') {
      this.advanceStep();
    }
    // once a transaction is added to the block, mark tutorial complete
    if (eventName === 'TxAdded') {
      // this.advanceStep();
    }
    // do extra stuff here
  }
}
