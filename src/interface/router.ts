import { Component } from 'vue';
import { IEventEmitter, IQuery, Omit, RouteActionType, RouteEventType } from './common';

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
  transition?: unknown;
  meta?: unknown;
}
export interface INavigationOptions extends IPopNavigationOptions {
  query: { [key: string]: unknown };
  params: { [key: string]: unknown };
  state: unknown;
}
export interface IPopNavigationOptions {
  transition: unknown;
}
export type INameLocation<T> = {
  name: string;
} & Partial<T>;

export function isNameLocation<T extends INavigationOptions>(location: any): location is INameLocation<T> {
  return location.name !== undefined;
}

export type IPathnameLocation<T> = {
  pathname: string;
} & Partial<Omit<T, 'params'>>;

export function isPathnameLocation<T extends INavigationOptions>(location: any): location is IPathnameLocation<T> {
  return location.pathname !== undefined;
}
export type ILocation<T> = INameLocation<T> | IPathnameLocation<T>;
export interface IRoute {
  id: string;
  name: string;
  path: string;
  query: IQuery;
  params: IQuery;
  state?: unknown;
}

export interface IRouterEventMap {
  [RouteEventType.CHANGE]: (type: RouteActionType, route?: IRouteInfo, transitionOptions?: unknown) => void;
  [RouteEventType.WILL_CHANGE]: (type: RouteActionType, route?: IRouteInfo) => void;
  [RouteEventType.CANCEL_CHANGE]: (routeInfo: IRouteInfo) => void;
  [RouteEventType.DESTROY]: (ids: string[]) => void;
}
export type preActionCallback = (cancel: boolean) => void;
export interface IRouter extends IEventEmitter<IRouterEventMap> {
  readonly currentRouteInfo: IRouteInfo | undefined;
  push<T extends INavigationOptions>(location: string | ILocation<T>): void;
  prepush<T extends INavigationOptions>(location: string | ILocation<T>): preActionCallback;
  pop<T extends IPopNavigationOptions>(option?: T): void;
  prepop<T extends IPopNavigationOptions>(option?: T): preActionCallback;
  replace<T extends INavigationOptions>(location: string | ILocation<T>): void;
  prereplace<T extends INavigationOptions>(location: string | ILocation<T>): preActionCallback;
}

export interface IRouteInfo {
  index: number;
  route: IRoute;
  config: IRouteConfig;
}

export interface INavigationPayload {
  transition: unknown;
}
