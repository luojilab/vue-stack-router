import Vue from 'vue';
import { ViewActionType } from '../interface/common';

export default function invokeHook(component: Vue, hookName: ViewActionType) {
  const hook = component.$options[hookName];
  if (hook) {
    hook.call(component);
  }
  component.$children.forEach(child => invokeHook(child, hookName));
}
