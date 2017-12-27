# Nanox - Minimal JavaScript framework for React inspired by Flux.

This framework is based on [react-micro-container](https://www.npmjs.com/package/react-micro-container), and added some extension.

For basic specs, see [here](https://www.npmjs.com/package/react-micro-container).

## Install

```sh
$ npm install nanox
```

## Usage

### STEP 1 - Create Actions

```js
const actions = {
  // action name is 'increment'
  increment(count) {
    // get current state
    const currentState = this.getState();

    // return partial state that you want to update
    return {
      count: currentState.count + count
    };
  },

  // action name is 'decrement'
  decrement(count) {
    // you can return Promise Object that resolve partial state
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // get current state
        const currentState = this.getState();

        // resolve partial state that you want to update
        resolve({
          count: currentState.count - count
        });
      }, 1000);
    });
  }
};

// export
export default actions;
```

### STEP 2 - Create Nanox Container

```js
// import React
import React from 'react';
import ReactDOM from 'react-dom';

// import Nanox
import Nanox from 'nanox';

// import child component
import BarComponent from './bar';

// import actions
import actions from './actions';

// create container (inherit Nanox)
class FooContainer extends Nanox {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    // register actions that created at STEP 1
    this.registerActions(actions);
  }

  render() {
    // pass this.dispatch to child component props
    return <BarComponent dispatch={this.dispatch} {...this.state} />;
  }
}

// mount Nanox container to DOM
ReactDOM.render(<FooContainer />, document.getElementById('foo'));
```

### STEP 3 - Create Child Component

```js
import * as React from 'react';

// create stateless component
export default class BarComponent extends React.Component {
  render() {
    // receive dispatch function via props
    const { dispatch, count } = this.props;
    return (
      <div>
        <div>{count}</div>
        {/* call dispatch function with action name and arguments that created at STEP 1 */}
        <button onClick={() => dispatch('increment', 1)}>+1</button>
        <button onClick={() => dispatch('decrement', 1)}>-1(delay 1s)</button>
        <button onClick={() => dispatch('increment', 100)}>+100</button>
      </div>
    );
  }
}
```

## DEMO

![Example Demo](demo.gif)

[CodeSandbox](https://codesandbox.io/s/pwz0prn3yq)

## Example

* [example of this repository](https://github.com/ktty1220/nanox/blob/master/example)
* [Simple counter application project](https://github.com/ktty1220/nanox-example)

## Spec of Action

### You can pass arguments after the action name when calling `dispatch()`.

```js
<button onClick={() => dispatch('fooAction', 1, 2, 3)}>foo</button>
```

```js
const actions = {
  fooAction(x, y, z) {
    // x = 1, y = 2, z = 3
  }
}
```

### If Action returns values, that must be partial state object or Promise Object.

#### :x: return number

```js
const actions = {
  fooAction(x, y, z) {
    return x + y + z;
  }
}
```

#### :heavy_check_mark: return partial state

```js
const actions = {
  fooAction(x, y, z) {
    return {
      count: x + y + z
    };
  }
}
```

#### :heavy_check_mark: return Promise Object (resolve partial state)

```js
const actions = {
  fooAction(x, y, z) {
    return new Promise((resolve, reject) => {
      resolve({
        count: x + y + z
      });
    });
  }
}
```

#### :heavy_check_mark: return nothing (No effect for Nanox container)

```js
const actions = {
  fooAction(x, y, z) {
    console.log(x, y, z);
  }
}
```

## API

### Nanox Core API

See [react-micro-container](https://www.npmjs.com/package/react-micro-container) for basic API.

#### registerActions

register actions to Nanox container.

This method shoud be called on `componentDidMount`.

```js
class FooContainer extends Nanox {
    .
    .
    .

  componentDidMount() {
    this.registerActions({
      fooAction(arg1, arg2, arg3) {
        // action method
      },
      barAction(...args) {
        // action method
      },

        .
        .
        .
    });
  }

    .
    .
    .
```

Other methods in Nanox are internal functions.

You can not use those methods directly.

### Action API

`this` in the action implements bellow methods.

#### getState

You can get current Nanox container's `state` by calling `this.getState()`.

```js
class FooContainer extends Nanox {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      waiting: false
    };
  }

    .
    .
    .
```

```js
const actions = {
  // action name is 'increment'
  increment(count) {
    // get current state
    const currentState = this.getState(); // => {
                                          //    count: 0,
                                          //    waiting: false
                                          // }

      .
      .
      .
```

##### Note

`this.getState()` returns copy of Nanox container's state.

Changing this value directly has no effect for Nanox container.

#### dispatch

You can execute another action by calling `this.dispatch()`.

```js
const actions = {
    .
    .
    .

  decrement(count) {
    // dispatch 'waiting' action in 'decrement' action
    this.dispatch('waiting', true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          count: this.getState().count - count,
          waiting: false
        });
      }, 1000);
    });
  },

  waiting(state) {
    // update 'waiting' state
    return {
      waiting: state
    };
  }

    .
    .
    .
```

## Advanced Usage

### Custom Error handler

Nanox implements default action `__error` that handling exception occurred in other actions.

Default `__error` action is a function that simply execute `console.error()`.

You can overwrite `__error` action by implementing a same name function in your actions.

```js
const actions = {
    .
    .
    .

  // overwrite '__error' action
  __error(err) {
    // show alert dialog instead of console.error
    window.alert(err.message);
  }

    .
    .
    .
```

### Hook methods

#### onDispatch

```js
class FooContainer extends Nanox {
    .
    .
    .
  onDispatch(action, ...args) {
    if ( ... ) {
      // You can block execution of action by returning false at onDispatch()
      return false;
    }
  }
    .
    .
    .
```

#### onSetState

```js
class FooContainer extends Nanox {
    .
    .
    .
  onSetState(nextState) {
    if ( ... ) {
      // You can block applying action result to state by returning false at onSetState()
      return false;
    }
  }
    .
    .
    .
```

## License

[MIT](http://www.opensource.org/licenses/mit-license)

&copy; 2017 [ktty1220](mailto:ktty1220@gmail.com)
