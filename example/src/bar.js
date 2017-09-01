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
