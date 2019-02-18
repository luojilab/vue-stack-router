import { IRouteRecord, NavigateActionType } from '../interface/common';
import { IRouterDriver } from '../interface/driver';
import {
  INavigateOption,
  IRoute,
  IRouteConfig,
  IRouter,
  IRouterEvent,
  IRouterOption,
  RouterEventType
} from '../interface/router';
import { getPathnameAndQuery } from '../utils/helpers';
import EventEmitter from './EventEmitter';
interface IRouteInfo {
  route: IRoute;
  config: IRouteConfig;
}
export default class Router extends EventEmitter<IRouterEvent> implements IRouter {
  public routes: Map<string, IRouteConfig> = new Map();
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

  get currentRouteConfig():IRouteConfig | undefined {
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

  private handlePush(route: IRouteRecord): void {
    this.updateCurrentRoute(route);
    this.componentChange(NavigateActionType.PUSH);
  }

  private handlePop(route: IRouteRecord, destroyedRoute: IRouteRecord[]) {
    this.updateCurrentRoute(route);
    this.componentChange(NavigateActionType.POP);
    const ids = destroyedRoute.map(r => r.id);
    this.emit(RouterEventType.DESTROY, ids);
  }

  private handleReplace(route: IRouteRecord) {
    this.updateCurrentRoute(route);
    this.componentChange(NavigateActionType.REPLACE);
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

  private updateCurrentRoute(route: IRouteRecord): void {
    const { id, path, state } = route;
    const matchedRoute = this.matchRoute(path);
    if (matchedRoute === undefined) {
      this.currentRouteInfo = undefined;
      return;
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
  }

  private componentChange(type: NavigateActionType): void {
    this.emit(
      RouterEventType.CHANGE,
      type,
      this.currentRouteInfo && this.currentRouteInfo.route,
      this.currentRouteInfo && this.currentRouteInfo.config
    );
  }

  private initDriverListener() {
    this.driver.on(NavigateActionType.POP, (r: IRouteRecord, destroyedRoute: IRouteRecord[] = []) =>
      this.handlePop(r, destroyedRoute)
    );
    this.driver.on(NavigateActionType.PUSH, (r: IRouteRecord) => this.handlePush(r));
    this.driver.on(NavigateActionType.REPLACE, (r: IRouteRecord) => this.handleReplace(r));
  }
}
