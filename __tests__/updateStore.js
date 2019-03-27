/*eslint-env jest, es6*/
import Nanox from '../src/nanox';

describe('updateStore', () => {
  let nanox = null;
  beforeEach(() => {
    nanox = new Nanox({});
    nanox.state = {
      title: 'foo',
      count: 0
    };
    nanox.setState = jest.fn();
  });

  test('null => noop', () => {
    expect.assertions(1);
    nanox.updateStore();
    expect(nanox.setState.mock.calls).toHaveLength(0);
  });

  test('promise(null) => noop', () => {
    expect.assertions(1);
    const p = Promise.resolve();
    nanox.updateStore(p);
    p.then((result) => {
      expect(nanox.setState.mock.calls).toHaveLength(0);
    });
    return p;
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

    test(`${p} => __error handler called`, (done) => {
      expect.assertions(2);
      nanox.registerActions({
        __error: (err) => {
          expect(err.message).toEqual(expected);
          expect(nanox.setState.mock.calls).toHaveLength(0);
          done();
        }
      });
      nanox.updateStore(val);
    });

    test(`Promise(${p}) => __error handler called`, (done) => {
      expect.assertions(2);
      nanox.registerActions({
        __error: (err) => {
          expect(err.message).toEqual(expected);
          expect(nanox.setState.mock.calls).toHaveLength(0);
          done();
        }
      });
      nanox.updateStore(Promise.resolve(val));
    });
  });

  test('object => setState called', () => {
    expect.assertions(1);
    const expected = {
      count: 1
    };
    nanox.updateStore(expected);
    expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
  });

  test('promise(object) => setState called', () => {
    expect.assertions(1);
    const expected = {
      count: 1
    };
    const p = Promise.resolve(expected);
    nanox.updateStore(p);
    p.then((result) => {
      expect(nanox.setState.mock.calls).toEqual([ [ expected ] ]);
    });
    return p;
  });

  test('promise(throw) => __error handler called', (done) => {
    expect.assertions(2);
    const expected = 'lorem ipsum';
    nanox.registerActions({
      __error: (err) => {
        expect(err.message).toEqual(expected);
        expect(nanox.setState.mock.calls).toHaveLength(0);
        done();
      }
    });
    const p = new Promise(() => {
      throw new Error(expected);
    });
    nanox.updateStore(p);
  });
});
