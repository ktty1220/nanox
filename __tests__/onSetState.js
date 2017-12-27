/*eslint-env jest, es6*/
import Nanox from '../lib/nanox';

class NanoxOnSetState extends Nanox {
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

  log(message, level) {}
}

class NanoxOnSetStateTrue extends NanoxOnSetState {
  onSetState(state) { return true; }
}

class NanoxOnSetStateFalse extends NanoxOnSetState {
  onSetState(state) { return false; }
}

class NanoxOnSetStateNull extends NanoxOnSetState {
  onSetState(state) { return null; }
}

class NanoxOnSetStateVoid extends NanoxOnSetState {
  onSetState(state) { }
}

describe('dispatch', () => {
  test('return true => setState() is executed', () => {
    expect.assertions(1);
    const nanox = new NanoxOnSetStateTrue({});
    const expected = {
      count: 1
    };
    nanox.setState = jest.fn();
    nanox.dispatch('increment');
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });

  test('return false => setState() is blocked', () => {
    expect.assertions(2);
    const nanox = new NanoxOnSetStateFalse({});
    const expected = {
      count: 0
    };
    nanox.setState = jest.fn();
    nanox.dispatch('increment');
    expect(nanox.setState.mock.calls).toHaveLength(0);
    expect(nanox.state).toEqual(expected);
  });

  test('return null => setState() is executed', () => {
    expect.assertions(1);
    const nanox = new NanoxOnSetStateNull({});
    const expected = {
      count: 1
    };
    nanox.setState = jest.fn();
    nanox.dispatch('increment');
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });

  test('return void => setState() is executed', () => {
    expect.assertions(1);
    const nanox = new NanoxOnSetStateVoid({});
    const expected = {
      count: 1
    };
    nanox.setState = jest.fn();
    nanox.dispatch('increment');
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });
});
