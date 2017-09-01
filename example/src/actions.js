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
