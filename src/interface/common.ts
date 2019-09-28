export interface EventEmitter<T> {
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

export interface Query {
  [k: string]: unknown;
}

export type Location<T = {}> = NameLocation<T> | PathnameLocation<T> | string;
export type NameLocation<T> = {
  name: string;
  params?: Query;
  query?: Query;
  hash?: string;
} & T;

export type PathnameLocation<T> = {
  pathname: string;
  query?: Query;
  hash?: string;
} & T;
