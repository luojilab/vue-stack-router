import { IEventEmitter, RouteActionType } from './common';
export interface IRouteRecord {
  id: string;
  path: string;
  state?: unknown;
}
export enum RouteDriverEventType {
  CHANGE = 'change'
}

export interface IDriverEventMap {
  [RouteDriverEventType.CHANGE]: (type: RouteActionType, routeRecord: IRouteRecord, payload?: unknown) => void;
}

export interface IRouterDriver extends IEventEmitter<IDriverEventMap> {
  getCurrentRouteRecord(): IRouteRecord;
  push(path: string, state?: unknown, payload?: unknown): void;
  pop(n: number, payload?: unknown): void;
  replace(path: string, state?: unknown, payload?: unknown): void;
  changePath(path: string): void;
  generateNextId(): string;
  deprecateNextId(): void;
}
