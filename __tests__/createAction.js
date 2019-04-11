/*eslint-env jest, es6*/
/*eslint-disable no-underscore-dangle*/
import Nanox from '../src/nanox.js';

describe('createAction', () => {
  let nanox = null;

  beforeEach(() => {
    nanox = new Nanox({
      actions: {}
    });
    nanox.state = {
      title: 'foo',
      count: 0
    };
    nanox.setState = jest.fn();
  });

  test('object => setState called', () => {
    expect.assertions(4);
    const expected = {
      count: 6
    };
    nanox.createAction((x, y, z) => {
      return {
        count: x + y + z
      };
    })(1, 2, 3);
    const calls = nanox.setState.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]).toHaveLength(2);
    expect(calls[0][0]).toEqual(expected);
    expect(typeof calls[0][1]).toEqual('function');
  });

  test('throw in action => action rejected', () => {
    expect.assertions(2);
    const expected = 'lorem ipsum';
    const action = nanox.createAction((x, y, z) => {
      throw new Error(expected);
    });
    expect(action(1, 2, 3)).rejects.toEqual(new Error(expected));
    expect(nanox.setState.mock.calls).toHaveLength(0);
  });

  test('throw in action (Promise) => action rejected', () => {
    expect.assertions(2);
    const expected = 'lorem ipsum';
    const action = nanox.createAction((x, y, z) => (
      new Promise((resolve, reject) => {
        throw new Error(expected);
      })
    ));
    expect(action(1, 2, 3)).rejects.toEqual(new Error(expected));
    expect(nanox.setState.mock.calls).toHaveLength(0);
  });
});
