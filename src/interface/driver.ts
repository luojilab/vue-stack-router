import {  IEventEmitter, IRouteRecord } from './common';
export enum RouteDriverEventType {
  CHANGE = 'change',
}
export interface IDriverEventMap {
  [RouteDriverEventType.CHANGE]: (routeRecord: IRouteRecord) => void;
}

export interface IRouterDriver extends IEventEmitter<IDriverEventMap> {
  push(path: string, state?: unknown): void;
  pop(): void;
  replace(path: string, state?: unknown): void;
}
