import { EventEmitter } from '../interface/common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class BaseEventEmitter<T = unknown> implements EventEmitter<T> {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit<K extends keyof T>(type: K, ...params: Parameters<T[K] extends (...args: any[]) => any ? T[K] : never>): void {
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
