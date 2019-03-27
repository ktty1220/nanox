/*eslint-env jest, es6*/
import Nanox from '../dist/nanox';

describe('dispatch', () => {
  let nanox = null;
  beforeEach(() => {
    nanox = new Nanox({});
  });

  test('before register => throw', () => {
    expect.assertions(1);
    expect(() => nanox.dispatch('foo'))
    .toThrow("event 'foo' is not registered");
  });

  test('after register => setState called', () => {
    expect.assertions(1);
    nanox.state = {
      title: 'foo',
      count: 0
    };
    const expected = {
      count: 10
    };
    nanox.setState = jest.fn();
    nanox.registerActions({
      foo(count) {
        return {
          count: count + 1
        };
      }
    });
    nanox.dispatch('foo', expected.count - 1);
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });
});
