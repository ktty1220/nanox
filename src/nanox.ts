/// <reference path="react-micro-container.d.ts" />
import MicroContainer, { Handler, Handlers } from 'react-micro-container';
import { EventEmitter2 } from 'eventemitter2';

// define actions
export type ActionResult<S> = Partial<S> | Promise<Partial<S>>;
interface ActionSandbox<S> {
  getState(): S;
  dispatch(action: string, ...args: any[]): void;
}
export type Action<S> = (this: ActionSandbox<S>, ...args: any[]) => ActionResult<S> | void;
export interface ActionMap<S> {
  [ name: string ]: Action<S>;
}

// class Nanox
export default class Nanox<P, S> extends MicroContainer<P, S> {
  protected sandbox: ActionSandbox<S>;

  constructor(props: P) {
    super(props);
    // use eventemitter2 instead of events
    this.emitter = new EventEmitter2();
  }

  // override react-micro-container's dispatch method
  protected dispatch(action: string, ...args: any[]): void {
    // check action name typo
    if (this.emitter.listeners(action).length === 0) {
      throw new Error(`event '${action}' is not registered`);
    }
    super.dispatch.apply(this, [ action, ...args ]);
  }

  // apply action result to state
  private updateStore(result: ActionResult<S>): void {
    const recursive = this.updateStore.bind(this);

    // null or undefined -> skip
    if (result == null) return;

    // not object -> error
    const type = (Object.prototype.toString.call(result) === '[object Array]') ? 'array' : typeof result;
    if (type !== 'object') {
      this.dispatch('__error', new Error(`invalid action result: ${result} is ${type}`));
      return;
    }

    if (result instanceof Promise) {
      // Promise -> resolve -> updateStore
      result.then(recursive).catch((err) => this.dispatch('__error', err));
    } else {
      // object -> setState
      this.setState(result as Pick<S, keyof S>);
    }
  }

  // create function that execute action and update state
  private createAction(func: Action<S>, inErrorHandler: boolean): Handler {
    return (...args: any[]) => {
      try {
        this.updateStore(func.apply(this.sandbox, args));
      } catch (e) {
        if (inErrorHandler) throw e;
        this.dispatch('__error', e);
      }
    };
  }

  // subscribe all actions
  protected registerActions(actionMap: ActionMap<S>): void {
    if (this.emitter.eventNames().length > 0) {
      throw new Error('actions are already registered');
    }

    // sandbox
    const self = this;
    this.sandbox = {
      getState: () => Object.assign({}, self.state || {}) as S,
      dispatch: (...args: any[]) => self.dispatch.apply(self, args)
    };

    const actions = Object.assign({
      // default error action
      __error: ((err: Error) => {
        console.error(err.message);
      }) as Action<S>
    }, actionMap);

    // action to handler
    const handlers: Handlers = {};
    const actionNames = Object.keys(actions);
    this.emitter.setMaxListeners(actionNames.length);
    actionNames.forEach((evt) => {
      handlers[evt] = this.createAction(actions[evt], (evt === '__error'));
    });

    this.subscribe(handlers);
  }
}
