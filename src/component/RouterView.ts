import Vue, { CreateElement, VNode } from 'vue';
import { NavigateActionType } from '../interface/common';
import { IRoute, IRouteConfig, IRouter, RouterEventType } from '../interface/router';

interface IData {
  currentPageId?: string;
  preRouter?: IRoute;
  currentRoute?: IRoute;
  currentRouteConfig?: IRouteConfig;
  vnodeCache: Map<string, VNode>;
  actionType: NavigateActionType;
}
interface ITransitionDurationConfig {
  enter: number;
  leave: number;
}
interface ITransitionOptions {
  name: string;
  duration: number | ITransitionDurationConfig;
  mode: string;
}
type PropsTypes<T> = () => T;
interface IPageViewProps {
  path: string;
  query: { [key: string]: string };
  params: { [key: string]: string };
  state?: any;
}

export default Vue.extend({
  name: 'RouterView',
  data(): IData {
    return {
      currentPageId: '',
      vnodeCache: new Map(),
      actionType: NavigateActionType.NONE
    };
  },
  props: {
    router: {
      type: Object as PropsTypes<IRouter | undefined>,
      required: false
    },
    transition: {
      type: Object as PropsTypes<ITransitionOptions | undefined>,
      required: false
    }
  },
  render(h: CreateElement): VNode {
    if (!this.currentPageId || !this.currentRoute || !this.currentRouteConfig) {
      return h();
    }

    const cachedVNode = this.vnodeCache.get(this.currentPageId || '');
    const vnode = h(this.currentRouteConfig.component, {
      props: this.getPageViewProps()
    });
    if (cachedVNode !== undefined) {
      vnode.componentInstance = cachedVNode.componentInstance;
    }
    this.vnodeCache.set(this.currentRoute.id, vnode);
    vnode.data!.keepAlive = true;
    if (this.transition) {
      const vnodeData = {
        props: this.getTransitionProps(),
        on: this.getTransitionListener()
      };
      return h('transition', vnodeData, [vnode]);
    }
    return vnode;
  },
  created() {
    const router = this.getRouter();
    this.currentRoute = router.currentRoute;
    this.currentRouteConfig = router.currentRouteConfig;
    this.currentPageId = this.currentRoute && this.currentRoute.id;
    router.on(RouterEventType.CHANGE, this.handleRouteChange);
    router.on(RouterEventType.DESTROY, this.handleRouteDestroy);
  },
  methods: {
    getRouter() {
      return this.router || this.$router;
    },
    handleRouteChange(type: NavigateActionType, route?: IRoute, routeConfig?: IRouteConfig) {
      this.preRouter = this.currentRoute;
      this.currentRoute = route;
      this.currentRouteConfig = routeConfig;
      this.actionType = type;
      this.currentPageId = route && route.id;
    },
    handleRouteDestroy(ids: string[]) {
      ids.forEach(id => {
        const vnode = this.vnodeCache.get(id);
        if (vnode && vnode.componentInstance) {
          vnode.componentInstance.$destroy();
        }
        this.vnodeCache.delete(id);
      });
    },
    getTransitionProps(): Partial<ITransitionOptions> {
      const props: Partial<ITransitionOptions> = {};
      if (this.transition) {
        if (this.transition.name) {
          props.name = `${this.transition.name}-${this.actionType}`;
        }
        props.duration = this.transition.duration;
        props.mode = this.transition.mode;
      }
      return props;
    },
    getTransitionListener() {
      return {
        beforeEnter: this.handleTransitionBeforeEnter,
        afterEnter: this.handleTransitionAfterEnter,
        beforeLeave: this.handleTransitionBeforeLeave,
        afterLeave: this.handleTransitionAfterLeave
      };
    },
    getPageViewProps(): IPageViewProps {
      const props: IPageViewProps = {
        path: '/',
        params: {},
        query: {},
        state: undefined
      };
      if (this.currentRoute) {
        const { path, params, query, state } = this.currentRoute;
        Object.assign(props, { params, query, state, path });
      }
      return props;
    },
    handleTransitionBeforeEnter() {
      // todo
    },
    handleTransitionAfterEnter() {
      // todo
    },
    handleTransitionBeforeLeave() {
      // todo
    },
    handleTransitionAfterLeave() {
      // todo
    }
  }
});
