/// <reference path="react-micro-container.d.ts" />
import MicroContainer, { Handler, Handlers } from 'react-micro-container';

// define actions
export type ActionResult<S> = void | Partial<S> | Promise<Partial<S>>;
export interface ActionSandbox<S> {
  getState(): S;
  dispatch(action: string, ...args: any[]): void;
  update(methods: { [K in keyof S]: any }): ActionResult<S>;
}
export type Action<S> = (this: ActionSandbox<S>, ...args: any[]) => ActionResult<S>;
export interface ActionMap<S> {
  [ name: string ]: Action<S>;
}
export type LogLevels = 'log' | 'info' | 'warn' | 'error';

// define base props
export interface ComponentProps {
  dispatch(action: string, ...args: any[]): void;
}

// class Nanox
export default class Nanox<P, S> extends MicroContainer<P, S> {
  protected sandbox!: ActionSandbox<S>;

  constructor(props: P) {
    super(props);
  }

  // show log
  protected log(message: string, level: LogLevels = 'log') {
    console[level](message);
  }

  // setState hook
  protected onSetState(_nextState: Pick<S, keyof S>): boolean {
    return true;
  }

  // dispatch hook
  protected onDispatch(_action: string, ..._args: any[]): boolean {
    return true;
  }

  // clone object
  private clone<OBJ>(obj: OBJ): OBJ {
    return Object.assign({}, obj) as OBJ;
  }

  // override react-micro-container's dispatch method
  protected dispatch(action: string, ...args: any[]): void {
    // check action name typo
    if (this.emitter.listeners(action).length === 0) {
      throw new Error(`event '${action}' is not registered`);
    }
    if (this.onDispatch(action, ...args) === false) {
      this.log(`action: '${action}' was blocked at onDispatch()`, 'warn');
      return;
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
      const pickState = result as Pick<S, keyof S>;
      if (this.onSetState(this.clone(pickState)) === false) {
        this.log('setState() was blocked at onSetState()', 'warn');
        return;
      }
      this.setState(pickState);
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
    this.sandbox = Object.freeze({
      getState: () => this.clone(self.state || {}) as S,
      dispatch: (...args) => self.dispatch.apply(self, args),
      update: (methods) => {
        // TODO
        console.info(self.sandbox.getState());
        return methods;
      }
    } as ActionSandbox<S>);

    const actions = Object.freeze(
      Object.assign({
        // default error action
        __error: ((err: Error) => {
          this.log(err.message, 'error');
        }) as Action<S>
      }, actionMap)
    );

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
