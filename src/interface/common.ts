export interface IBaseEventType {
  [k: string]: Array<unknown>;
}
export interface IEventEmitter<T extends IBaseEventType> {
  on<K extends keyof T>(type: K, listener: (...params: T[K]) => void): void;
  off<K extends keyof T>(type: K, listener: (...params: T[K]) => void): void;
  emit<K extends keyof T>(type: K, ...params: T[K]): void;
}

export interface IRouteRecord {
  id: string;
  path: string;
  state?: unknown;
}

export enum NavigateActionType {
  NONE = 'none',
  PUSH = 'push',
  POP = 'pop',
  REPLACE = 'replace'
}

export enum ViewEventType {
  WILL_APPEAR = 'willAppear',
  DID_APPEAR = 'didAppear',
  WILL_DISAPPEAR = 'willDisappear',
  DID_DISAPPEAR = 'didDisappear'
}
export interface IQuery {
  [k: string]: unknown;
}
