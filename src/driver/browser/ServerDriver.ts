import {  RouteActionType } from '../../interface/common';
import { IDriverEventMap, IRouterDriver, RouteDriverEventType, IRouteRecord } from '../../interface/driver';
import EventEmitter from '../../lib/EventEmitter';
import IdGenerator from '../../utils/IdGenerator';

interface IHistoryRecord {
  id: string;
  path: string;
  state?: unknown;
}

export default class ServerDriver extends EventEmitter<IDriverEventMap> implements IRouterDriver {
  private stack: IHistoryRecord[] = [];
  private nextId: string | undefined;
  public push(path: string, state?: unknown, payload?: unknown): void {
    const id = this.nextId || IdGenerator.generateId();
    this.stack.push({ id, path, state });
    this.deprecateNextId();
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
    this.deprecateNextId();
    this.stack.pop();
    this.stack.push({ id, path, state });
    this.handleRouteChange(RouteActionType.REPLACE, id, path, state, payload);
  }
  public generateNextId(): string {
    this.nextId = IdGenerator.generateId();
    return this.nextId;
  }
  public deprecateNextId() {
    this.nextId = undefined;
  }
  private handleRouteChange(type: RouteActionType, id: string, path: string, state?: unknown, payload?: unknown) {
    const route: IRouteRecord = { id, path, state, type, payload };
    this.emit(RouteDriverEventType.CHANGE, route);
  }
}
