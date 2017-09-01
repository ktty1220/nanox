declare module 'react-micro-container' {
  import * as React from 'react';
  import { EventEmitter2 } from 'eventemitter2';

  export type Handler = (...args: any[]) => void;
  export interface Handlers {
    [ name: string ]: Handler;
  }

  export default class MicroContainer<P, S> extends React.Component<P, S> {
    protected emitter: EventEmitter2;
    protected dispatch(action: string, ...args: any[]): void;
    protected subscribe(actions: Handlers): void;
    protected unsubscribe(): void;
  }
}
