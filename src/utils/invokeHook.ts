import Vue from 'vue';
import { ViewActionType } from '../interface/common';

export default function invokeHook(component: Vue, hookName: ViewActionType): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hook = (component.$options as any)[hookName];
  if (hook) {
    hook.call(component);
  }
  component.$children.forEach(child => invokeHook(child, hookName));
}
