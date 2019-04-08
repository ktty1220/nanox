# Nanox

Minimal javaScript framework for React inspired by Flux.

## Install

```sh
$ npm install nanox
```

## Usage

### STEP 1 - Create actions

```js
const myActions = {
  // action name is 'increment'
  increment(count) {
    // return partial state that you want to update
    return {
      count: this.state.count + count
    };
  },

  // action name is 'decrement'
  decrement(count) {
    // you can return Promise Object that resolve partial state
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // resolve partial state that you want to update
        resolve({
          count: this.state.count - count
        });
      }, 1000);
    });
  }
};

// export
export default myActions;
```

### STEP 2 - Create child component

```js
// create stateless component(receive actions via props)
const CounterComponent = ({ actions, count }) => {
  // call actions that created at STEP 1
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => actions.increment(1)}>+1</button>
      <button onClick={() => actions.decrement(1)}>-1(delay 1s)</button>
      <button onClick={() => actions.increment(100)}>+100</button>
    </div>
  );
};

export default CounterComponent;
```

### STEP 3 - Create Nanox container

```js
// import React
import React from 'react';
import ReactDOM from 'react-dom';

// import Nanox
import Nanox from 'nanox';

// import child component
import CounterComponent from './counter';

// import actions
import myActions from './actions';

// create container (inherit Nanox)
class MainContainer extends Nanox {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    // pass this.actions to child component props
    return <CounterComponent actions={this.actions} count{...this.state} />;
  }
}

// mount Nanox container to DOM
ReactDOM.render(
  // register actions that created at STEP 1
  <MainContainer actions={myActions} />,
  document.getElementById('app')
);
```

## Examples

![Example Demo](demo.gif)

* [DEMO](https://codesandbox.io/s/pwz0prn3yq)
* [Example file of this repository](https://github.com/ktty1220/nanox/blob/master/example.html)

## Spec of Action

### If Action returns values, that must be partial state object or Promise Object.

#### :x: __Bad__: return number

```js
const myActions = {
  foo(x, y, z) {
    return x + y + z;
  }
};
```

#### :heavy_check_mark: __Good__: return partial state

```js
const myActions = {
  foo(x, y, z) {
    return {
      count: x + y + z
    };
  }
};
```

#### :heavy_check_mark: __Good__: return Promise Object (resolve partial state)

```js
const myActions = {
  foo(x, y, z) {
    return new Promise((resolve, reject) => {
      resolve({
        count: x + y + z
      });
    });
  }
};
```

#### :heavy_check_mark: __Good__: return nothing (no effect for Nanox container)

```js
const myActions = {
  foo(x, y, z) {
    console.log(x, y, z);
  }
}
```

### Get the current state in actions

The current state of the Nanox container can be get from `this.state`.

```js
class MainContainer extends Nanox {
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
const myActions = {
  increment(count) {
    // get current state
    const currentState = this.state; // => {
                                     //    count: 0,
                                     //    waiting: false
                                     // }

      .
      .
      .
```

##### Note

`this.state` is copy of Nanox container's state.

Changing this value directly has no effect for Nanox container.

## Advanced Usage

### `update` function in actions

You can return an update command like MongoDB's query language in actions using `this.update`.

```js
class MainContainer extends Nanox {
  constructor(props) {
    super(props);
    this.state = {
      fruits: [ 'apple', 'banana', 'cherry' ]
    };
  }
    .
    .
    .
```

```js
const myActions = {
  addUser(user) {
    // call this.update function with command, and return functions result
    return this.update({
      fruits: {
        $push: [ 'lemon' ] // => will be [ 'apple', 'banana', 'cherry', 'lemon' ]
      }
    });
  },
    .
    .
    .
}
```

And you can add custom command for update function.

```js
ReactDOM.render(
  // add $increment command on mounting Nanox container
  <MainContainer
    actions={myActions}
    commands={{
      $increment: (value, target) => target + value
    }}
  />,
  document.getElementById('app')
);
```

```js
const myActions = {
  increment() {
    // use $increment command in actions
    return this.update({
      // value = 1, target = this.state.count
      count: { $increment: 1 }
    });
  },
    .
    .
    .
};
```

[see more details](https://github.com/kolodny/immutability-helper#adding-your-own-commands).

### Action chain

Actions return Promise object, so you can invoke multiple actions synchronously.

```js
const myActions = {
  // show/hide loading message
  loading(show) {
    return {
      loading: show
    };
  },
  // fetch friends info from server
  fetchFriends() {
    return fetch('/friends')
    .then((res) => res.json())
    .then((friendsInfo) => {
      return {
        friends: friendsInfo
      }
    });
  },
  // send message to friends
  sendMessage(text) {
    const data = new FormData();
    data.append('to', this.state.friends);
    data.append('text', text);
    fetch('/message', {
      method: 'post',
      body: data
    });
  },
    .
    .
    .
};
```

```js
return (
  <button onClick={
    actions.loading(true)
    .then(() => actions.fetchFriends())
    .then(() => actions.sendMessage('hello'))
    .then(() => actions.loading(false))
    .catch(console.error);
  }>Say hello to my friends</button>
);
```

### Custom error handler

Nanox implements default action `__error` that handling exception occurred in other actions.

Default `__error` action is a function that simply execute `console.error()`.

You can overwrite `__error` action by implementing a same name function in your actions.

```js
const myActions = {
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

### Hook method

```js
class MainContainer extends Nanox {
    .
    .
    .
  onSetState(data, type) {
    // data = partial state or update command that will apply to Nanox state
    // type = 'state' or 'update'
    if ( ... ) {
      // You can block applying action result to state by returning false at onSetState()
      return false;
    }
  }
    .
    .
    .
```

`nextState` is copy of Nanox container's state.

Changing this value directly has no effect for Nanox container.

## License

[MIT](http://www.opensource.org/licenses/mit-license)

&copy; 2019 [ktty1220](mailto:ktty1220@gmail.com)
