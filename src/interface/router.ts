import { Component } from 'vue';
import { IEventEmitter, IQuery, RouteActionType, RouteEventType } from './common';

export interface IRouterOption {
  routes: IRouteConfig[];
  config?: IRouterConfig;
}
export interface IRouterConfig {
  supportPreRender: boolean;
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

export interface IRoute {
  id: string;
  name: string;
  path: string;
  query: IQuery;
  params: IQuery;
  state?: unknown;
}

export interface IRouterEvent {
  [RouteEventType.CHANGE]: (type: RouteActionType, route?: IRouteInfo) => void;
  [RouteEventType.WILL_CHANGE]: (type: RouteActionType, route?: IRouteInfo) => void;
  [RouteEventType.CANCEL_CHANGE]: (routeInfo: IRouteInfo) => void;
  [RouteEventType.DESTROY]: (ids: string[]) => void;
}
export type preActionCallback = (cancel: boolean) => void;
export interface IRouter extends IEventEmitter<IRouterEvent> {
  readonly currentRouteInfo: IRouteInfo | undefined;
  readonly routerConfig: IRouterConfig;
  push(pathname: string, options?: Partial<INavigateOption>): void;
  prepush(pathname: string, options?: Partial<INavigateOption>): preActionCallback;
  pop(): void;
  prepop(): preActionCallback;
  replace(pathname: string, options?: INavigateOption): void;
  prereplace(pathname: string, options?: INavigateOption): preActionCallback;
}

export interface IRouteInfo {
  index: number;
  route: IRoute;
  config: IRouteConfig;
}
