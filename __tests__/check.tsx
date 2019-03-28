/*tslint:disable: no-invalid-this variable-name*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Nanox, {
  ActionResult,
  ActionMap,
  ContainerProps,
  ComponentProps
} from '../';

interface State {
  count: number;
}

const actions: ActionMap<State> = {
  increment(count): ActionResult<State> {
    return this.update({
      count: { $increment: count }
    });
  },

  decrement(count): ActionResult<State> {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        const currentState = this.getState();
        resolve({
          count: currentState.count - count
        });
      }, 1000);
    });
  }
};

interface CounterProps extends ComponentProps {
  count: number;
}
const CounterComponent: React.FC<CounterProps> = ({ dispatch, count }) => (
  <div>
    <div>{count}</div>
    <button onClick={() => dispatch('increment', 1)}>+1</button>
    <button onClick={() => dispatch('decrement', 1)}>-1(delay 1s)</button>
    <button onClick={() => dispatch('increment', 100)}>+100</button>
  </div>
);

interface MainProps extends ContainerProps<State> {
  name: string;
}
class MainContainer extends Nanox<MainProps, State> {
  constructor(props: MainProps) {
    super(props);
    this.state = { count: 0 };
  }

  public render() {
    return <CounterComponent dispatch={this.dispatch} {...this.state} />;
  }
}

ReactDOM.render(
  <MainContainer name="app" actions={actions} />,
  document.getElementById('app')
);
