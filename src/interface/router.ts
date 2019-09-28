import { EventEmitter, Location, Query, RouteActionType } from './common';

export interface RouterOption<T> {
  routes: Array<RouteConfig<T>>;
  config?: RouterConfig;
}

export interface RouterConfig {
  base: string;
}

export enum RouteEventType {
  WILL_CHANGE = 'willChange',
  CANCEL_CHANGE = 'cancelChange',
  CHANGE = 'change',
  DESTROY = 'destroy'
}

export interface RouteConfig<T> {
  name?: string;
  path: string;
  component: T;
  transition?: unknown;
  meta?: unknown;
  redirect?:
    | Location
    | ((to: { pathname: string; query: { [key: string]: unknown }; params: { [key: string]: unknown } }) => Location);
}
export interface BaseNavigationOptions {
  transition: string;
}
export interface NavigationOptions extends BaseNavigationOptions {
  state: unknown;
}

export interface PopNavigationOptions extends BaseNavigationOptions {
  n: number;
}

export interface Route {
  id: string;
  name: string;
  path: string;
  pathname: string;
  query: Query;
  params: Query;
  state?: unknown;
  redirected: boolean;
}

export interface RouterEventMap<T> {
  [RouteEventType.CHANGE]: (type: RouteActionType, route?: RouteInfo<T>, transitionOptions?: unknown) => void;
  [RouteEventType.WILL_CHANGE]: (type: RouteActionType, route?: RouteInfo<T>, transitionOptions?: unknown) => void;
  [RouteEventType.CANCEL_CHANGE]: (routeInfo: RouteInfo<T>) => void;
  [RouteEventType.DESTROY]: (ids: string[]) => void;
}

export type preActionCallback = (cancel?: boolean) => void;

export interface Router<Component> extends EventEmitter<RouterEventMap<Component>> {
  readonly currentRouteInfo: RouteInfo<Component> | undefined;
  registerRoutes(routes: Array<RouteConfig<Component>>): void;
  push<T extends Partial<NavigationOptions>>(location: Location<T>): void;
  prepush<T extends Partial<NavigationOptions>>(location: Location<T>): preActionCallback;
  pop<T extends Partial<PopNavigationOptions>>(option?: T): void;
  prepop<T extends Partial<PopNavigationOptions>>(option?: T): preActionCallback;
  popToBottom<T extends Partial<PopNavigationOptions>>(option?: T): void;
  replace<T extends Partial<NavigationOptions>>(location: Location<T>): void;
  prereplace<T extends Partial<NavigationOptions>>(location: Location<T>): preActionCallback;
}

export interface RouteInfo<Component> {
  index: number;
  route: Route;
  config: RouteConfig<Component>;
}
