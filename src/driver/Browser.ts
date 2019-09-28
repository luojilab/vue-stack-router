import { RouteActionType } from '../interface/common';
import { DriverEventMap, RouterDriver, RouteRecord, RouteDriverEventType } from '../interface/driver';
import BaseEventEmitter from '../lib/EventEmitter';
import { normalizePath } from '../utils/helpers';
import IdGenerator from '../utils/IdGenerator';

interface HistoryRouteState {
  __routeState: {
    id: string;
    state: unknown;
  };
}

export enum Mode {
  history = 'history',
  hash = 'hash'
}

export interface WebDriverOptions {
  mode: Mode;
}

export default class BrowserDriver extends BaseEventEmitter<DriverEventMap> implements RouterDriver {
  private currentRouteRecord: RouteRecord;
  private nextId: string | undefined;
  private popPayloads: Array<unknown> = [];
  private documentLoaded = false;
  private mode = Mode.hash;
  constructor(options?: WebDriverOptions) {
    super();
    if (options) {
      this.mode = options.mode;
    }
    this.currentRouteRecord = this.getInitRouteRecord();
    this.handleDocumentLoaded();
    this.initListener();
  }

  public getCurrentRouteRecord(): RouteRecord {
    return this.currentRouteRecord;
  }
  public generateNextId(): string {
    this.nextId = IdGenerator.generateId();
    return this.nextId;
  }
  public deprecateNextId(): void {
    this.nextId = undefined;
  }
  public changePath(path: string): void {
    const state = window.history.state;
    window.history.replaceState(state, '', this.getUrl(path));
  }
  public push(path: string, state?: unknown, payload?: unknown): void {
    const id = this.nextId || IdGenerator.generateId();
    if (this.nextId) this.deprecateNextId();
    window.history.pushState({ __routeState: { id, state } } as HistoryRouteState, '', this.getUrl(path));
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
    if (this.nextId) this.deprecateNextId();
    window.history.replaceState({ __routeState: { id, state } } as HistoryRouteState, '', this.getUrl(path));
    this.handleRouteChange(RouteActionType.REPLACE, id, path, state, payload);
  }

  private handleDocumentLoaded(): void {
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

  private handleRouteChange(type: RouteActionType, id: string, path: string, state?: unknown, payload?: unknown): void {
    const routeRecord: RouteRecord = { id, path, state };
    this.currentRouteRecord = routeRecord;
    this.emit(RouteDriverEventType.CHANGE, type, routeRecord, payload);
  }

  private initListener(): void {
    window.addEventListener('popstate', e => {
      // Old safari will emit a 'popstate' event on page load
      if (!this.documentLoaded) {
        return;
      }
      this.handlePopstate(e);
    });
  }
  private handlePopstate(e: PopStateEvent): void {
    if (this.nextId) this.deprecateNextId();
    const historyState = e.state as HistoryRouteState | null;
    const routeState = historyState && historyState.__routeState;
    if (routeState) {
      const { id, state } = routeState;

      const path = this.getCurrentPath();
      const type = IdGenerator.compare(id, this.currentRouteRecord.id) > 0 ? RouteActionType.PUSH : RouteActionType.POP;
      const payload = this.popPayloads.shift();
      this.handleRouteChange(type, id, path, state, payload);
    } else {
      const path = this.getCurrentPath();
      const id = IdGenerator.generateId();
      window.history.replaceState({ __routeState: { id } } as HistoryRouteState, '', this.getUrl(path));
      this.handleRouteChange(RouteActionType.PUSH, id, path);
    }
  }

  private getInitRouteRecord(): RouteRecord {
    const path = this.getCurrentPath();
    let id: string;
    let state: unknown;
    const currentState = window.history.state as HistoryRouteState;
    if (!currentState || currentState.__routeState === undefined) {
      id = IdGenerator.generateId();
      window.history.replaceState({ __routeState: { id } } as HistoryRouteState, '', this.getUrl(path));
    } else {
      id = currentState.__routeState.id;
      state = currentState.__routeState.state;
    }
    return { id, path, state };
  }

  private getCurrentPath(): string {
    const url = new URL(window.location.href);
    let path: string;
    if (this.mode === Mode.hash) {
      path = this.getPath(new URL(`http://x.com/${url.hash.replace(/^#/, '')}`));
    } else {
      path = this.getPath(url);
    }
    return normalizePath(path);
  }

  private getPath(url: URL): string {
    return url.pathname + url.search;
  }

  private getUrl(path: string): string {
    return this.mode === Mode.hash ? `#${path}` : path;
  }
}
