import { Location, RouteActionType } from '../interface/common';
import { RouterDriver, RouteRecord, RouteDriverEventType } from '../interface/driver';
import { RouteManager, MatchedRoute } from '../interface/routeManager';
import {
  BaseNavigationOptions,
  NavigationOptions,
  PopNavigationOptions,
  RouteConfig,
  RouteInfo,
  Router,
  RouterConfig,
  RouterEventMap,
  RouterOption,
  preActionCallback,
  RouteEventType
} from '../interface/router';
import { isNameLocation, isPathnameLocation, normalizePath } from '../utils/helpers';
import { parseToSearchStr } from '../utils/url';
import BaseEventEmitter from './EventEmitter';
import TreeRouteManager from './route/RouteManager';

type IRouteAndConfig<Component> = Omit<RouteInfo<Component>, 'index'>;
interface DriverPayload {
  transition?: string;
}
/**
 * Router
 *
 * @export
 * @class Router
 * @extends {BaseEventEmitter<RouterEventMap<Component>>}
 * @implements {IRouter<Component>}
 * @template Component
 */
export default class StackRouter<Component> extends BaseEventEmitter<RouterEventMap<Component>>
  implements Router<Component> {
  public get currentRouteInfo(): RouteInfo<Component> | undefined {
    const routeAndConfig = this.routeStack[this.routeStack.length - 1];
    if (!routeAndConfig) {
      return;
    }
    return Object.assign(routeAndConfig, { index: this.routeStack.length - 1 });
  }
  private routeManager: RouteManager<RouteConfig<Component>>;
  private routeStack: Array<IRouteAndConfig<Component>> = [];
  private driver: RouterDriver;
  private config: RouterConfig = { base: '/' };

  constructor(
    option: RouterOption<Component>,
    driver: RouterDriver,
    routeManager?: RouteManager<RouteConfig<Component>>
  ) {
    super();
    this.routeManager = routeManager || new TreeRouteManager<RouteConfig<Component>>();
    this.driver = driver;
    Object.assign(this.config, option.config);

    option.routes.forEach(route => this.routeManager.register(route));
    this.initDriverListener();
    this.initRouteInfo();
  }

  public prepush<T extends Partial<NavigationOptions>>(location: Location<T>): preActionCallback {
    const { path, state, transition } = this.getNormalizedLocation<T>(location);
    const id = this.driver.generateNextId();
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo === undefined) {
      this.driver.deprecateNextId();
      return (): void => undefined;
    }
    const nextRouteInfo: RouteInfo<Component> = Object.assign({}, routeInfo, { index: this.routeStack.length });
    this.emit(RouteEventType.WILL_CHANGE, RouteActionType.PUSH, nextRouteInfo, transition);
    return (cancel?: boolean): void => {
      if (cancel) {
        this.driver.deprecateNextId();
        this.emit(RouteEventType.CANCEL_CHANGE, nextRouteInfo);
      } else {
        this.push(location);
      }
    };
  }

  public prepop<T extends Partial<PopNavigationOptions>>(option?: T): preActionCallback {
    let { n = 1 } = option || {};
    if (this.routeStack.length > 1 && n > this.routeStack.length - 1) {
      n = this.routeStack.length - 1;
    }
    const index = this.routeStack.length - n - 1;

    if (index < 0) {
      return (): void => undefined;
    }
    const nextRouteInfo = Object.assign(this.routeStack[index], { index });
    this.emit(RouteEventType.WILL_CHANGE, RouteActionType.POP, nextRouteInfo, option && option.transition);
    return (cancel?: boolean): void => {
      if (cancel) {
        this.emit(RouteEventType.CANCEL_CHANGE, nextRouteInfo);
      } else {
        this.pop(option);
      }
    };
  }

  public prereplace<T extends Partial<NavigationOptions>>(location: Location<T>): preActionCallback {
    const { path, state, transition } = this.getNormalizedLocation<T>(location);
    const id = this.driver.generateNextId();
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo === undefined) {
      this.driver.deprecateNextId();
      return (): void => undefined;
    }
    const nextRouteInfo: RouteInfo<Component> = Object.assign({}, routeInfo, { index: this.routeStack.length - 1 });
    this.emit(RouteEventType.WILL_CHANGE, RouteActionType.REPLACE, nextRouteInfo, transition);
    return (cancel?: boolean): void => {
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
   * @param {string | Location} location
   * @memberof Router
   */
  public push<T extends Partial<NavigationOptions>>(location: Location<T>): void {
    const { path, state, transition } = this.getNormalizedLocation<T>(location);
    const payload: DriverPayload = { transition };
    this.driver.push(path, state, payload);
  }

  /**
   *  Pop the page on the top of stack
   *
   * @template T
   * @param {Partial<T>} [option]
   * @returns {void}
   * @memberof Router
   */
  public pop<T extends Partial<PopNavigationOptions>>(option?: T): void {
    const { n = 1 } = option || {};
    const { transition } = option || {};
    const payload: DriverPayload = { transition };
    this.driver.pop(n, payload);
  }

  /**
   *  Pop the current page
   *
   * @template T
   * @param {(Location<T>)} location
   * @memberof Router
   */
  public replace<T extends Partial<NavigationOptions>>(location: Location<T>): void {
    const { path, state, transition: transition } = this.getNormalizedLocation<T>(location);
    const payload: DriverPayload = { transition };
    this.driver.replace(path, state, payload);
  }

  /**
   * Pop to the bottom stack
   *
   * @template T
   * @param {Partial<T>} [option]
   * @memberof Router
   */
  public popToBottom<T extends BaseNavigationOptions>(option?: Partial<T>): void {
    const popOption = Object.assign({ n: this.routeStack.length - 1 }, option);
    this.pop(popOption);
  }

  public registerRoutes(routes: Array<RouteConfig<Component>>): void {
    routes.forEach(route => this.routeManager.register(route));
    if (this.routeStack.length === 0) {
      this.initRouteInfo();
    }
  }

  private initRouteInfo(): void {
    const { id, path, state } = this.driver.getCurrentRouteRecord();
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo !== undefined) {
      this.routeStack.push(routeInfo);
      if (routeInfo.route.redirected) {
        this.driver.changePath(routeInfo.route.path);
      }
    }
  }

  private initDriverListener(): void {
    this.driver.on(RouteDriverEventType.CHANGE, (type: RouteActionType, routeRecord: RouteRecord, payload: unknown) =>
      this.handleRouteChange(type, routeRecord, payload)
    );
  }

  private getNormalizedLocation<T extends Partial<NavigationOptions>>(
    location: Location<T>
  ): {
    path: string;
    state: unknown;
    transition: string | undefined;
  } {
    if (typeof location === 'string') {
      return {
        path: normalizePath(location),
        state: undefined,
        transition: undefined
      };
    }
    let pathname = '';
    if (isPathnameLocation(location)) {
      pathname = normalizePath(location.pathname);
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

  private matchRoute(
    path: string
  ): MatchedRoute<RouteConfig<Component>> & { redirected: boolean; path: string } | undefined {
    let currentPath = path;
    let matchedRoute = this.routeManager.match(currentPath);
    let redirected = false;
    while (matchedRoute && matchedRoute.config.redirect !== undefined) {
      const {
        params,
        pathname,
        query,
        config: { redirect }
      } = matchedRoute;

      const newLocation = typeof redirect === 'function' ? redirect({ pathname, query, params }) : redirect;
      const normalizedLocation = this.getNormalizedLocation(newLocation);
      if (path === normalizedLocation.path) {
        break;
      }
      matchedRoute = this.routeManager.match(normalizedLocation.path);
      currentPath = normalizedLocation.path;
      redirected = true;
    }
    if (matchedRoute) {
      return Object.assign(matchedRoute, { redirected, path: currentPath });
    }
    // warn('');
  }

  private getRouteInfo(id: string, path: string, state?: unknown): IRouteAndConfig<Component> | undefined {
    const matchedRoute = this.matchRoute(path);
    if (matchedRoute === undefined) {
      return;
    }
    const { config, query, params, pathname, redirected, path: newPath } = matchedRoute;
    return {
      route: {
        id,
        name: config.name || '',
        path: newPath,
        pathname,
        query,
        params,
        state,
        redirected
      },
      config
    };
  }

  private componentChange(type: RouteActionType, transitionOptions?: unknown): void {
    this.emit(RouteEventType.CHANGE, type, this.currentRouteInfo, transitionOptions);
  }

  private handleRouteChange(type: RouteActionType, routeRecord: RouteRecord, payload: unknown): void {
    const { id, path, state } = routeRecord;
    const routeInfo = this.getRouteInfo(id, path, state);
    if (routeInfo === undefined) {
      return;
    }
    if (routeInfo.route.redirected) {
      this.driver.changePath(routeInfo.route.path);
    }
    const transition = this.isDriverPayload(payload) ? payload.transition : undefined;
    this.updateRouteRecords(type, routeInfo, transition);
  }
  private updateRouteRecords(type: RouteActionType, routeInfo: IRouteAndConfig<Component>, transition?: unknown): void {
    switch (type) {
      case RouteActionType.PUSH:
        this.routeStack.push(routeInfo);
        this.componentChange(type, transition);
        break;
      case RouteActionType.REPLACE:
        const preRoute = this.routeStack.pop();
        this.routeStack.push(routeInfo);
        this.componentChange(type, transition);
        if (preRoute) {
          this.emit(RouteEventType.DESTROY, [preRoute.route.id]);
        }
        break;
      case RouteActionType.POP:
        const index = this.routeStack.findIndex(i => routeInfo.route.id === i.route.id);
        if (index === -1) {
          this.routeStack = [routeInfo];
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
  private isDriverPayload(payload: unknown): payload is DriverPayload {
    return typeof payload === 'object' && payload !== null && payload.hasOwnProperty('transition');
  }
}
