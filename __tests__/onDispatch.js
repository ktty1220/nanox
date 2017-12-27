/*eslint-env jest, es6*/
import Nanox from '../lib/nanox';

class NanoxOnDispatch extends Nanox {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };

    this.registerActions({
      increment() {
        return { count: this.getState().count + 1 };
      }
    });
  }

  log(message) {}
}

class NanoxOnDispatchTrue extends NanoxOnDispatch {
  onDispatch(action, ...args) { return true; }
}

class NanoxOnDispatchFalse extends NanoxOnDispatch {
  onDispatch(action, ...args) { return false; }
}

class NanoxOnDispatchNull extends NanoxOnDispatch {
  onDispatch(action, ...args) { return null; }
}

class NanoxOnDispatchVoid extends NanoxOnDispatch {
  onDispatch(action, ...args) { }
}

describe('dispatch', () => {
  test('return true => action is executed', () => {
    expect.assertions(1);
    const nanox = new NanoxOnDispatchTrue({});
    const expected = {
      count: 1
    };
    nanox.setState = jest.fn();
    nanox.dispatch('increment');
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });

  test('return false => action is blocked', () => {
    expect.assertions(2);
    const nanox = new NanoxOnDispatchFalse({});
    const expected = {
      count: 0
    };
    nanox.setState = jest.fn();
    nanox.dispatch('increment');
    expect(nanox.setState.mock.calls).toHaveLength(0);
    expect(nanox.state).toEqual(expected);
  });

  test('return null => action is executed', () => {
    expect.assertions(1);
    const nanox = new NanoxOnDispatchNull({});
    const expected = {
      count: 1
    };
    nanox.setState = jest.fn();
    nanox.dispatch('increment');
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });

  test('return void => action is executed', () => {
    expect.assertions(1);
    const nanox = new NanoxOnDispatchVoid({});
    const expected = {
      count: 1
    };
    nanox.setState = jest.fn();
    nanox.dispatch('increment');
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });
});
