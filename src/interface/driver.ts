import { EventEmitter, RouteActionType } from './common';
export interface RouteRecord {
  id: string;
  path: string;
  state?: unknown;
}
export enum RouteDriverEventType {
  CHANGE = 'change'
}

export interface DriverEventMap {
  [RouteDriverEventType.CHANGE]: (type: RouteActionType, routeRecord: RouteRecord, payload?: unknown) => void;
}

export interface RouterDriver extends EventEmitter<DriverEventMap> {
  getCurrentRouteRecord(): RouteRecord;
  push(path: string, state?: unknown, payload?: unknown): void;
  pop(n: number, payload?: unknown): void;
  replace(path: string, state?: unknown, payload?: unknown): void;
  changePath(path: string): void;
  generateNextId(): string;
  deprecateNextId(): void;
}
