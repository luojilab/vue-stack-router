import VueStackRouter from './lib/Router';

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueStackRouter;
  }
}
