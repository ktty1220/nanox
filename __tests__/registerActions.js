/*eslint-env jest, es6*/
/*eslint-disable no-underscore-dangle*/
import Nanox from '../cjs/nanox.js';

describe('registerActions', () => {
  let nanox = null;
  beforeEach(() => {
    nanox = new Nanox({ actions: {}});
    nanox.actions = null;
  });

  test('after register => actions updated', () => {
    expect.assertions(1);
    const actions = {};
    const expected = [];
    [ ...Array(30).keys() ].forEach((n) => {
      const evt = `foo${n}`;
      actions[evt] = () => null;
      expected.push(evt);
    });
    nanox.registerActions(actions);
    expect(Object.keys(nanox.actions)).toEqual(expected);
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

  test('sandbox', () => {
    expect.assertions(6);
    nanox.state = {
      title: 'foo',
      count: 0
    };
    nanox.setState = jest.fn();
    nanox.registerActions({
      foo(title) {
        /*eslint-disable no-invalid-this*/
        expect(Object.keys(this)).toEqual([ 'state', 'query' ]);
        expect(this.state).toEqual(nanox.state);
        /*eslint-enable no-invalied-this*/
        return { title };
      }
    });
    nanox.actions.foo('bar');
    const calls = nanox.setState.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]).toHaveLength(2);
    expect(calls[0][0]).toEqual({ title: 'bar' });
    expect(typeof calls[0][1]).toEqual('function');
  });
});
