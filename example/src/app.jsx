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
