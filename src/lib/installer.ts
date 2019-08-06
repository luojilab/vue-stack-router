import { Component, VueConstructor } from 'vue';
import { IRouter } from '../interface/router';
import RouterView from '../view/RouterView';
interface IConnectorOptions {
  router: IRouter<Component>;
}
export default {
  install(Vue: VueConstructor, options: IConnectorOptions) {
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
