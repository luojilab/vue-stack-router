import {  IEventEmitter, IRouteRecord } from './common';
export enum RouteDriverEventType {
  CHANGE = 'change',
  WILL_CHANGE = 'willChange'
}
export interface IDriverEvent {
  [RouteDriverEventType.CHANGE]: (routeRecord: IRouteRecord) => void;
  [RouteDriverEventType.WILL_CHANGE]: (route: IRouteRecord, oldRoute: IRouteRecord, abort: () => void) => void;
}

export interface IRouterDriver extends IEventEmitter<IDriverEvent> {
  push(path: string, state?: unknown): void;
  pop(): void;
  replace(path: string, state?: unknown): void;
  receiverReady(): void;
}
