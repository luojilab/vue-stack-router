import { Component, VueConstructor } from 'vue';
import { Router } from '../interface/router';
import RouterView from '../view/RouterView';
interface ConnectorOptions {
  router: Router<Component>;
}
export default {
  install(Vue: VueConstructor, options: ConnectorOptions): void {
    if (Vue.prototype.$router) {
      return;
    }
    Vue.component('RouterView', RouterView);

    Object.defineProperty(Vue.prototype, '$router', {
      get() {
        return options.router;
      }
    });
  }
};
