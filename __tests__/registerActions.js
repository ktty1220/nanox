/*eslint-env jest, es6*/
import Nanox from '../src/nanox';

describe('registerActions', () => {
  let nanox = null;
  beforeEach(() => {
    nanox = new Nanox({});
  });

  test('before register => actions are empty', () => {
    expect.assertions(1);
    expect(nanox.emitter.eventNames()).toHaveLength(0);
  });

  test('after register => actions updated', () => {
    expect.assertions(2);
    const actions = {};
    const expected = [ '__error' ];
    [ ...Array(30).keys() ].forEach((n) => {
      const evt = `foo${n}`;
      actions[evt] = () => null;
      expected.push(evt);
    });
    nanox.registerActions(actions);
    expect(nanox.emitter.eventNames()).toEqual(expected);
    // eslint-disable-next-line no-underscore-dangle
    expect(nanox.emitter._maxListeners).toEqual(expected.length);
  });

  test('omit __error => use default __error action', () => {
    expect.assertions(1);
    const spyLog = jest.spyOn(console, 'error');
    spyLog.mockImplementation((x) => x);
    nanox.registerActions({
      foo() {
        return null;
      }
    });
    const message = 'lorem ipsum';
    nanox.emitter.emit('__error', new Error(message));
    expect(console.error).toBeCalledWith(message);
  });

  test('overwrite __error => overwrite default __error action', () => {
    expect.assertions(1);
    const spyLog = jest.spyOn(console, 'error');
    spyLog.mockImplementation((x) => x);
    nanox.registerActions({
      __error(err) {
        console.error(`[ERROR] ${err.message}`);
      }
    });
    const message = 'lorem ipsum';
    nanox.emitter.emit('__error', new Error(message));
    expect(console.error).toBeCalledWith(`[ERROR] ${message}`);
  });

  test('duplicate register => throw', () => {
    expect.assertions(1);
    nanox.registerActions({
      foo() {
        return null;
      }
    });
    expect(() => {
      nanox.registerActions({
        bar() {
          return null;
        }
      });
    })
    .toThrow('actions are already registered');
  });

  test('invalid __error action => throw', () => {
    expect.assertions(1);
    nanox.registerActions({
      foo(message) {
        throw new Error(message);
      },
      __error(err) {
        err.x();
      }
    });
    expect(() => nanox.dispatch('foo')).toThrow('err.x is not a function');
  });

  test('sandbox', (done) => {
    expect.assertions(3);
    nanox.state = {
      title: 'foo',
      count: 0
    };
    nanox.setState = jest.fn();
    /*eslint-disable no-invalid-this*/
    nanox.registerActions({
      foo() {
        this.dispatch('bar', 'baz');
        expect(Object.keys(this)).toEqual([ 'getState', 'dispatch', 'update' ]);
        expect(this.getState()).toEqual(nanox.state);
        expect(nanox.setState.mock.calls).toEqual([ [{ title: 'baz' }] ]);
        done();
      },
      bar(title) {
        return { title };
      }
    });
    nanox.dispatch('foo');
    /*eslint-enable no-invalied-this*/
  });
});
