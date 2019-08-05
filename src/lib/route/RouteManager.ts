import { IQuery } from '../../interface/common';
import { IMatchedRoute, IRouteManager } from '../../interface/routeManager';
import PathTree from './PathTree';

export default class RouteManager<T> implements IRouteManager<T> {
  private pathRoute: PathTree<T> = new PathTree();
  private nameRoute: Map<string, { path: string; route: T }> = new Map();
  public getPathnameByRouteName(name: string, params?: IQuery): string {
    const route = this.nameRoute.get(name);
    if (route === undefined) {
      return '';
    }
    const normalizedPath = this.normalizePath(route.path);

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
  public register(path: string, name: string | undefined, route: T): void {
    const normalizedPath = this.normalizePath(path);
    this.pathRoute.addPath(normalizedPath.split('/'), route);
    if (name) {
      this.nameRoute.set(name, { path, route });
    }
  }
  public match(path: string): IMatchedRoute<T> | undefined {
    const normalizedPath = this.normalizePath(path);
    const pathRoute = this.pathRoute.getDataAndParamsByPaths(normalizedPath.split('/'));
    if (pathRoute === undefined) {
      return;
    }
    return {
      config: pathRoute.data,
      params: pathRoute.params
    };
  }

  private normalizePath(path: string): string {
    return path.replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, '');
  }
}
