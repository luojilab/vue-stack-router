import { IBaseEventType, IEventEmitter, IRouteRecord, NavigateActionType } from './common';
export interface IDriverEvent extends IBaseEventType {
  [NavigateActionType.PUSH]: [IRouteRecord];
  [NavigateActionType.REPLACE]: [IRouteRecord];
  [NavigateActionType.POP]: [IRouteRecord, IRouteRecord[]];
}
export interface IRouterDriver extends IEventEmitter<IDriverEvent> {
  push(path: string, state?: unknown): void;
  pop(): void;
  replace(path: string, state?: unknown): void;
  receiverReady(): void;
}
