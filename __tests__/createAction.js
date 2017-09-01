/*eslint-env jest, es6*/
import Nanox from '../lib/nanox';

describe('createAction', () => {
  let nanox = null;
  beforeEach(() => {
    nanox = new Nanox({});
    nanox.state = {
      title: 'foo',
      count: 0
    };
    nanox.setState = jest.fn();
    nanox.dispatch = jest.fn();
  });

  test('object => setState called', () => {
    expect.assertions(1);
    const expected = {
      count: 6
    };
    nanox.createAction((x, y, z) => {
      return {
        count: x + y + z
      };
    })(1, 2, 3);
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });

  test('throw => __error action called', () => {
    expect.assertions(4);
    const expected = 'lorem ipsum';
    nanox.createAction((x, y, z) => {
      throw new Error(expected);
    })(1, 2, 3);
    expect(nanox.setState.mock.calls).toHaveLength(0);
    expect(nanox.dispatch.mock.calls[0][0]).toBe('__error');
    expect(nanox.dispatch.mock.calls[0][1]).toBeInstanceOf(Error);
    expect(nanox.dispatch.mock.calls[0][1].message).toBe(expected);
  });
});
