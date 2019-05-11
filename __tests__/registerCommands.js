/*eslint-env jest, es6*/
/*eslint-disable no-underscore-dangle, no-invalid-this*/
import Nanox from '../cjs/nanox.js';

describe('registerCommands', () => {
  let nanox = null;
  beforeEach(() => {
    nanox = new Nanox({ actions: {}});
    nanox.actions = null;
    nanox.state = {
      count: 1
    };
    nanox.setState = jest.fn().mockImplementation((state, callback) => {
      callback();
    });
  });

  test('after register => custom commands become available', () => {
    expect.assertions(6);
    const commands = {
      $increment: (value, target) => (target || 0) + value
    };
    nanox.registerCommands(commands);
    expect(typeof nanox.updateContext.commands.$increment).toEqual('function');

    const expected = {
      count: 3
    };
    nanox.createAction(function () {
      return this.query({
        count: { $increment: 2 }
      });
    })();

    const calls = nanox.setState.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]).toHaveLength(2);
    expect(typeof calls[0][0]).toEqual('function');
    expect(calls[0][0](nanox.state)).toEqual(expected);
    expect(typeof calls[0][1]).toEqual('function');
  });
});
