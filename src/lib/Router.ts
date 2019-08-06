import { RouteActionType } from '../interface/common';
import { IRouterDriver, IRouteRecord, RouteDriverEventType } from '../interface/driver';
import { IRouteManager } from '../interface/routeManager';
import {
  IBaseNavigationOptions,
  ILocation,
  INavigationOptions,
  INavigationPayload,
  IPopNavigationOptions,
  IRouteConfig,
  IRouteInfo,
  IRouter,
  IRouterConfig,
  IRouterEventMap,
  IRouterOption,
  isNameLocation,
  isPathnameLocation,
  preActionCallback,
  RouteEventType
} from '../interface/router';
import { getPathnameAndQuery, parseToSearchStr } from '../utils/url';
import EventEmitter from './EventEmitter';
import RouteManager from './route/RouteManager';

type IRouteAndConfig<Component> = Omit<IRouteInfo<Component>, 'index'>;
/**
 * Router
 *
 * @export
 * @class Router
 * @extends {EventEmitter<IRouterEventMap<Component>>}
 * @implements {IRouter<Component>}
 * @template Component
 */
export default class Router<Component> extends EventEmitter<IRouterEventMap<Component>> implements IRouter<Component> {
  public get currentRouteInfo(): IRouteInfo<Component> | undefined {
    const routeAndConfig = this.routeStack[this.routeStack.length - 1];
    if (!routeAndConfig) {
      return;
    }
    return Object.assign(routeAndConfig, { index: this.routeStack.length - 1 });
  }
  private routeManager: IRouteManager<IRouteConfig<Component>>;
  private routeStack: Array<IRouteAndConfig<Component>> = [];
  private driver: IRouterDriver;
  private config: IRouterConfig = {};

  constructor(
    option: IRouterOption<Component>,
    driver: IRouterDriver,
    routeManager?: IRouteManager<IRouteConfig<Component>>
  ) {
    super();
    this.routeManager = routeManager || new RouteManager<IRouteConfig<Component>>();
    this.driver = driver;
    Object.assign(this.config, option.config);

    this.initRoute(option);
    this.initDriverListener();
    this.initRouteInfo();
  }

  public prepush<T extends INavigationOptions>(location: string | ILocation<T>): preActionCallback {
    const { path, state, transition } = this.getPathAndState<T>(location);
    const id = this.driver.generateNextId();
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo === undefined) {
      this.driver.deprecateNextId();
      return (cancel: boolean) => undefined;
    }
    const nextRouteInfo: IRouteInfo<Component> = Object.assign({}, routeInfo, { index: this.routeStack.length });
    this.emit(RouteEventType.WILL_CHANGE, RouteActionType.PUSH, nextRouteInfo, transition);
    return (cancel: boolean) => {
      if (cancel) {
        this.driver.deprecateNextId();
        this.emit(RouteEventType.CANCEL_CHANGE, nextRouteInfo);
      } else {
        this.push(location);
      }
    };
  }

  public prepop<T extends IPopNavigationOptions>(option?: Partial<T>): preActionCallback {
    const index = this.routeStack.length - 2;

    if (index < 0) {
      return (cancel: boolean) => undefined;
    }
    const nextRouteInfo = Object.assign(this.routeStack[index], { index });
    this.emit(RouteEventType.WILL_CHANGE, RouteActionType.POP, nextRouteInfo, option && option.transition);
    return (cancel: boolean) => {
      if (cancel) {
        this.emit(RouteEventType.CANCEL_CHANGE, nextRouteInfo);
      } else {
        this.pop(option);
      }
    };
  }

  public prereplace<T extends INavigationOptions>(location: string | ILocation<T>): preActionCallback {
    const { path, state, transition } = this.getPathAndState<T>(location);
    const id = this.driver.generateNextId();
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo === undefined) {
      this.driver.deprecateNextId();
      return (cancel: boolean) => undefined;
    }
    const nextRouteInfo: IRouteInfo<Component> = Object.assign({}, routeInfo, { index: this.routeStack.length - 1 });
    this.emit(RouteEventType.WILL_CHANGE, RouteActionType.REPLACE, nextRouteInfo, transition);
    return (cancel: boolean) => {
      if (cancel) {
        this.driver.deprecateNextId();
        this.emit(RouteEventType.CANCEL_CHANGE, nextRouteInfo);
      } else {
        this.replace(location);
      }
    };
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
   *  Pop the page on the top of stack
   *
   * @template T
   * @param {Partial<T>} [option]
   * @returns {void}
   * @memberof Router
   */
  public pop<T extends IPopNavigationOptions>(option?: Partial<T>): void {
    if (this.routeStack.length <= 1) return;
    let n: number = (option && option.n) || 1;
    if (n > this.routeStack.length - 1) {
      n = this.routeStack.length - 1;
    }
    this.driver.pop(n, option);
  }

  /**
   *  Pop the current page
   *
   * @template T
   * @param {(string | ILocation<T>)} location
   * @memberof Router
   */
  public replace<T extends INavigationOptions>(location: string | ILocation<T>): void {
    const { path, state, transition: transition } = this.getPathAndState<T>(location);
    this.driver.replace(path, state, { transition });
  }

  /**
   * Pop to the bottom stack
   *
   * @template T
   * @param {Partial<T>} [option]
   * @memberof Router
   */
  public popToBottom<T extends IBaseNavigationOptions>(option?: Partial<T>): void {
    const popOption = Object.assign({ n: this.routeStack.length - 1 }, option);
    this.pop(popOption);
  }

  private initRoute(option: IRouterOption<Component>) {
    option.routes.forEach(route => this.routeManager.register(route.path, route.name, route));
  }

  private initRouteInfo() {
    const { id, path, state } = this.driver.getCurrentRouteRecord();
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo !== undefined) {
      this.routeStack.push(routeInfo);
    }
  }

  private initDriverListener() {
    this.driver.on(RouteDriverEventType.CHANGE, (type: RouteActionType, routeRecord: IRouteRecord, payload: unknown) =>
      this.handleRouteChange(type, routeRecord, payload)
    );
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

  private getRouteInfo(id: string, path: string, state?: unknown): IRouteAndConfig<Component> | undefined {
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

  private handleRouteChange(type: RouteActionType, routeRecord: IRouteRecord, payload: unknown): void {
    const { id, path, state } = routeRecord;
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo === undefined) {
      return;
    }
    const transition = payload && (payload as INavigationPayload).transition;
    this.updateRouteRecords(type, routeInfo, transition);
  }
  private updateRouteRecords(type: RouteActionType, routeInfo: IRouteAndConfig<Component>, transition?: unknown): void {
    switch (type) {
      case RouteActionType.PUSH:
        this.routeStack.push(routeInfo);
        this.componentChange(type, transition);
        break;
      case RouteActionType.REPLACE:
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
