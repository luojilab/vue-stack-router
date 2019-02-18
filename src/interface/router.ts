import { Component } from 'vue';
import { IBaseEventType, IEventEmitter, IQuery, NavigateActionType } from './common';

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

export enum RouterEventType {
  CHANGE = 'change',
  DESTROY = 'destroy'
}

export interface IRouterEvent extends IBaseEventType {
  [RouterEventType.CHANGE]: [NavigateActionType, IRoute?, IRouteConfig?];
  [RouterEventType.DESTROY]: [string[]];
}

export interface IRouter extends IEventEmitter<IRouterEvent> {
  readonly currentRoute: IRoute | undefined;
  readonly currentRouteConfig:IRouteConfig | undefined;
  push(pathname: string, options?: Partial<INavigateOption>): void;
  pop(): void;
  replace(pathname: string, options?: INavigateOption): void;
}
