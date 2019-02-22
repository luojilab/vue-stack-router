import { Component } from 'vue';
import { IEventEmitter, IQuery, RouteActionType, RouteEventType } from './common';

export interface IRouterOption {
  routes: IRouteConfig[];
  config?: unknown; // todo
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
  [RouteEventType.CHANGE]: (type: RouteActionType, route?: IRoute, config?: IRouteConfig) => void;
  [RouteEventType.DESTROY]: (ids: string[]) => void;
}

export interface IRouter extends IEventEmitter<IRouterEvent> {
  readonly currentRoute: IRoute | undefined;
  readonly currentRouteConfig: IRouteConfig | undefined;
  push(pathname: string, options?: Partial<INavigateOption>): void;
  pop(): void;
  replace(pathname: string, options?: INavigateOption): void;
}
