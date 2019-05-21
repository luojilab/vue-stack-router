import { IRouteRecord, RouteActionType } from '../../interface/common';
import { IDriverEventMap, IRouterDriver, RouteDriverEventType } from '../../interface/driver';
import EventEmitter from '../../lib/EventEmitter';
import idMarker from './idMarker';
interface IHistoryRouteState {
  __routeState: {
    id: number;
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

export default class BrowserDriver extends EventEmitter<IDriverEventMap> implements IRouterDriver {
  private currentId: number = 0;
  private initial: boolean = false;
  private popPayloads: Array<unknown> = [];
  private documentLoaded = false;
  private mode = Mode.hash;
  constructor(options?: IWebDriverOptions) {
    super();
    if (options) {
      this.mode = options.mode;
    }
    this.handleDocumentLoaded();
  }

  public push(path: string, state?: unknown, payload?: unknown): void {
    const id = idMarker();
    window.history.pushState({ __routeState: { id, state } } as IHistoryRouteState, '', this.getUrl(path));
    this.handleRouteChange(RouteActionType.PUSH, id, path, state, payload);
  }

  public pop(payload?: unknown): void {
    if (payload !== undefined) {
      this.popPayloads.push(payload);
    }
    window.history.back();
  }

  public replace(path: string, state?: unknown, payload?: unknown): void {
    const id = idMarker();
    window.history.replaceState({ __routeState: { id, state } } as IHistoryRouteState, '', this.getUrl(path));
    this.handleRouteChange(RouteActionType.REPLACE, id, path, state, payload);
  }

  public on<K extends keyof IDriverEventMap>(type: K, listener: IDriverEventMap[K]): void {
    super.on(type, listener);
    if (!this.initial) {
      this.init();
      this.initial = true;
    }
  }

  private handleDocumentLoaded() {
    if (document.readyState === 'complete') {
      this.documentLoaded = true;
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.documentLoaded = true;
        }, 0);
      });
    }
  }

  private init() {
    this.initRouter();
    this.initListener();
  }

  private handleRouteChange(type: RouteActionType, id: number, path: string, state?: unknown, payload?: unknown) {
    this.currentId = id;
    const route: IRouteRecord = { id: String(id), path, state, type, payload };
    this.emit(RouteDriverEventType.CHANGE, route);
  }

  /**
   * 初始化
   *
   * @private
   * @memberof WebRouterDriver
   */
  private initListener() {
    window.addEventListener('popstate', e => {
      // Old safari will emit a 'popstate' event on page load
      if (!this.documentLoaded) {
        return;
      }
      this.handlePopstate(e);
    });
  }
  private handlePopstate(e: PopStateEvent) {
    const historyState = e.state as IHistoryRouteState | null;
    const routeState = historyState && historyState.__routeState;
    if (routeState) {
      const { id, state } = routeState;
      const path = this.getCurrentPath();
      const type = id > this.currentId ? RouteActionType.PUSH : RouteActionType.POP;
      const payload = this.popPayloads.shift();
      this.handleRouteChange(type, id, path, state, payload);
    } else {
      const path = this.getCurrentPath();
      const id = idMarker();
      window.history.replaceState({ __routeState: { id } } as IHistoryRouteState, '', this.getUrl(path));
      this.handleRouteChange(RouteActionType.PUSH, id, path);
    }
  }

  private initRouter() {
    const path = this.getCurrentPath() || '/';
    const id = idMarker();
    window.history.replaceState({ __routeState: { id } } as IHistoryRouteState, '', this.getUrl(path));
    this.handleRouteChange(RouteActionType.NONE, id, path);
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

  private getUrl(path: string) {
    return this.mode === Mode.hash ? `#${path}` : path;
  }
}
