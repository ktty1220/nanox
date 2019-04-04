/*tslint:disable: no-invalid-this variable-name*/
import {
  FC,
  memo,
  createContext,
  useContext,
  useCallback
} from 'react';
import * as ReactDOM from 'react-dom';
import Nanox, {
  Action,
  ActionMap,
  NanoxActionMap
} from '../';

interface State {
  count: number;
}

interface MyActions extends ActionMap<State> {
  increment: Action<State>;
  decrement: Action<State>;
}

const myActions: MyActions = {
  increment(count: number) {
    return this.update({
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

const Context = createContext<NanoxActionMap<State, MyActions>>(null);

interface CounterProps {
  count: number;
}
const CounterComponent: FC<CounterProps> = ({ count }) => {
  const actions = useContext(Context);

  const increment1 = useCallback(() => actions.increment(1), []);
  const decrement1 = useCallback(() => actions.decrement(1), []);
  const increment100 = useCallback(() => actions.increment(100), []);

  return (
    <div>
      <div>{count}</div>
      <button onClick={increment1}>+1</button>
      <button onClick={decrement1}>-1(delay 1s)</button>
      <button onClick={increment100}>+100</button>
    </div>
  );
};

interface MainProps {
  actions: MyActions;
  title: string;
}
class MainContainer extends Nanox<MainProps, State, MyActions> {
  constructor(props) {
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
  <MainContainer title="Nanox simple example" actions={myActions} />,
  document.getElementById('app')
);
