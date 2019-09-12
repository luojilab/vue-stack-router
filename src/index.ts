import BrowserDriver from './driver/Browser';
import ServerDriver from './driver/Server';
import installer from './lib/installer';
import Router from './lib/Router';
import RouterView from './view/RouterView';

export {
  IEventEmitter,
  RouteActionType,
  ViewActionType,
  ILocation,
  IPathnameLocation,
  INameLocation
} from './interface/common';
export { IDriverEventMap, IRouterDriver, RouteDriverEventType, IRouteRecord } from './interface/driver';
export { IMatchedRoute, IRouteManager } from './interface/routeManager';
export {
  IRouter,
  IRouterEventMap,
  IRouteConfig,
  IRouteInfo,
  IRoute,
  INavigationOptions,
  RouteEventType
} from './interface/router';

export { Router, BrowserDriver, ServerDriver, RouterView, installer };
