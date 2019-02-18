import { IBaseEventType, IEventEmitter } from '../interface/common';

type Listener<T extends Array<unknown>> = (...params: T) => void;

export default class EventEmitter<T extends IBaseEventType> implements IEventEmitter<T> {
  private storage: Map<keyof T, Set<unknown>> = new Map();

  public on<K extends keyof T>(type: K, listener: Listener<T[K]>): void {
    let listeners = this.storage.get(type);
    if (listeners === undefined) {
      listeners = new Set();
      this.storage.set(type, listeners);
    }
    listeners.add(listener);
  }

  public off<K extends keyof T>(type: K, listener: Listener<T[K]>): void {
    const listeners = this.storage.get(type);
    if (listeners !== undefined) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.storage.delete(type);
      }
    }
  }

  public emit<K extends keyof T>(type: K, ...params: T[K]) {
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
