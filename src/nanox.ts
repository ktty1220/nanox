import { Component } from 'react';
import { Context } from 'immutability-helper';

// util
type PropType<Obj, Prop extends keyof Obj> = Obj[Prop];
type VoidFunc = () => void;

// define query commands
export interface CommandMap {
  [ command: string ]: (...args: any) => any;
}
type UpdateCommands<S> = { [K in keyof S]: any };
class UpdateQuery<S> {
  constructor(public commands: UpdateCommands<Partial<S>>) {}
}
type NextState<S> = Partial<S> | UpdateCommands<Partial<S>>;

// define actions
type ActionResult<S> = void | Partial<S> | Promise<Partial<S>> | UpdateQuery<S>;
export type Action<S> = (this: ActionSandbox<S>, ...args: any[]) => ActionResult<S>;
interface ActionMap<S> {
  [ name: string ]: Action<S>;
}

// define Nanox actions
export type NanoxAction = (...args: any[]) => Promise<void>;
export type NanoxActionMap<A> = { [ K in keyof A ]: NanoxAction };

// define sandbox
interface ActionSandbox<S> {
  state: S;
  query(commands: UpdateCommands<Partial<S>>): UpdateQuery<S>;
}

// class Nanox
interface InternalProps {
  actions: {};
  commands?: CommandMap;
}
export default class Nanox<P extends InternalProps, S> extends Component<P, S> {
  public actions!: NanoxActionMap<PropType<P, 'actions'>>;
  private updateContext!: Context;
  private obsoleteMessage = 'Nanox version 0.2.0 has many breaking changes from version 0.1.x.\nsee https://github.com/ktty1220/nanox';

  constructor(props: P) {
    super(props);
    if (! ('actions' in props)) {
      throw new Error(`requires the action props\n(${this.obsoleteMessage})`);
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

  // obsolete
  protected dispatch(_action: string, ..._args: any[]): never {
    throw new Error(this.obsoleteMessage);
  }

  // apply action result to state
  private updateStore(result: ActionResult<S>, resolve: VoidFunc, reject: VoidFunc): void {
    // null or undefined -> skip
    if (result == null) return;

    // not object -> error
    const type = (Array.isArray(result)) ? 'array' : typeof result;
    if (type !== 'object') {
      throw new Error(`invalid action result: ${result} is ${type}`);
    }

    if (result instanceof Promise) {
      // Promise -> resolve -> updateStore
      result.then((data) => this.updateStore(data, resolve, reject)).catch(reject);
    } else {
      const isQuery = (result instanceof UpdateQuery);
      // object or UpdateQuery -> setState
      const nextState = (isQuery)
        ? (result as UpdateQuery<S>).commands
        : result as Partial<S>;
      if (this.onSetState(this.clone(nextState), (isQuery) ? 'query' : 'state') === false) {
        console.warn('setState() was blocked at onSetState()');
        return;
      }
      this.setState(
        (isQuery)
        ? (currentState) => this.updateContext.update(currentState, nextState as any)
        : nextState,
        resolve
      );
    }
  }

  // create function that execute action and update state
  private createAction(func: Action<S>): NanoxAction {
    const self = this;
    return (...args: any[]) => (
      new Promise<void>((resolve, reject) => {
        // sandbox
        const sandbox: ActionSandbox<S> = {
          get state() {
            return self.clone(self.state || {}) as S;
          },
          query: (commands) => new UpdateQuery(commands)
        };

        this.updateStore(func.apply(Object.freeze(sandbox), args), resolve, reject);
      })
    );
  }

  // convert actions props to nanox actions
  private registerActions(actionMap: ActionMap<S>): void {
    if (this.actions != null) {
      throw new Error('actions are already registered');
    }

    const actions = Object.freeze({
      ...actionMap
    });

    const nanoxActions = {};
    for (const [ evt, func ] of Object.entries(actions)) {
      nanoxActions[evt] = this.createAction(func);
    }
    this.actions = Object.freeze(nanoxActions) as NanoxActionMap<PropType<P, 'actions'>>;
  }

  // register custom commands for sandbox.query function
  private registerCommands(commandMap?: CommandMap): void {
    this.updateContext = new Context();
    if (commandMap == null) return;
    for (const [ cmd, func ] of Object.entries(commandMap)) {
      this.updateContext.extend(cmd, func);
    }
  }
}
