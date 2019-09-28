import { Query } from './common';

export interface BaseRouteConfig {
  path: string;
  name?: string;
}
export interface MatchedRoute<T extends BaseRouteConfig> {
  config: T;
  params: Query;
  query: Query;
  hash: string;
  pathname: string;
  // redirected: boolean;
}

export interface RouteManager<T extends BaseRouteConfig> {
  register(route: T): void;
  match(path: string): MatchedRoute<T> | undefined;
  getPathnameByRouteName(name: string, params?: Query): string;
}
