/*tslint:disable: no-invalid-this variable-name*/
import {
  FC,
  memo,
  createContext,
  useContext,
  useState,
  useCallback
} from 'react';
import * as ReactDOM from 'react-dom';
// import types from Nanox
import Nanox, {
  Action,
  ActionMap,
  CommandMap,
  NanoxActionMap
} from '../';

interface State {
  count: number;
}

const myCommands: CommandMap = {
  $increment: (value: number, target: number) => (target || 0) + value
};

// define actions
interface MyActions extends ActionMap<State> {
  increment: Action<State>;
  decrement: Action<State>;
}

// create actions of type MyActions
const myActions: MyActions = {
  increment(count: number) {
    return this.query({
      count: { $increment: count }
    });
  },

  decrement(count: number) {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve({
          count: this.state.count - count
        });
      }, 1000);
    });
  }
};

// create context(pass the Nanox actions)
const Context = createContext<NanoxActionMap<State, MyActions> | null>(null);

interface CounterProps {
  count: number;
}
const CounterComponent: FC<CounterProps> = memo(({ count }) => {
  const actions = useContext(Context)!;  // <- need "!"
  const [ disabled, setDisabled ] = useState(false);

  const increment1 = useCallback(() => actions.increment(1), []);
  const decrement1 = useCallback(() => actions.decrement(1), []);
  const increment100 = useCallback(() => actions.increment(100), []);
  const step = useCallback(() => {
    setDisabled(true);
    actions.increment(1)
    .then(() => actions.decrement(1))
    .then(() => actions.decrement(1))
    .then(() => new Promise((resolve) => setTimeout(resolve, Math.random() * 3000)))
    .then(() => actions.increment(1))
    .then(() => setDisabled(false))
    .catch(console.error);
  }, []);

  return (
    <div>
      <p>{count}</p>
      <button disabled={disabled} onClick={increment1}>+1</button>
      <button disabled={disabled} onClick={decrement1}>-1(delay 1s)</button>
      <button disabled={disabled} onClick={increment100}>+100</button>
      <button disabled={disabled} onClick={step}>step</button>
    </div>
  );
});

// define container props
interface MainProps {
  actions: MyActions;    // required
  commands: CommandMap;  // optional
  title: string;         // other props
}
class MainContainer extends Nanox<MainProps, State> {
  constructor(props: MainProps) {
    super(props);
    this.state = { count: 0 };
  }

  public render() {
    return (
      <Context.Provider value={this.actions}>
        <h2>{this.props.title}</h2>
        <CounterComponent count={this.state.count} />
        <p>Look at the logs displayed on the Developer Tools console.</p>
      </Context.Provider>
    );
  }
}

ReactDOM.render(
  <MainContainer
    title="Nanox simple example"
    actions={myActions}
    commands={myCommands}
  />,
  document.getElementById('app')
);
