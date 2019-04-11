/*eslint-env jest, es6*/
import Nanox from '../src/nanox.js';

class NanoxOnSetState extends Nanox {
  constructor(props) {
    props.actions = {
      increment() {
        return { count: this.state.count + 1 };
      }
    };

    super(props);
    this.state = {
      count: 0
    };
  }

  log(message, level) {}
}

class NanoxOnSetStateTrue extends NanoxOnSetState {
  onSetState(data, type) { return true; }
}

class NanoxOnSetStateFalse extends NanoxOnSetState {
  onSetState(data, type) { return false; }
}

class NanoxOnSetStateNull extends NanoxOnSetState {
  onSetState(data, type) { return null; }
}

class NanoxOnSetStateVoid extends NanoxOnSetState {
  onSetState(data, type) { }
}

class NanoxOnSetStateChangeState extends NanoxOnSetState {
  onSetState(data, type) {
    data.count = 100;
  }
}

describe('onSetState', () => {
  const expectSetStateMock = (nanox) => {
    expect.assertions(4);
    const expected = {
      count: 1
    };

    const calls = nanox.setState.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]).toHaveLength(2);
    expect(calls[0][0]).toEqual(expected);
    expect(typeof calls[0][1]).toEqual('function');
  };

  test('return true => setState is executed', () => {
    const nanox = new NanoxOnSetStateTrue({});
    nanox.setState = jest.fn();
    nanox.actions.increment();
    expectSetStateMock(nanox);
  });

  test('return false => setState is blocked', () => {
    expect.assertions(3);
    const nanox = new NanoxOnSetStateFalse({});
    const expected = {
      count: 0
    };

    const spyLog = jest.spyOn(console, 'warn');
    spyLog.mockImplementation((x) => x);

    nanox.setState = jest.fn();
    nanox.actions.increment();
    expect(nanox.setState.mock.calls).toHaveLength(0);
    expect(nanox.state).toEqual(expected);
    expect(console.warn).toBeCalledWith('setState() was blocked at onSetState()');
  });

  test('return null => setState is executed', () => {
    const nanox = new NanoxOnSetStateNull({});
    nanox.setState = jest.fn();
    nanox.actions.increment();
    expectSetStateMock(nanox);
  });

  test('return void => setState is executed', () => {
    const nanox = new NanoxOnSetStateVoid({});
    nanox.setState = jest.fn();
    nanox.actions.increment();
    expectSetStateMock(nanox);
  });

  test('change state => no effect on container', () => {
    const nanox = new NanoxOnSetStateChangeState({});
    nanox.setState = jest.fn();
    nanox.actions.increment();
    expectSetStateMock(nanox);
  });
});
