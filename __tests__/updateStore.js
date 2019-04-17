/*eslint-env jest, es6*/
import Nanox from '../src/nanox.js';

describe('updateStore', () => {
  let nanox = null;
  beforeEach(() => {
    nanox = new Nanox({
      actions: {}
    });
    nanox.state = {
      title: 'foo',
      count: 0
    };
    nanox.setState = jest.fn().mockImplementation((state, callback) => {
      callback();
    });
  });

  const expectSetStateMock = (nanox, expected) => {
    expect.assertions(4);
    const calls = nanox.setState.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]).toHaveLength(2);
    expect(calls[0][0]).toEqual(expected);
    expect(typeof calls[0][1]).toEqual('function');
  };

  test('null => noop', (done) => {
    expect.assertions(1);
    nanox.updateStore(null, () => {
      expect(nanox.setState.mock.calls).toHaveLength(0);
      done();
    }, (err) => {
      throw err;
    });
  });

  test('promise(empty) => noop', (done) => {
    expect.assertions(1);
    const p = Promise.resolve();
    nanox.updateStore(p, () => {
      expect(nanox.setState.mock.calls).toHaveLength(0);
      done();
    }, (err) => {
      throw err;
    });
  });

  const invalidParams = {
    array: [ 1, 2, 3 ],
    string: 'hoge',
    number: 100,
    boolean: true
  };
  Object.keys(invalidParams).forEach((p) => {
    const val = invalidParams[p];
    const expected = `invalid action result: ${val} is ${p}`;

    test(`${p} => reject called`, (done) => {
      expect.assertions(2);
      nanox.updateStore(val, () => {
        throw new Error('resolve called');
      }, (err) => {
        expect(err.message).toEqual(expected);
        expect(nanox.setState.mock.calls).toHaveLength(0);
        done();
      });
    });

    test(`Promise(${p}) => reject called`, (done) => {
      expect.assertions(2);
      nanox.updateStore(Promise.resolve(val), () => {
        throw new Error('resolve called');
      }, (err) => {
        expect(err.message).toEqual(expected);
        expect(nanox.setState.mock.calls).toHaveLength(0);
        done();
      });
    });
  });

  test('object => resolve & setState called', (done) => {
    const expected = {
      count: 1
    };
    nanox.updateStore(expected, () => {
      expectSetStateMock(nanox, expected);
      done();
    }, (err) => {
      throw err;
    });
  });

  test('promise(object) => resolve & setState called', (done) => {
    const expected = {
      count: 2
    };
    const p = Promise.resolve(expected);
    nanox.updateStore(p, () => {
      expectSetStateMock(nanox, expected);
      done();
    }, (err) => {
      throw err;
    });
  });

  test('promise(throw) => reject called', (done) => {
    expect.assertions(2);
    const expected = 'lorem ipsum';
    const p = new Promise(() => {
      throw new Error(expected);
    });
    nanox.updateStore(p, () => {
      throw new Error('resolve called');
    }, (err) => {
      expect(err.message).toEqual(expected);
      expect(nanox.setState.mock.calls).toHaveLength(0);
      done();
    });
  });

  test('blocked by onSetState', (done) => {
    expect.assertions(3);
    const spyLog = jest.spyOn(console, 'warn');
    spyLog.mockImplementation((x) => x);
    const expected = Object.assign({}, nanox.state);
    nanox.onSetState = () => false;
    nanox.updateStore({ count: 5 }, () => {
      expect(nanox.setState.mock.calls).toHaveLength(0);
      expect(nanox.state).toEqual(expected);
      expect(console.warn).toBeCalledWith('setState() was blocked at onSetState()');
      done();
    }, (err) => {
      throw err;
    });
  });
});
