import { Query } from '../../interface/common';
import { BaseRouteConfig, MatchedRoute, RouteManager } from '../../interface/routeManager';
import { normalizePath } from '../../utils/helpers';
import { parseUrl } from '../../utils/url';
import PathTree from './PathTree';

export default class TreeRouteManager<T extends BaseRouteConfig> implements RouteManager<T> {
  private pathRoute: PathTree<T> = new PathTree();
  private nameRoute: Map<string, T> = new Map();
  public getPathnameByRouteName(name: string, params?: Query): string {
    const route = this.nameRoute.get(name);
    if (route === undefined) {
      return '';
    }
    const normalizedPath = normalizePath(route.path);

    if (normalizedPath.indexOf(':') > -1) {
      if (params === undefined) {
        return '';
      }
      return normalizedPath.split('/').reduce((pre, val, index) => {
        let path = val;
        if (val[0] === ':') {
          path = String(params && params[path.replace(/\:/, '')]);
        }
        return index === 0 ? path : `${pre}/${path}`;
      });
    }
    return normalizedPath;
  }
  public register(route: T): void {
    const normalizedPath = normalizePath(route.path);
    this.pathRoute.addPath(normalizedPath.split('/'), route);
    if (route.name) {
      this.nameRoute.set(route.name, route);
    }
  }
  public match(path: string): MatchedRoute<T> | undefined {
    const normalizedPath = normalizePath(path);
    const { pathname, query, hash } = parseUrl(normalizedPath);
    const pathRoute = this.pathRoute.getDataAndParamsByPaths(pathname.split('/'));
    if (pathRoute === undefined) {
      return;
    }

    return {
      config: pathRoute.data,
      pathname,
      query,
      params: pathRoute.params,
      hash
    };
  }
}
