import { IQuery } from '../../interface/common';
import { IMatchedRoute, IRouteManager } from '../../interface/routeManager';
import { IRouteConfig } from '../../interface/router';
import PathTree from './PathTree';

export default class RouteManager implements IRouteManager {
  private pathRoute: PathTree<IRouteConfig> = new PathTree();
  private nameRoute: Map<string, IRouteConfig> = new Map();
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
  public register(route: IRouteConfig): void {
    const normalizedPath = this.normalizePath(route.path);
    this.pathRoute.addPath(normalizedPath.split('/'), route);
    if (route.name) {
      this.nameRoute.set(route.name, route);
    }
  }
  public match(path: string): IMatchedRoute | undefined {
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
