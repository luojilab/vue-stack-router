import { RouteActionType } from '../interface/common';
import { DriverEventMap, RouterDriver, RouteRecord, RouteDriverEventType } from '../interface/driver';
import BaseEventEmitter from '../lib/EventEmitter';
import IdGenerator from '../utils/IdGenerator';

// export interface ServerDriverOptions {}

export default class ServerDriver extends BaseEventEmitter<DriverEventMap> implements RouterDriver {
  private stack: RouteRecord[] = [];
  private nextId: string | undefined;
  constructor() {
    super();
    this.initRouteRecord();
  }

  public changePath(path: string): void {
    const top = this.stack[this.stack.length - 1];
    if (top) {
      top.path = path;
    }
  }

  public getCurrentRouteRecord(): RouteRecord {
    return this.stack[this.stack.length - 1];
  }
  public push(path: string, state?: unknown, payload?: unknown): void {
    const id = this.nextId || IdGenerator.generateId();
    this.stack.push({ id, path, state });
    if (this.nextId) this.deprecateNextId();
    this.handleRouteChange(RouteActionType.PUSH, id, path, state, payload);
  }
  public pop(n: number, payload?: unknown): void {
    let count = n < 1 ? 1 : n;
    while (count > 0) {
      this.stack.pop();
      count--;
    }
    const currentRecord = this.stack[this.stack.length - 1];
    if (!currentRecord) return;
    const { id, path, state } = currentRecord;
    this.handleRouteChange(RouteActionType.POP, id, path, state, payload);
  }
  public replace(path: string, state?: unknown, payload?: unknown): void {
    const id = this.nextId || IdGenerator.generateId();
    if (this.nextId) this.deprecateNextId();
    this.stack.pop();
    this.stack.push({ id, path, state });
    this.handleRouteChange(RouteActionType.REPLACE, id, path, state, payload);
  }
  public generateNextId(): string {
    this.nextId = IdGenerator.generateId();
    return this.nextId;
  }
  public deprecateNextId(): void {
    this.nextId = undefined;
  }
  private initRouteRecord(): void {
    this.stack.push({
      id: IdGenerator.generateId(),
      path: '/'
    });
  }
  private handleRouteChange(type: RouteActionType, id: string, path: string, state?: unknown, payload?: unknown): void {
    const routeRecord: RouteRecord = { id, path, state };
    this.emit(RouteDriverEventType.CHANGE, type, routeRecord, payload);
  }
}
