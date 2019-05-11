/*eslint-env jest, es6*/
import Nanox from '../cjs/nanox.js';

describe('obsolete', () => {
  const message = '*** Nanox version 0.2.0 has many breaking changes from version 0.1.x\n*** see https://github.com/ktty1220/nanox\n';

  test('no actions props => throw with obsolete message', () => {
    expect.assertions(1);
    expect(() => new Nanox({}))
    .toThrow(`requires the action props\n${message}`);
  });

  test('dispatch => throw with obsolete message', () => {
    expect.assertions(1);
    const nanox = new Nanox({
      actions: {
        foo: () => {}
      }
    });
    expect(() => nanox.dispatch('foo')).toThrow(message);
  });
});
