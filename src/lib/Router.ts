import { IRouteRecord, RouteActionType, RouteEventType } from '../interface/common';
import { IRouterDriver, RouteDriverEventType } from '../interface/driver';
import { INavigateOption, IRoute, IRouteConfig, IRouter, IRouterEvent, IRouterOption } from '../interface/router';
import { getPathnameAndQuery } from '../utils/helpers';
import EventEmitter from './EventEmitter';
interface IRouteInfo {
  route: IRoute;
  config: IRouteConfig;
}
export default class Router extends EventEmitter<IRouterEvent> implements IRouter {
  public routes: Map<string, IRouteConfig> = new Map();
  private routeStack: string[] = [];
  private currentRouteInfo: IRouteInfo | undefined = undefined;
  private driver: IRouterDriver;
  constructor(options: IRouterOption, driver: IRouterDriver) {
    super();
    options.routes.forEach(option => this.routes.set(option.path, option));
    this.driver = driver;
    this.initDriverListener();
    this.driver.receiverReady();
  }

  get currentRoute(): IRoute | undefined {
    return this.currentRouteInfo && this.currentRouteInfo.route;
  }

  get currentRouteConfig(): IRouteConfig | undefined {
    return this.currentRouteInfo && this.currentRouteInfo.config;
  }

  public push(pathname: string, option?: Partial<INavigateOption>): void {
    const { path, state } = this.getPathAndState(pathname, option);
    this.driver.push(path, state);
  }

  public pop(): void {
    this.driver.pop();
  }

  public replace(pathname: string, option?: Partial<INavigateOption>): void {
    const { path, state } = this.getPathAndState(pathname, option);
    this.driver.replace(path, state);
  }

  private getPathAndState(path: string, option?: Partial<INavigateOption>) {
    const { pathname, query } = getPathnameAndQuery(path);
    const mergedQuery = Object.assign(query, option && option.query);
    const search = new URLSearchParams();
    Object.keys(mergedQuery).forEach(k => {
      search.append(k, mergedQuery[k]);
    });
    const queryStr = search.toString();
    return {
      path: queryStr ? `${pathname}?${queryStr}` : pathname,
      state: option && option.state
    };
  }

  private matchRoute(path: string) {
    // TODO url match
    const { pathname, query } = getPathnameAndQuery(path);
    const routeConfig = this.routes.get(pathname);
    if (routeConfig === undefined) {
      return undefined;
    }
    return {
      routeConfig,
      query,
      params: {}
    };
  }

  private updateCurrentRoute(id: string, path: string, state: unknown): boolean {
    const matchedRoute = this.matchRoute(path);
    if (matchedRoute === undefined) {
      this.currentRouteInfo = undefined;
      return false;
    }
    const { routeConfig, query, params } = matchedRoute;
    this.currentRouteInfo = {
      route: {
        id,
        name: routeConfig.name || '',
        path,
        query,
        params,
        state
      },
      config: routeConfig
    };
    return true;
  }

  private componentChange(type: RouteActionType): void {
    this.emit(
      RouteEventType.CHANGE,
      type,
      this.currentRouteInfo && this.currentRouteInfo.route,
      this.currentRouteInfo && this.currentRouteInfo.config
    );
  }

  private initDriverListener() {
    this.driver.on(RouteDriverEventType.CHANGE, (routeRecord: IRouteRecord) => this.handleRouteChange(routeRecord));
  }

  private handleRouteChange(routeRecord: IRouteRecord): any {
    const { type, id, path, state } = routeRecord;
    this.updateCurrentRoute(id, path, state);
    this.componentChange(type);
    this.updateRouteRecords(type, id);
  }
  private updateRouteRecords(type: RouteActionType, id: string): void {
    switch (type) {
      case RouteActionType.PUSH:
        this.routeStack.push(id);
        break;
      case RouteActionType.REPLACE:
      case RouteActionType.NONE:
        this.routeStack.pop();
        this.routeStack.push(id);
        break;
      case RouteActionType.POP:
        const index = this.routeStack.findIndex(i => id === i);
        if (index === -1) {
          this.routeStack.push(id);
        } else {
          const destroyedIds = this.routeStack.splice(index + 1, this.routeStack.length - index - 1);
          this.emit(RouteEventType.DESTROY, destroyedIds);
        }

    }
  }
}
