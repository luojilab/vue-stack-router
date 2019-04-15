import { IRouter } from './interface/router';

declare module 'vue/types/vue' {
  interface Vue {
    $router: IRouter;
  }
}
