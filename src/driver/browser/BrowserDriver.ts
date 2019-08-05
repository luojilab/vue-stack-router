import { RouteActionType } from '../../interface/common';
import { IDriverEventMap, IRouterDriver, RouteDriverEventType, IRouteRecord } from '../../interface/driver';
import EventEmitter from '../../lib/EventEmitter';
import IdGenerator from '../../utils/IdGenerator';
interface IHistoryRouteState {
  __routeState: {
    id: string;
    state: unknown;
  };
}
export enum Mode {
  history = 'history',
  hash = 'hash'
}
export interface IWebDriverOptions {
  mode: Mode;
}

export default class BrowserDriver extends EventEmitter<IDriverEventMap> implements IRouterDriver {
  private currentId: string;
  private nextId: string | undefined;
  private initial: boolean = false;
  private popPayloads: Array<unknown> = [];
  private documentLoaded = false;
  private mode = Mode.hash;
  constructor(options?: IWebDriverOptions) {
    super();
    if (options) {
      this.mode = options.mode;
    }
    this.currentId = IdGenerator.generateId();
    this.handleDocumentLoaded();
  }
  public generateNextId(): string {
    this.nextId = IdGenerator.generateId();
    return this.nextId;
  }
  public deprecateNextId() {
    this.nextId = undefined;
  }

  public push(path: string, state?: unknown, payload?: unknown): void {
    const id = this.nextId || IdGenerator.generateId();
    this.deprecateNextId();
    window.history.pushState({ __routeState: { id, state } } as IHistoryRouteState, '', this.getUrl(path));
    this.handleRouteChange(RouteActionType.PUSH, id, path, state, payload);
  }

  public pop(n: number, payload?: unknown): void {
    if (payload !== undefined) {
      this.popPayloads.push(payload);
    }
    const delta = n < 1 ? -1 : -n;
    window.history.go(delta);
  }

  public replace(path: string, state?: unknown, payload?: unknown): void {
    const id = this.nextId || IdGenerator.generateId();
    this.deprecateNextId();
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
    if (window.document.readyState === 'complete') {
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

  private handleRouteChange(type: RouteActionType, id: string, path: string, state?: unknown, payload?: unknown) {
    this.currentId = id;
    const route: IRouteRecord = { id, path, state, type, payload };
    this.emit(RouteDriverEventType.CHANGE, route);
  }

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
    this.deprecateNextId();
    const historyState = e.state as IHistoryRouteState | null;
    const routeState = historyState && historyState.__routeState;
    if (routeState) {
      const { id, state } = routeState;

      const path = this.getCurrentPath();
      const type = IdGenerator.compare(id, this.currentId) > 0 ? RouteActionType.PUSH : RouteActionType.POP;
      const payload = this.popPayloads.shift();
      this.handleRouteChange(type, id, path, state, payload);
    } else {
      const path = this.getCurrentPath();
      const id = IdGenerator.generateId();
      window.history.replaceState({ __routeState: { id } } as IHistoryRouteState, '', this.getUrl(path));
      this.handleRouteChange(RouteActionType.PUSH, id, path);
    }
  }

  private initRouter() {
    const path = this.getCurrentPath() || '/';
    let id: string;
    let state: unknown;
    const currentState = window.history.state as IHistoryRouteState;
    if (!currentState || currentState.__routeState === undefined) {
      id = this.currentId;
      window.history.replaceState({ __routeState: { id } } as IHistoryRouteState, '', this.getUrl(path));
    } else {
      id = currentState.__routeState.id;
      state = currentState.__routeState.state;
    }
    this.handleRouteChange(RouteActionType.NONE, id, path, state);
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
