import { IRouteRecord, Omit, RouteActionType, RouteEventType } from '../interface/common';
import { IRouterDriver, RouteDriverEventType } from '../interface/driver';
import {
  INavigateOption,
  IRouteConfig,
  IRouteInfo,
  IRouter,
  IRouterEvent,
  IRouterOption,
  preActionCallback
} from '../interface/router';
import { getPathnameAndQuery } from '../utils/helpers';
import EventEmitter from './EventEmitter';

type IRouteAndConfig = Omit<IRouteInfo, 'index'>;

export default class Router extends EventEmitter<IRouterEvent> implements IRouter {
  public routes: Map<string, IRouteConfig> = new Map();
  public get currentRouteInfo(): IRouteInfo | undefined {
    const routeAndConfig = this.routeStack[this.routeStack.length - 1];
    if (!routeAndConfig) {
      return;
    }
    return Object.assign(routeAndConfig, { index: this.routeStack.length - 1 });
  }
  private routeStack: IRouteAndConfig[] = [];
  private driver: IRouterDriver;
  constructor(options: IRouterOption, driver: IRouterDriver) {
    super();
    options.routes.forEach(option => this.routes.set(option.path, option));
    this.driver = driver;
    this.initDriverListener();
    this.driver.receiverReady();
  }

  public prepush(pathname: string, options?: Partial<INavigateOption>): preActionCallback {
    throw new Error('Method not implemented.');
  }

  public prepop(): preActionCallback {
    const index = this.routeStack.length - 2;

    if (index < 0) {
      return (cancel: boolean) => undefined;
    }
    const nextRouteInfo = Object.assign(this.routeStack[index], { index });
    this.emit(RouteEventType.WILL_CHANGE, RouteActionType.POP, nextRouteInfo);
    return (cancel: boolean) => {
      if (cancel) {
        this.emit(RouteEventType.CANCEL_CHANGE, nextRouteInfo);
      } else {
        this.pop();
      }
    };
  }

  public prereplace(pathname: string, options?: INavigateOption): preActionCallback {
    throw new Error('Method not implemented.');
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

  private getRouteInfo(id: string, path: string, state: unknown): IRouteAndConfig | undefined {
    const matchedRoute = this.matchRoute(path);
    if (matchedRoute === undefined) {
      return;
    }
    const { routeConfig, query, params } = matchedRoute;
    return {
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

  private componentChange(type: RouteActionType): void {
    this.emit(RouteEventType.CHANGE, type, this.currentRouteInfo);
  }

  private initDriverListener() {
    this.driver.on(RouteDriverEventType.CHANGE, (routeRecord: IRouteRecord) => this.handleRouteChange(routeRecord));
  }

  private handleRouteChange(routeRecord: IRouteRecord): void {
    const { type, id, path, state } = routeRecord;
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo === undefined) {
      return;
    }
    this.updateRouteRecords(type, routeInfo);
    this.componentChange(type);
  }
  private updateRouteRecords(type: RouteActionType, routeInfo: IRouteAndConfig): void {
    switch (type) {
      case RouteActionType.PUSH:
        this.routeStack.push(routeInfo);
        break;
      case RouteActionType.REPLACE:
      case RouteActionType.NONE:
        this.routeStack.pop();
        this.routeStack.push(routeInfo);
        break;
      case RouteActionType.POP:
        const index = this.routeStack.findIndex(i => routeInfo.route.id === i.route.id);
        if (index === -1) {
          this.routeStack.push(routeInfo);
        } else {
          const destroyedIds = this.routeStack
            .splice(index + 1, this.routeStack.length - index - 1)
            .map(r => r.route.id);
          this.emit(RouteEventType.DESTROY, destroyedIds);
        }
    }
  }
}
