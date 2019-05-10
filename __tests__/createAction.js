/*eslint-env jest, es6*/
/*eslint-disable no-underscore-dangle, no-invalid-this*/
import Nanox from '../src/nanox.js';

describe('createAction', () => {
  let nanox = null;

  beforeEach(() => {
    nanox = new Nanox({
      actions: {}
    });
    nanox.state = {
      title: 'foo',
      count: 0,
      fruits: [ 'apple', 'banana' ]
    };
    nanox.setState = jest.fn().mockImplementation((state, callback) => {
      callback();
    });
  });

  const expectSetStateMock = (nanox, expected, isQuery) => {
    expect.assertions(4 + ((isQuery) ? 1 : 0));
    const calls = nanox.setState.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]).toHaveLength(2);
    let actual = calls[0][0];
    if (isQuery) {
      expect(typeof actual).toEqual('function');
      actual = actual(nanox.state);
    }
    expect(actual).toEqual(expected);
    expect(typeof calls[0][1]).toEqual('function');
  };

  test('object => setState called', () => {
    const expected = {
      count: 6
    };
    nanox.createAction((x, y, z) => ({
      count: x + y + z
    }))(1, 2, 3);
    expectSetStateMock(nanox, expected);
  });

  test('not object => action rejected', () => {
    expect.assertions(2);
    const expected = 'invalid action result: 6 is number';
    const action = nanox.createAction((x, y, z) => x + y + z);
    expect(action(1, 2, 3)).rejects.toEqual(new Error(expected));
    expect(nanox.setState.mock.calls).toHaveLength(0);
  });

  test('no return => noop', () => {
    expect.assertions(1);
    nanox.createAction((x, y, z) => {})(1, 2, 3);
    expect(nanox.setState.mock.calls).toHaveLength(0);
  });

  test('promise(object) => setState called', (done) => {
    const expected = {
      count: 6
    };
    nanox.createAction((x, y, z) => (
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            count: x + y + z
          });
        }, 10);
      })
    ))(1, 2, 3)
    .then(() => {
      expectSetStateMock(nanox, expected);
      done();
    });
  });

  test('query => setState called', () => {
    const expected = {
      title: 'bar',
      count: 0,
      fruits: [ 'apple', 'banana', 'cherry', 'lemon' ]
    };
    nanox.createAction(function (t) {
      return this.query({
        title: { $set: t },
        fruits: {
          $push: [ 'cherry', 'lemon' ]
        }
      });
    })('bar');
    expectSetStateMock(nanox, expected, true);
  });

  test('promise(query) => setState called', (done) => {
    const expected = {
      title: 'foo',
      count: 3,
      fruits: [ 'banana' ]
    };
    nanox.createAction(function (c) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(this.query({
            count: { $set: c },
            fruits: {
              $splice: [
                [ 0, 1 ]
              ]
            }
          }));
        }, 10);
      });
    })(3)
    .then(() => {
      expectSetStateMock(nanox, expected, true);
      done();
    });
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
