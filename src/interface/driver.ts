import { IEventEmitter, RouteActionType } from './common';
export interface IRouteRecord {
  type: RouteActionType;
  id: string;
  path: string;
  state?: unknown;
  payload?: unknown;
}
export enum RouteDriverEventType {
  CHANGE = 'change'
}

export interface IDriverEventMap {
  [RouteDriverEventType.CHANGE]: (routeRecord: IRouteRecord) => void;
}

export interface IRouterDriver extends IEventEmitter<IDriverEventMap> {
  push(path: string, state?: unknown, payload?: unknown): void;
  pop(n: number, payload?: unknown): void;
  replace(path: string, state?: unknown, payload?: unknown): void;
  generateNextId(): string;
  deprecateNextId(): void;
}
