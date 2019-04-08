import { Component } from 'react';
import { Context } from 'immutability-helper';

// define actions
type UpdateCommands<S> = { [K in keyof S]: any };
class LazyUpdater<S> {
  constructor(public commands: UpdateCommands<Partial<S>>) {}
}
type NextState<S> = Partial<S> | UpdateCommands<Partial<S>>;

type ActionResult<S> = void | Partial<S> | Promise<Partial<S>> | LazyUpdater<S>;
export type Action<S> = (this: ActionSandbox<S>, ...args: any[]) => ActionResult<S>;
export interface ActionMap<S> {
  __error?: Action<S>;
}

export interface CommandMap {
  [ command: string ]: (...args: any) => any;
}

export type NanoxAction = (...args: any[]) => Promise<void>;
export type NanoxActionMap<S, A> = { [ K in keyof (A & ActionMap<S>) ]: NanoxAction };

interface ActionSandbox<S> {
  state: S;
  update(commands: UpdateCommands<Partial<S>>): LazyUpdater<S>;
}

interface InternalProps<S> {
  actions: ActionMap<S>;
  commands?: CommandMap;
}
type PropType<Obj, Prop extends keyof Obj> = Obj[Prop];

// class Nanox
export default class Nanox<P extends InternalProps<S>, S> extends Component<P, S> {
  public actions!: NanoxActionMap<S, PropType<P, 'actions'>>;
  private updateContext!: Context;

  constructor(props: P) {
    super(props);
    if (! ('actions' in props)) {
      throw new Error('requires the action props');
    }
    this.registerActions(props.actions);
    this.registerCommands(props.commands);
  }

  // setState hook
  protected onSetState(_nextState: NextState<S>, _type: string): boolean {
    return true;
  }

  // clone object
  private clone<OBJ>(obj: OBJ): OBJ {
    return { ...obj };
  }

  // ver 0.1.x
  protected dispatch(_action: string, ..._args: any[]): never {
    throw new Error('Nanox version 0.2.0 has many breaking changes from version 0.1.x.\nsee https://github.com/ktty1220/nanox');
  }

  // apply action result to state
  private updateStore(result: ActionResult<S>, done: () => void): void {
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
      result.then((data) => this.updateStore(data, done)).catch(this.actions.__error);
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
        ? (currentState) => this.updateContext.update(currentState, nextState as any)
        : nextState,
        done
      );
    }
  }

  // create function that execute action and update state
  private createAction(func: Action<S>, inErrorHandler: boolean): NanoxAction {
    const self = this;
    return (...args: any[]) => (
      new Promise<void>((resolve, _reject) => {
        // sandbox
        const sandbox: ActionSandbox<S> = {
          get state() {
            return self.clone(self.state || {}) as S;
          },
          update: (commands) => new LazyUpdater(commands)
        };

        try {
          this.updateStore(func.apply(Object.freeze(sandbox), args), resolve);
        } catch (e) {
          if (inErrorHandler) throw e;
          this.actions.__error!(e);
        }
      })
    );
  }

  // convert actions props to nanox actions
  private registerActions(actionMap: ActionMap<S>): void {
    if (this.actions != null) {
      throw new Error('actions are already registered');
    }

    const actions = Object.freeze(
      {
        __error: console.error as Action<S>, // default error action
        ...actionMap
      }
    );

    const nanoxActions = {};
    for (const [ evt, func ] of Object.entries(actions)) {
      nanoxActions[evt] = this.createAction(func, (evt === '__error'));
    }
    this.actions = Object.freeze(nanoxActions) as NanoxActionMap<S, PropType<P, 'actions'>>;
  }

  // register custom commands for sandbox.update
  private registerCommands(commandMap?: CommandMap): void {
    this.updateContext = new Context();
    if (commandMap == null) return;
    for (const [ cmd, func] of Object.entries(commandMap)) {
      this.updateContext.extend(cmd, func);
    }
  }
}
