import { IEventEmitter, ILocation, IQuery, RouteActionType } from './common';

export interface IRouterOption<T> {
  routes: Array<IRouteConfig<T>>;
  config?: IRouterConfig;
}

export interface IRouterConfig {
  base: string;
}

export enum RouteEventType {
  WILL_CHANGE = 'willChange',
  CANCEL_CHANGE = 'cancelChange',
  CHANGE = 'change',
  DESTROY = 'destroy'
}

export interface IRouteConfig<T> {
  name?: string;
  path: string;
  component: T;
  transition?: unknown;
  meta?: unknown;
  redirect?:
    | ILocation
    | ((to: { pathname: string; query: { [key: string]: unknown }; params: { [key: string]: unknown } }) => ILocation);
}
export interface IBaseNavigationOptions {
  transition: string;
}
export interface INavigationOptions extends IBaseNavigationOptions {
  state: unknown;
}

export interface IPopNavigationOptions extends IBaseNavigationOptions {
  n: number;
}

export interface IRoute {
  id: string;
  name: string;
  path: string;
  pathname: string;
  query: IQuery;
  params: IQuery;
  state?: unknown;
  redirected: boolean;
}

export interface IRouterEventMap<T> {
  [RouteEventType.CHANGE]: (type: RouteActionType, route?: IRouteInfo<T>, transitionOptions?: unknown) => void;
  [RouteEventType.WILL_CHANGE]: (type: RouteActionType, route?: IRouteInfo<T>, transitionOptions?: unknown) => void;
  [RouteEventType.CANCEL_CHANGE]: (routeInfo: IRouteInfo<T>) => void;
  [RouteEventType.DESTROY]: (ids: string[]) => void;
}

export type preActionCallback = (cancel: boolean) => void;

export interface IRouter<Component> extends IEventEmitter<IRouterEventMap<Component>> {
  readonly currentRouteInfo: IRouteInfo<Component> | undefined;
  registerRoutes(routes: Array<IRouteConfig<Component>>): void;
  push<T extends Partial<INavigationOptions>>(location: ILocation<T>): void;
  prepush<T extends Partial<INavigationOptions>>(location: ILocation<T>): preActionCallback;
  pop<T extends Partial<IPopNavigationOptions>>(option?: T): void;
  prepop<T extends Partial<IPopNavigationOptions>>(option?: T): preActionCallback;
  popToBottom<T extends Partial<IPopNavigationOptions>>(option?: T): void;
  replace<T extends Partial<INavigationOptions>>(location: ILocation<T>): void;
  prereplace<T extends Partial<INavigationOptions>>(location: ILocation<T>): preActionCallback;
}

export interface IRouteInfo<Component> {
  index: number;
  route: IRoute;
  config: IRouteConfig<Component>;
}
