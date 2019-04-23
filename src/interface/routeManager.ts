import { IQuery } from './common';
import { IRouteConfig } from './router';
export interface IMatchedRoute {
  config: IRouteConfig;
  params: IQuery;
}
export interface IRouteManager {
  register(route: IRouteConfig): void;
  match(path: string): IMatchedRoute | undefined;
  getPathnameByRouteName(name: string, params?: IQuery): string;
}
