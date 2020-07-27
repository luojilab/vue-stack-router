import Vue from 'vue';
import { ViewActionType } from '../interface/common';

export default function invokeHook(component: Vue, hookName: ViewActionType): void {
  const hook = component.$options[hookName] as (() => void) | undefined;
  if (hook) {
    hook.call(component);
  }
  component.$children.forEach(child => invokeHook(child, hookName));
}
