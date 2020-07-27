import BrowserDriver from './driver/Browser';
import ServerDriver from './driver/Server';
import installer from './lib/installer';
import Router from './lib/Router';
import RouterView from './view/RouterView';
import BaseEventEmitter from './lib/EventEmitter';

export {
  EventEmitter as IEventEmitter,
  RouteActionType,
  ViewActionType,
  Location as ILocation,
  PathnameLocation as IPathnameLocation,
  NameLocation as INameLocation
} from './interface/common';
export { DriverEventMap as IDriverEventMap, RouterDriver as IRouterDriver, RouteDriverEventType, RouteRecord as IRouteRecord } from './interface/driver';
export { MatchedRoute as IMatchedRoute, RouteManager as IRouteManager } from './interface/routeManager';
export {
  Router as IRouter,
  RouterEventMap as IRouterEventMap,
  RouteConfig as IRouteConfig,
  RouteInfo as IRouteInfo,
  Route as IRoute,
  NavigationOptions as INavigationOptions,
  RouteEventType
} from './interface/router';

export { Router, BrowserDriver, ServerDriver, RouterView, installer, BaseEventEmitter as EventEmitter };
