import { IEventEmitter } from '../interface/common';

export default class EventEmitter<T = any> implements IEventEmitter<T> {
  private storage: Map<keyof T, Set<unknown>> = new Map();

  public on<K extends keyof T>(type: K, listener: T[K]): void {
    let listeners = this.storage.get(type);
    if (listeners === undefined) {
      listeners = new Set();
      this.storage.set(type, listeners);
    }
    listeners.add(listener);
  }

  public off<K extends keyof T>(type: K, listener: T[K]): void {
    const listeners = this.storage.get(type);
    if (listeners !== undefined) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.storage.delete(type);
      }
    }
  }

  public emit<K extends keyof T>(type: K, ...params: Parameters<T[K] extends (...args: any[]) => any ? T[K] : never>) {
    const listeners = this.storage.get(type);
    if (listeners !== undefined) {
      listeners.forEach(cb => {
        if (typeof cb === 'function') {
          cb(...params);
        }
      });
    }
  }
}
