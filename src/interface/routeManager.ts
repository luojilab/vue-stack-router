import { IQuery } from './common';

export interface IMatchedRoute<T> {
  config: T;
  params: IQuery;
}

export interface IRouteManager<T> {
  register(path: string, name: string | undefined, route: T): void;
  match(path: string): IMatchedRoute<T> | undefined;
  getPathnameByRouteName(name: string, params?: IQuery): string;
}
