import { VueConstructor } from 'vue';
import RouterView from '../component/RouterView';
import { IRouter } from '../interface/router';
interface IConnectorOptions {
  router: IRouter;
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
