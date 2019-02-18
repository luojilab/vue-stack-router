import { IRouteRecord, NavigateActionType } from '../interface/common';
import { IDriverEvent, IRouterDriver } from '../interface/driver';
import EventEmitter from '../lib/EventEmitter';
import idMarker from '../utils/idMaker';

interface IHistoryState {
  __routeState: {
    id: string;
    state: unknown;
  };
}
enum Mode {
  history = 'history',
  hash = 'hash'
}
export interface IWebDriverOptions {
  mode: Mode;
}

export default class BrowserDriver extends EventEmitter<IDriverEvent> implements IRouterDriver {
  private stack: IRouteRecord[] = [];
  private mode = Mode.hash;
  constructor(options?: IWebDriverOptions) {
    super();
    if (options) {
      this.mode = options.mode;
    }
  }

  public receiverReady() {
    this.initRouter();
    this.initListener();
  }

  public push(path: string, state?: unknown): void {
    const id = idMarker();
    const route: IRouteRecord = { id, path, state };
    window.history.pushState({ __routeState: route } as IHistoryState, '', this.getUrl(route));
    this.handlePush(route);
  }

  public pop(): void {
    window.history.back();
  }

  public replace(path: string, state?: unknown): void {
    const id = idMarker();
    const route: IRouteRecord = { id, path, state };
    window.history.replaceState({ __routeState: route } as IHistoryState, '', this.getUrl(route));
    this.handleReplace(route);
  }

  private handlePush(route: IRouteRecord) {
    this.stack.push(route);
    this.emit(NavigateActionType.PUSH, route);
  }

  private handlePopTo(popTo: number) {
    if (this.stack.length === 0 || popTo >= this.stack.length - 1) {
      return;
    }

    const route = this.stack[popTo];
    const destroyedRoute = this.stack.splice(popTo + 1, this.stack.length - popTo - 1);
    this.emit(NavigateActionType.POP, route, destroyedRoute);
  }

  private handleReplace(route: IRouteRecord) {
    this.stack.pop();
    this.stack.push(route);
    this.emit(NavigateActionType.REPLACE, route);
  }

  /**
   * 初始化
   *
   * @private
   * @memberof WebRouterDriver
   */
  private initListener() {
    window.addEventListener('popstate', e => {
      const historyState = e.state as IHistoryState | undefined;
      const routeState = historyState && historyState.__routeState;

      if (routeState && routeState.id) {
        const id = routeState.id;
        const index = this.stack.findIndex(r => r.id === id);
        if (index >= 0) {
          this.handlePopTo(index);
        } else {
          const path = this.getCurrentPath();
          const route: IRouteRecord = { id, path, state: routeState.state };

          this.handlePush(route);
        }
      } else {
        const path = this.getCurrentPath();
        const route: IRouteRecord = { id: idMarker(), path };
        this.handlePush(route);
      }
    });
  }

  private initRouter() {
    const path = this.getCurrentPath();
    this.replace(path || '/');
  }

  private getCurrentPath() {
    const url = new URL(window.location.href);
    if (this.mode === Mode.hash) {
      return this.getPath(new URL(`x:${url.hash.replace(/^#/, '')}`));
    }
    return this.getPath(url);
  }

  private getPath(url: URL) {
    return url.pathname + url.search;
  }

  private getUrl(route: IRouteRecord) {
    return this.mode === Mode.hash ? `#${route.path}` : route.path;
  }
}
