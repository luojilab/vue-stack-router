import { Component } from 'vue';
import { IEventEmitter, IQuery, RouteActionType, RouteEventType } from './common';

export interface IRouterOption {
  routes: IRouteConfig[];
  config?: IRouterConfig;
}
export interface IRouterConfig {
  readonly supportPreRender: boolean;
}
export interface IRouteConfig {
  name?: string;
  path: string;
  component: Component;
  meta?: unknown;
}

export interface INavigateOption {
  query: { [key: string]: unknown };
  params: { [key: string]: unknown };
  state: unknown;
}
export type INameLocation = {
  name: string;
} & Partial<INavigateOption>;

export function isNameLocation(location: any): location is INameLocation {
  return location.name !== undefined;
}

export type IPathnameLocation = {
  pathname: string;
} & Partial<INavigateOption>;

export function isPathnameLocation(location: any): location is IPathnameLocation {
  return location.pathname !== undefined;
}
export type ILocation = string | INameLocation | IPathnameLocation;
export interface IRoute {
  id: string;
  name: string;
  path: string;
  query: IQuery;
  params: IQuery;
  state?: unknown;
}

export interface IRouterEventMap {
  [RouteEventType.CHANGE]: (type: RouteActionType, route?: IRouteInfo) => void;
  [RouteEventType.WILL_CHANGE]: (type: RouteActionType, route?: IRouteInfo) => void;
  [RouteEventType.CANCEL_CHANGE]: (routeInfo: IRouteInfo) => void;
  [RouteEventType.DESTROY]: (ids: string[]) => void;
}
export type preActionCallback = (cancel: boolean) => void;
export interface IRouter extends IEventEmitter<IRouterEventMap> {
  readonly currentRouteInfo: IRouteInfo | undefined;
  push(location: ILocation): void;
  prepush(location: ILocation): preActionCallback;
  pop(): void;
  prepop(): preActionCallback;
  replace(location: ILocation): void;
  prereplace(location: ILocation): preActionCallback;
}

export interface IRouteInfo {
  index: number;
  route: IRoute;
  config: IRouteConfig;
}
