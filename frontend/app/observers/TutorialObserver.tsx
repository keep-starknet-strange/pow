import { Observer, EventType } from '../context/EventManager';

export class TutorialObserver implements Observer {
  constructor(private advanceStep: () => void, private setVisible: (visible: boolean) => void) {}

  onNotify(eventName: EventType, data?: any): void {
    if (eventName == 'MineClicked') {
      console.log("I clicked!");
      this.setVisible(false);
    }
    if (eventName === 'MineDone') {
      console.log("I did it!");
      this.advanceStep();
    }
    // once a transaction is added to the block, mark tutorial complete
    if (eventName === 'TxAdded') {
      console.log("I added a transaction!");
      // this.advanceStep();
    }
    // do extra stuff here
  }
}
