import {makeObservable} from 'mobx';

class Counter {
  count = 0;

  constructor() {
    makeObservable(this, {});
  }
}
