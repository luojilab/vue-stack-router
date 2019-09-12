import { ILocation, IQuery } from './common';

export interface IBaseRouteConfig {
  path: string;
  name?: string;
}
export interface IMatchedRoute<T extends IBaseRouteConfig> {
  config: T;
  params: IQuery;
  query: IQuery;
  hash: string;
  pathname: string;
  // redirected: boolean;
}

export interface IRouteManager<T extends IBaseRouteConfig> {
  register(route: T): void;
  match(path: string): IMatchedRoute<T> | undefined;
  getPathnameByRouteName(name: string, params?: IQuery): string;
}
