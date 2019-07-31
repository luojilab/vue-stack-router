import { IRouteRecord, RouteActionType, RouteEventType } from '../interface/common';
import { IRouterDriver, RouteDriverEventType } from '../interface/driver';
import { IRouteManager } from '../interface/routeManager';
import {
  ILocation,
  INavigationOptions,
  INavigationPayload,
  IPopNavigationOptions,
  IRouteInfo,
  IRouter,
  IRouterConfig,
  IRouterEventMap,
  IRouterOption,
  isNameLocation,
  isPathnameLocation,
  preActionCallback
} from '../interface/router';
import { getPathnameAndQuery, parseToSearchStr } from '../utils/url';
import EventEmitter from './EventEmitter';
import RouteManager from './route/RouteManager';

type IRouteAndConfig = Omit<IRouteInfo, 'index'>;
/**
 * Router
 *
 * @export
 * @class Router
 * @extends {EventEmitter<IRouterEventMap>}
 * @implements {IRouter}
 */
export default class Router extends EventEmitter<IRouterEventMap> implements IRouter {
  public get currentRouteInfo(): IRouteInfo | undefined {
    const routeAndConfig = this.routeStack[this.routeStack.length - 1];
    if (!routeAndConfig) {
      return;
    }
    return Object.assign(routeAndConfig, { index: this.routeStack.length - 1 });
  }
  private routeManager: IRouteManager;
  private routeStack: IRouteAndConfig[] = [];
  private driver: IRouterDriver;
  private config: IRouterConfig = {};
  constructor(option: IRouterOption, driver: IRouterDriver, routeManager: IRouteManager = new RouteManager()) {
    super();
    this.routeManager = routeManager;
    this.driver = driver;
    Object.assign(this.config, option.config);

    this.initRoute(option);
    this.initDriverListener();
  }

  public prepush<T extends INavigationOptions>(location: string | ILocation<T>): preActionCallback {
    throw new Error('Method not implemented.');
  }

  public prepop<T extends IPopNavigationOptions>(option?: T): preActionCallback {
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
        this.pop(option);
      }
    };
  }

  public prereplace<T extends INavigationOptions>(location: string | ILocation<T>): preActionCallback {
    throw new Error('Method not implemented.');
  }

  /**
   * Push a new page into the stack
   *
   * @param {string | ILocation} location
   * @memberof Router
   */
  public push<T extends INavigationOptions>(location: string | ILocation<T>): void {
    const { path, state, transition } = this.getPathAndState<T>(location);
    this.driver.push(path, state, { transition });
  }

  /**
   * Pop the page on the top of stack
   *
   * @memberof Router
   */
  public pop<T extends IPopNavigationOptions>(option?: T): void {
    this.driver.pop(option);
  }

  /**
   * Pop the current page
   *
   * @memberof Router
   */
  public replace<T extends INavigationOptions>(location: string | ILocation<T>): void {
    const { path, state, transition: transition } = this.getPathAndState<T>(location);
    this.driver.replace(path, state, { transition });
  }

  public on<K extends keyof IRouterEventMap>(type: K, listener: IRouterEventMap[K]): void {
    super.on(type, listener);
    if (type === RouteEventType.CHANGE) {
      this.componentChange(RouteActionType.NONE);
    }
  }

  private initRoute(option: IRouterOption) {
    option.routes.forEach(route => this.routeManager.register(route));
  }

  private getPathAndState<T extends INavigationOptions>(location: string | ILocation<T>) {
    if (typeof location === 'string') {
      return {
        path: location,
        state: undefined,
        transition: undefined
      };
    }
    let pathname = '';
    if (isPathnameLocation(location)) {
      pathname = location.pathname;
    }
    if (isNameLocation(location)) {
      pathname = this.routeManager.getPathnameByRouteName(location.name, location.params) || '';
    }
    let queryStr = '';
    if (location.query) {
      queryStr = parseToSearchStr(location.query);
    }

    return {
      path: `${pathname}${queryStr}`,
      state: location.state,
      transition: location.transition
    };
  }

  private matchRoute(path: string) {
    const { pathname, query } = getPathnameAndQuery(path);
    const matchedRoute = this.routeManager.match(pathname);
    if (matchedRoute === undefined) {
      return undefined;
    }
    return {
      routeConfig: matchedRoute.config,
      query,
      params: matchedRoute.params
    };
  }

  private getRouteInfo(id: string, path: string, state?: unknown): IRouteAndConfig | undefined {
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

  private componentChange(type: RouteActionType, transitionOptions?: unknown): void {
    this.emit(RouteEventType.CHANGE, type, this.currentRouteInfo, transitionOptions);
  }

  private initDriverListener() {
    this.driver.on(RouteDriverEventType.CHANGE, (routeRecord: IRouteRecord) => this.handleRouteChange(routeRecord));
  }

  private handleRouteChange(routeRecord: IRouteRecord): void {
    const { type, id, path, state, payload } = routeRecord;
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo === undefined) {
      return;
    }
    const transition = payload && (payload as INavigationPayload).transition;
    this.updateRouteRecords(type, routeInfo, transition);
  }
  private updateRouteRecords(type: RouteActionType, routeInfo: IRouteAndConfig, transition?: unknown): void {
    switch (type) {
      case RouteActionType.PUSH:
        this.routeStack.push(routeInfo);
        this.componentChange(type, transition);
        break;
      case RouteActionType.REPLACE:
      case RouteActionType.NONE:
        this.routeStack.pop();
        this.routeStack.push(routeInfo);
        this.componentChange(type, transition);
        break;
      case RouteActionType.POP:
        const index = this.routeStack.findIndex(i => routeInfo.route.id === i.route.id);
        if (index === -1) {
          this.routeStack.push(routeInfo);
          this.componentChange(type, transition);
        } else {
          const destroyedIds = this.routeStack
            .splice(index + 1, this.routeStack.length - index - 1)
            .map(r => r.route.id);
          this.componentChange(type, transition);
          this.emit(RouteEventType.DESTROY, destroyedIds);
        }
        break;
      default:
        this.componentChange(type, transition);
    }
  }
}
