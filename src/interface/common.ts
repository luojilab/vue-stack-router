export interface IEventEmitter<T> {
  on<K extends keyof T>(type: K, listener: T[K]): void;
  off<K extends keyof T>(type: K, listener: T[K]): void;
  emit<K extends keyof T>(type: K, ...params: Parameters<T[K] extends (...args: any[]) => any ? T[K] : never>): void;
}

export enum RouteActionType {
  PUSH = 'push',
  POP = 'pop',
  REPLACE = 'replace'
}

export enum ViewActionType {
  WILL_APPEAR = 'willAppear',
  DID_APPEAR = 'didAppear',
  WILL_DISAPPEAR = 'willDisappear',
  DID_DISAPPEAR = 'didDisappear'
}

export interface IQuery {
  [k: string]: unknown;
}

export type ILocation<T = {}> = INameLocation<T> | IPathnameLocation<T> | string;
export type INameLocation<T> = {
  name: string;
  params?: IQuery;
  query?: IQuery;
  hash?: string;
} & T;

export type IPathnameLocation<T> = {
  pathname: string;
  query?: IQuery;
  hash?: string;
} & T;
