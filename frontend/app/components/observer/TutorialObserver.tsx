import { Observer, EventType } from '../../context/EventManager';

export class TutorialObserver implements Observer {
  constructor(private advanceStep: () => void) {}

  onNotify(eventName: EventType, data?: any): void {

    // do extra stuff here
  }

  notify(event: Event) {
    // when the first block is mined, move to "transactions" step
    if (event.type === 'BlockMined') {
      this.advanceStep();
    }
    // once a transaction is added to the block, mark tutorial complete
    else if (event.type === 'TransactionAdded') {
      this.advanceStep();
    }
  }
}
