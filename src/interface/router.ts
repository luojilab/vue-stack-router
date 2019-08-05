import { IEventEmitter, IQuery, RouteActionType } from './common';

export interface IRouterOption<T> {
  routes: Array<IRouteConfig<T>>;
  config?: IRouterConfig;
}

export interface IRouterConfig {}

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
}
export interface IBaseNavigationOptions {
  transition: string;
}
export interface INavigationOptions extends IBaseNavigationOptions {
  query: { [key: string]: unknown };
  params: { [key: string]: unknown };
  state: unknown;
}

export interface IPopNavigationOptions extends IBaseNavigationOptions {
  n: number;
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

export interface IRouterEventMap<T> {
  [RouteEventType.CHANGE]: (type: RouteActionType, route?: IRouteInfo<T>, transitionOptions?: unknown) => void;
  [RouteEventType.WILL_CHANGE]: (type: RouteActionType, route?: IRouteInfo<T>, transitionOptions?: unknown) => void;
  [RouteEventType.CANCEL_CHANGE]: (routeInfo: IRouteInfo<T>) => void;
  [RouteEventType.DESTROY]: (ids: string[]) => void;
}

export type preActionCallback = (cancel: boolean) => void;

export interface IRouter<Component> extends IEventEmitter<IRouterEventMap<Component>> {
  readonly currentRouteInfo: IRouteInfo<Component> | undefined;
  push<T extends INavigationOptions>(location: string | ILocation<T>): void;
  prepush<T extends INavigationOptions>(location: string | ILocation<T>): preActionCallback;
  pop<T extends IPopNavigationOptions>(option?: Partial<T>): void;
  prepop<T extends IPopNavigationOptions>(option?: Partial<T>): preActionCallback;
  popToBottom<T extends IBaseNavigationOptions>(option?: Partial<T>): void;
  replace<T extends INavigationOptions>(location: string | ILocation<T>): void;
  prereplace<T extends INavigationOptions>(location: string | ILocation<T>): preActionCallback;
}

export interface IRouteInfo<Component> {
  index: number;
  route: IRoute;
  config: IRouteConfig<Component>;
}

export interface INavigationPayload {
  transition: unknown;
}
