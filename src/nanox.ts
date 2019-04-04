import { Component } from 'react';
import update, { extend } from 'immutability-helper';

// custom update commands
extend('$increment', (value: number, target: number) => (target || 0) + value);
extend('$decrement', (value: number, target: number) => (target || 0) - value);

// define actions
type UpdateCommands<S> = { [K in keyof S]: any };
class LazyUpdater<S> {
  constructor(public commands: UpdateCommands<Partial<S>>) {}
}
type NextState<S> = Pick<S, keyof S> | UpdateCommands<Partial<S>>;

type ActionResult<S> = void | Partial<S> | Promise<Partial<S>> | LazyUpdater<S>;
export type Action<S> = (this: ActionSandbox<S>, ...args: any[]) => ActionResult<S>;
export interface ActionMap<S> {
  __error?: Action<S>;
}

export type NanoxAction = (...args: any[]) => void;
export type NanoxActionMap<S, A> = { [ K in keyof (A & ActionMap<S>) ]: NanoxAction };

interface ActionSandbox<S> {
  state: S;
  update(commands: UpdateCommands<Partial<S>>): LazyUpdater<S>;
}

// class Nanox
export default class Nanox<P, S, A> extends Component<P, S> {
  public actions!: NanoxActionMap<S, A>;

  constructor(props: P & { actions: A }) {
    super(props);
    if (! ('actions' in props)) {
      throw new Error('requires the action props');
    }
    this.registerActions(props.actions);
  }

  // setState hook
  protected onSetState(_nextState: NextState<S>, _type: string): boolean {
    return true;
  }

  // clone object
  private clone<OBJ>(obj: OBJ): OBJ {
    return Object.assign({}, obj) as OBJ;
  }

  // ver 0.1.x
  protected dispatch(_action: string, ..._args: any[]): never {
    throw new Error('Nanox version 0.2.0 has many breaking changes from version 0.1.x.\nsee https://github.com/ktty1220/nanox');
  }

  // apply action result to state
  private updateStore(result: ActionResult<S>): void {
    const recursive = this.updateStore.bind(this);

    // null or undefined -> skip
    if (result == null) return;

    // not object -> error
    const type = (Object.prototype.toString.call(result) === '[object Array]') ? 'array' : typeof result;
    if (type !== 'object') {
      this.actions.__error!(new Error(`invalid action result: ${result} is ${type}`));
      return;
    }

    if (result instanceof Promise) {
      // Promise -> resolve -> updateStore
      result.then(recursive).catch(this.actions.__error);
    } else {
      const isUpdate = (result instanceof LazyUpdater);
      // object or LazyUpdater -> setState
      const nextState = (isUpdate)
        ? (result as LazyUpdater<S>).commands
        : result as Partial<S>;
      if (this.onSetState(this.clone(nextState), (isUpdate) ? 'update' : 'state') === false) {
        console.warn('setState() was blocked at onSetState()');
        return;
      }
      this.setState(
        (isUpdate)
        ? (currentState) => update(currentState, nextState as any)
        : nextState
      );
    }
  }

  // create function that execute action and update state
  private createAction(func: Action<S>, inErrorHandler: boolean): NanoxAction {
    const self = this;
    return (...args: any[]) => {
      // sandbox
      const sandbox: ActionSandbox<S> = {
        get state() {
          return self.clone(self.state || {}) as S;
        },
        update: (commands) => new LazyUpdater(commands)
      };

      try {
        this.updateStore(func.apply(Object.freeze(sandbox), args));
      } catch (e) {
        if (inErrorHandler) throw e;
        this.actions.__error!(e);
      }
    };
  }

  // subscribe all actions
  private registerActions(actionMap: ActionMap<S>): void {
    if (this.actions != null) {
      throw new Error('actions are already registered');
    }

    const actions = Object.freeze(
      Object.assign({
        // default error action
        __error: (console.error) as Action<S>
      }, actionMap)
    );

    const actionNames = Object.keys(actions);
    const nanoxActions = {};
    actionNames.forEach((evt) => {
      nanoxActions[evt] = this.createAction(actions[evt], (evt === '__error'));
    });
    this.actions = Object.freeze(nanoxActions) as NanoxActionMap<S, A>;
  }
}
